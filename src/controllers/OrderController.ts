import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import cloudinary from "../config/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { Discount, Prisma } from "@prisma/client";

class OrderController {
  public static createOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { addressId, shippingCost, paymentMethodId, promoCode } = req.body;

      // shippingCost is now expected as a string
      if (
        typeof addressId !== "number" ||
        typeof shippingCost !== "string" ||
        typeof paymentMethodId !== "number"
      ) {
        return ApiResponse.error(
          res,
          "Invalid data types for required fields",
          400
        );
      }

      const newOrder = await prisma.$transaction(async (tx) => {
        const userCart = await tx.cart.findUnique({
          where: { user_id: userId },
          include: { cartItems: { include: { product: true } } },
        });

        if (!userCart || userCart.cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        const userAddress = await tx.userAddress.findFirst({
          where: { id: addressId, user_id: userId },
        });

        if (!userAddress) {
          throw new Error("Address not found or does not belong to user");
        }

        const shippingCostNum = parseFloat(shippingCost);
        if (isNaN(shippingCostNum)) {
          throw new Error("Invalid shipping cost format");
        }

        const subtotal = userCart.cartItems.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );

        let productDiscount = 0;
        let shippingDiscount = 0;
        let finalAppliedDiscount: Discount | null = null;

        if (promoCode) {
          const foundDiscount = await tx.discount.findFirst({
            where: {
              code: promoCode,
              is_deleted: false,
              start_date: { lte: new Date() },
              end_date: { gte: new Date() },
            },
          });

          if (foundDiscount) {
            const meetsMinPurchase =
              !foundDiscount.minPurch ||
              new Prisma.Decimal(subtotal).gte(foundDiscount.minPurch);

            if (meetsMinPurchase) {
              finalAppliedDiscount = foundDiscount; // Assign here only if valid

              switch (finalAppliedDiscount.type) {
                case "MANUAL":
                case "MIN_PURCHASE":
                  if (finalAppliedDiscount.discAmount) {
                    if (finalAppliedDiscount.valueType === "PERCENTAGE") {
                      productDiscount =
                        (subtotal * Number(finalAppliedDiscount.discAmount)) /
                        100;
                    } else {
                      // Assumes NOMINAL
                      productDiscount = Number(finalAppliedDiscount.discAmount);
                    }
                  }
                  break;

                case "B1G1":
                  if (
                    finalAppliedDiscount.product_id &&
                    finalAppliedDiscount.minQty &&
                    finalAppliedDiscount.freeQty
                  ) {
                    const targetItem = userCart.cartItems.find(
                      (item) =>
                        item.product_id === finalAppliedDiscount!.product_id
                    );
                    if (
                      targetItem &&
                      targetItem.quantity >= finalAppliedDiscount.minQty
                    ) {
                      const timesToApply = Math.floor(
                        targetItem.quantity / finalAppliedDiscount.minQty
                      );
                      const freeItemsCount =
                        timesToApply * finalAppliedDiscount.freeQty;
                      productDiscount =
                        Number(targetItem.product.price) * freeItemsCount;
                    }
                  }
                  break;

                case "FREE_ONGKIR":
                  shippingDiscount = shippingCostNum;
                  break;
              }
            } else {
              console.warn(
                `Promo code ${promoCode} did not meet minimum purchase requirement.`
              );
            }
          } else {
            console.warn(`Invalid or expired promo code applied: ${promoCode}`);
          }
        }

        // Final safeguards for calculated discounts
        productDiscount = Math.min(subtotal, productDiscount);
        shippingDiscount = Math.min(shippingCostNum, shippingDiscount);

        const totalPrice = Math.max(
          0,
          subtotal - productDiscount + (shippingCostNum - shippingDiscount)
        );

        const {
          name,
          phone,
          street,
          detail,
          subdistrict,
          district,
          city,
          province,
          postal_code,
        } = userAddress;

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

        const order = await tx.order.create({
          data: {
            user_id: userId,
            store_id: userCart.store_id,
            destination_address: destinationAddress,
            latitude: userAddress.latitude,
            longitude: userAddress.longitude,
            total_price: totalPrice,
            order_status_id: 1, // Assumes 1 = PENDING_PAYMENT
          },
        });

        await tx.orderItem.createMany({
          data: userCart.cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.product.price,
          })),
        });

        await tx.payment.create({
          data: {
            order_id: order.id,
            payment_method_id: paymentMethodId,
            amount: totalPrice,
            status: "PENDING",
          },
        });

        if (finalAppliedDiscount) {
          await tx.discountUsage.create({
            data: {
              discount_id: finalAppliedDiscount.id,
              user_id: userId,
              order_id: order.id,
              status: "APPLIED",
            },
          });
        }

        await tx.cartItem.deleteMany({ where: { cart_id: userCart.id } });
        await tx.cart.update({
          where: { id: userCart.id },
          data: { total_quantity: 0, total_price: 0 },
        });

        return order;
      });

      return ApiResponse.success(
        res,
        { orderId: newOrder.id },
        "Order created successfully",
        201
      );
    }
  );

  public static getOrderById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required in the URL", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid order ID", 400);
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          user_id: userId,
        },
        include: {
          store: true,
          orderStatus: true,
          payments: {
            include: {
              paymentMethod: true,
            },
          },
          orderItems: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        return ApiResponse.error(res, "Order not found", 404);
      }

      const subtotal = order.orderItems.reduce(
        (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
        0
      );

      const discountUsage = await prisma.discountUsage.findFirst({
        where: { order_id: order.id },
        include: { discount: true },
      });

      let discountAmount = 0;
      if (discountUsage?.discount) {
        const discount = discountUsage.discount;
        if (discount.valueType === "PERCENTAGE" && discount.discAmount) {
          discountAmount = (subtotal * Number(discount.discAmount)) / 100;
        } else if (discount.type === "B1G1") {
          // Recalculate B1G1 discount for display
          const targetItem = order.orderItems.find(
            (item) => item.product_id === discount.product_id
          );
          if (
            targetItem &&
            discount.minQty &&
            discount.freeQty &&
            targetItem.quantity >= discount.minQty
          ) {
            const timesToApply = Math.floor(
              targetItem.quantity / discount.minQty
            );
            const freeItemsCount = timesToApply * discount.freeQty;
            discountAmount = Number(targetItem.price_at_purchase) * freeItemsCount;
          }
        } else {
          discountAmount = Number(discount.discAmount) || 0;
        }
      }
      
      // Ensure discount isn't larger than subtotal
      discountAmount = Math.min(subtotal, discountAmount);

      const shippingCost =
        Number(order.total_price) - (subtotal - discountAmount);

      const formattedOrder = {
        id: order.id,
        createdAt: order.created_at,
        totalPrice: order.total_price.toString(),
        subtotal: subtotal.toString(),
        shippingCost: (shippingCost > 0 ? shippingCost : 0).toString(),
        discountAmount: discountAmount.toString(),
        destinationAddress: order.destination_address,
        store: {
          id: order.store.id,
          name: order.store.name,
        },
        status: order.orderStatus.status,
        payment: order.payments[0]
          ? {
              method: order.payments[0].paymentMethod.name,
              status: order.payments[0].status,
            }
          : null,
        items: order.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price_at_purchase.toString(),
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl:
              item.product.images[0]?.image_url ||
              "https://placehold.co/400x400/png",
          },
        })),
      };

      return ApiResponse.success(
        res,
        formattedOrder,
        "Order fetched successfully"
      );
    }
  );

  public static uploadPaymentProof = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is require", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid order ID", 400);
      }

      await prisma.$transaction(async (tx) => {
        // 1. Find the order and its pending payment
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            user_id: userId,
            order_status_id: 1, // PENDING_PAYMENT
          },
          include: {
            payments: {
              where: { status: "PENDING" },
            },
          },
        });

        if (!order) {
          throw new Error("Order not found or not awaiting payment.");
        }

        const payment = order.payments[0];
        if (!payment) {
          throw new Error("No pending payment record found for this order.");
        }

        let imageUrl = "";

        // 2. Handle file upload or placeholder for testing
        if (req.file) {
          const file = req.file;
          // Real upload logic
          const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "payment_proofs",
                  resource_type: "image",
                },
                (error, uploaded) => {
                  if (error) reject(error);
                  else resolve(uploaded);
                }
              )
              .end(file.buffer);
          });
          imageUrl = result.secure_url;
        } else if (process.env.NODE_ENV !== "production") {
          // Placeholder logic for testing (only works if no file is sent)
          console.log(
            "--- DEV MODE: No file uploaded, using placeholder proof ---"
          );
          imageUrl = `https://placehold.co/600x400/png?text=Payment+Proof\\nOrder+${orderId}\\n${new Date().toLocaleTimeString()}`;
        } else {
          // Production requires a file
          throw new Error("No file uploaded");
        }

        // 3. Create PaymentProof record
        await tx.paymentProof.create({
          data: {
            payment_id: payment.id,
            image_url: imageUrl,
          },
        });

        // 4. Update order status to PAID (awaiting confirmation)
        // From seed.ts: { id: 2, status: OrderStatus.PAID }
        await tx.order.update({
          where: { id: orderId },
          data: {
            order_status_id: 2,
          },
        });
      });

      return ApiResponse.success(
        res,
        null,
        "Payment proof uploaded. Awaiting confirmation.",
        200
      );
    }
  );

  public static getAllOrderData = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      try {
        const result = await prisma.order.findMany();
        ApiResponse.success(res, result, "Get all order success", 200);
      } catch (error) {
        ApiResponse.error(res, "Error get all order", 400);
      }
    }
  );
}

export default OrderController;