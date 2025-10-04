import prisma from "../config/prisma";
import { Discount, OrderStatus, Prisma } from "@prisma/client";
import EmailService from "./EmailService";
import cloudinary from "../config/cloudinary";
import { UserOrderReads } from "../queries/UserOrderReads";
import { OrderMappers } from "../mappers/OrderMappers";
import { UserOrderMutations } from "../mutations/UserOrderMutations";
interface CreateOrderPayload {
  userId: string;
  addressId: number;
  storeId: number;
  shippingCost: string;
  paymentMethodId: number;
  promoCode?: string | null;
}
class OrderService {
  public static async createOrder(payload: CreateOrderPayload) {
    const {
      userId,
      addressId,
      storeId,
      shippingCost,
      paymentMethodId,
      promoCode,
    } = payload;
    return prisma.$transaction(async (tx) => {
      const userCart = await tx.cart.findFirst({
        where: { user_id: userId, store_id: storeId },
        include: { cartItems: { include: { product: true } } },
      });
      if (!userCart || userCart.cartItems.length === 0) {
        throw new Error("Your cart is empty. Please add items to continue.");
      }
      for (const item of userCart.cartItems) {
        const productStock = await tx.productStocks.findUnique({
          where: {
            store_id_product_id: {
              store_id: userCart.store_id,
              product_id: item.product_id,
            },
          },
        });
        if (!productStock || productStock.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.name}. Only ${
              productStock?.stock_quantity || 0
            } left.`
          );
        }
      }
      const userAddress = await tx.userAddress.findFirst({
        where: { id: addressId, user_id: userId },
      });
      if (!userAddress) {
        throw new Error("Address not found or does not belong to the user.");
      }
      const {name, phone, street, detail, subdistrict, district, city, province, postal_code,} = userAddress;
      const destinationAddress = [
        `${name} (${phone})`,
        street,
        detail,
        subdistrict,
        district,
        `${city}, ${province} ${postal_code}`,
      ]
        .filter(Boolean)
        .join(", ");
      const shippingCostNum = parseFloat(shippingCost);
      if (isNaN(shippingCostNum)) {
        throw new Error("Invalid shipping cost format.");
      }
      const subtotal = userCart.cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      let productDiscount = 0;
      let shippingDiscount = 0;
      let finalAppliedDiscount: Discount | null = null;
      let isB1G1 = false;
      let b1g1ProductId: number | null = null;

      if (promoCode) {
        const foundDiscount = await tx.discount.findFirst({
          where: {
            code: promoCode,
            is_deleted: false,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
            OR: [{ store_id: null }, { store_id: storeId }],
          },
        });

        if (foundDiscount) {
          const meetsMinPurchase =
            !foundDiscount.minPurch ||
            new Prisma.Decimal(subtotal).gte(foundDiscount.minPurch);

          if (meetsMinPurchase) {
            finalAppliedDiscount = foundDiscount;
            if (finalAppliedDiscount.type === "FREE_ONGKIR") {
              shippingDiscount = shippingCostNum;
            } else if (finalAppliedDiscount.type === "B1G1") {
              isB1G1 = true;
              b1g1ProductId = finalAppliedDiscount.product_id;
              productDiscount = 0; // B1G1 is a quantity bonus, not a price discount.
            } else if (finalAppliedDiscount.discAmount) {
              if (finalAppliedDiscount.valueType === "PERCENTAGE") {
                productDiscount =
                  (subtotal * Number(finalAppliedDiscount.discAmount)) / 100;
              } else {
                productDiscount = Number(finalAppliedDiscount.discAmount);
              }
            }
          }
        }
      }

      // Re-validate stock with B1G1 logic
      for (const item of userCart.cartItems) {
        const productStock = await tx.productStocks.findUniqueOrThrow({
          where: {
            store_id_product_id: { store_id: userCart.store_id, product_id: item.product_id,},
          },
        });
        let requiredStock = item.quantity;
        if (isB1G1 && item.product_id === b1g1ProductId) {
          requiredStock *= 2; // Double the stock requirement
        }
        if (productStock.stock_quantity < requiredStock) {
          throw new Error( `Insufficient stock for ${item.product.name}. Required: ${requiredStock}, Available: ${productStock.stock_quantity}`);
        }
      }
      
      const finalUserCart = {
        ...userCart,
        cartItems: userCart.cartItems.map(item => {
            if (isB1G1 && item.product_id === b1g1ProductId) {
                return { ...item, quantity: item.quantity * 2 };
            }
            return item;
        }),
      };

      productDiscount = Math.min(subtotal, productDiscount);
      shippingDiscount = Math.min(shippingCostNum, shippingDiscount);
      const totalDiscount = productDiscount + shippingDiscount;
      const totalPrice = Math.max(
        0,
        subtotal + shippingCostNum - totalDiscount
      );

      return await UserOrderMutations.createOrderTransaction({
        tx,
        userId,
        storeId,
        userCart: finalUserCart,
        userAddress,
        destinationAddress,
        paymentMethodId,
        subtotal: subtotal,
        shippingCost: shippingCostNum,
        discountAmount: totalDiscount,
        totalPrice: totalPrice,
        finalAppliedDiscount,
      });
    }, {timeout : 20000});
  }
  public static async getOrderById(userId: string, orderId: number) {
    const order = await UserOrderReads.getFullOrderDetail(userId, orderId);
    return OrderMappers.formatOrderForUserDetailResponse(order as any);
  }
  public static async getMyOrders(params: {
    userId: string;
    page: string;
    limit: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return UserOrderReads.getPaginatedUserOrders(params);
  }
  public static async cancelOrder(userId: string, orderId: number) {
    const order = await UserOrderMutations.cancelOrderTransaction(
      userId,
      orderId
    );
    await EmailService.sendAdminOrderCancelledEmail(order.user, order as any);
  }
  public static async confirmReceipt(userId: string, orderId: number) {
    await UserOrderMutations.confirmReceiptTransaction(userId, orderId);
  }
  public static async validateRepay(userId: string, orderId: number) {
    await UserOrderMutations.validateRepay(userId, orderId);
  }
  public static async uploadPaymentProof(
    userId: string,
    orderId: number,
    file?: Express.Multer.File
  ) {
    let imageUrl = "";
    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "payment_proofs", resource_type: "image" },
            (error, uploaded) => {
              if (error) reject(error);
              else resolve(uploaded);
            }
          )
          .end(file.buffer);
      });
      imageUrl = result.secure_url;
    } else {
      if (process.env.NODE_ENV === "production") {
        throw new Error("A payment proof file is required.");
      }
      imageUrl = `https://placehold.co/600x400/png?text=DEV+Payment+Proof\\nOrder+${orderId}`;
    }
    await UserOrderMutations.uploadPaymentProofTransaction(
      userId,
      orderId,
      imageUrl
    );
  }
}
export default OrderService;