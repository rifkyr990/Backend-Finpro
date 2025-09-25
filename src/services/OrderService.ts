import prisma from "../config/prisma";
import { Discount, OrderStatus, Prisma } from "@prisma/client";
import EmailService from "./EmailService";
import cloudinary from "../config/cloudinary";

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
      // 1. Fetch Cart and Validate
      const userCart = await tx.cart.findFirst({
        where: { user_id: userId, store_id: storeId },
        include: { cartItems: { include: { product: true } } },
      });

      if (!userCart || userCart.cartItems.length === 0) {
        throw new Error("Your cart is empty. Please add items to continue.");
      }

      // 2. Validate Stock
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

      // 3. Fetch and Format Address
      const userAddress = await tx.userAddress.findFirst({
        where: { id: addressId, user_id: userId },
      });
      if (!userAddress) {
        throw new Error("Address not found or does not belong to the user.");
      }
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

      // 4. Calculate Pricing
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
            finalAppliedDiscount = foundDiscount;
            if (finalAppliedDiscount.type === "FREE_ONGKIR") {
              shippingDiscount = shippingCostNum;
            } else if (finalAppliedDiscount.type === "B1G1") {
              const targetItem = userCart.cartItems.find(
                (item) => item.product_id === finalAppliedDiscount!.product_id
              );
              if (targetItem)
                productDiscount = Number(targetItem.product.price);
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

      productDiscount = Math.min(subtotal, productDiscount);
      shippingDiscount = Math.min(shippingCostNum, shippingDiscount);
      const totalPrice = Math.max(
        0,
        subtotal - productDiscount + (shippingCostNum - shippingDiscount)
      );

      // 5. Create Order and Related Records
      const order = await tx.order.create({
        data: {
          user_id: userId,
          store_id: storeId,
          destination_address: destinationAddress,
          latitude: userAddress.latitude,
          longitude: userAddress.longitude,
          total_price: totalPrice,
          order_status_id: 1, // PENDING_PAYMENT
        },
      });

      await tx.orderItem.createMany({
        data: userCart.cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.product.price,
          store_id: storeId,
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

      // 6. Deduct Stock and Log History
      for (const item of userCart.cartItems) {
        const stock = await tx.productStocks.findUniqueOrThrow({
          where: {
            store_id_product_id: {
              store_id: userCart.store_id,
              product_id: item.product_id,
            },
          },
        });
        const newStock = stock.stock_quantity - item.quantity;
        await tx.productStocks.update({
          where: { id: stock.id },
          data: { stock_quantity: newStock },
        });
        await tx.stockHistory.create({
          data: {
            type: "OUT",
            quantity: item.quantity,
            prev_stock: stock.stock_quantity,
            updated_stock: newStock,
            min_stock: stock.min_stock,
            reason: `Customer Order #${order.id}`,
            order_id: order.id,
            productStockId: stock.id,
            user_id: userId,
            created_by_name: "System",
          },
        });
      }

      // 7. Clear Cart
      await tx.cartItem.deleteMany({ where: { cart_id: userCart.id } });
      await tx.cart.update({
        where: { id: userCart.id },
        data: { total_quantity: 0, total_price: 0 },
      });

      return order;
    });
  }

  public static async getOrderById(userId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: {
        store: true,
        orderStatus: true,
        payments: { include: { paymentMethod: true } },
        orderItems: {
          include: { product: { include: { images: { take: 1 } } } },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found or access denied.");
    }

    const subtotal = order.orderItems.reduce(
      (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
      0
    );

    // Simplified discount calculation logic
    const discountUsage = await prisma.discountUsage.findFirst({
      where: { order_id: order.id },
      include: { discount: true },
    });
    let discountAmount = 0;
    if (discountUsage?.discount) {
      const { discount } = discountUsage;
      if (discount.type === "B1G1") {
        const targetItem = order.orderItems.find(
          (item) => item.product_id === discount.product_id
        );
        if (targetItem)
          discountAmount = Number(targetItem.price_at_purchase);
      } else if (discount.discAmount) {
        if (discount.valueType === "PERCENTAGE") {
          discountAmount = (subtotal * Number(discount.discAmount)) / 100;
        } else {
          discountAmount = Number(discount.discAmount);
        }
      }
    }
    discountAmount = Math.min(subtotal, discountAmount);
    const shippingCost =
      Number(order.total_price) - (subtotal - discountAmount);

    return {
      id: order.id,
      createdAt: order.created_at,
      totalPrice: order.total_price.toString(),
      subtotal: subtotal.toString(),
      shippingCost: (shippingCost > 0 ? shippingCost : 0).toString(),
      discountAmount: discountAmount.toString(),
      destinationAddress: order.destination_address,
      store: { id: order.store.id, name: order.store.name },
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
    const pageNum = parseInt(params.page) || 1;
    const limitNum = parseInt(params.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.OrderWhereInput = { user_id: params.userId };
    if (params.search && !isNaN(parseInt(params.search))) {
      whereClause.id = parseInt(params.search);
    }
    if (params.status && params.status !== "ALL") {
      whereClause.orderStatus = { status: params.status as OrderStatus };
    }
    if (params.startDate && params.endDate) {
      whereClause.created_at = {
        gte: new Date(params.startDate),
        lte: new Date(new Date(params.endDate).setHours(23, 59, 59, 999)),
      };
    }

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        include: {
          orderStatus: true,
          orderItems: {
            include: { product: { include: { images: { take: 1 } } } },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      createdAt: order.created_at,
      totalPrice: order.total_price.toString(),
      status: order.orderStatus.status,
      totalItems: order.orderItems.reduce((sum, i) => sum + i.quantity, 0),
      firstProductImage:
        order.orderItems[0]?.product.images[0]?.image_url || null,
    }));

    return {
      orders: formattedOrders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        totalOrders,
      },
    };
  }

  public static async cancelOrder(userId: string, orderId: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, user_id: userId },
        include: { orderStatus: true, orderItems: true, user: true },
      });

      if (!order || !order.user)
        throw new Error("Order not found or permission denied.");
      if (order.orderStatus.status !== "PENDING_PAYMENT")
        throw new Error("Only orders pending payment can be cancelled.");

      const cancelledStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "CANCELLED" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: cancelledStatus.id },
      });

      for (const item of order.orderItems) {
        await tx.productStocks.update({
          where: {
            store_id_product_id: {
              store_id: order.store_id,
              product_id: item.product_id,
            },
          },
          data: { stock_quantity: { increment: item.quantity } },
        });
      }

      await tx.discountUsage.updateMany({
        where: { order_id: orderId, status: "APPLIED" },
        data: { status: "CANCELLED" },
      });

      await EmailService.sendAdminOrderCancelledEmail(
        order.user,
        order as any
      );
    });
  }

  public static async confirmReceipt(userId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: userId, orderStatus: { status: "SHIPPED" } },
    });

    if (!order) {
      throw new Error("Order not found or is not in 'Shipped' status.");
    }

    const deliveredStatus = await prisma.orderStatuses.findUniqueOrThrow({
      where: { status: "DELIVERED" },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { order_status_id: deliveredStatus.id },
    });
  }

  public static async validateRepay(userId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId,
        orderStatus: { status: "PENDING_PAYMENT" },
      },
    });

    if (!order) {
      throw new Error("Order not found or is not pending payment.");
    }
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

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          user_id: userId,
          order_status_id: 1, // PENDING_PAYMENT
        },
        include: { payments: { where: { status: "PENDING" } } },
      });

      if (!order) {
        throw new Error("Order not found or not awaiting payment.");
      }
      const payment = order.payments[0];
      if (!payment) {
        throw new Error("No pending payment record found for this order.");
      }

      await tx.paymentProof.create({
        data: { payment_id: payment.id, image_url: imageUrl },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: 2 }, // PAID (Awaiting Confirmation)
      });
    });
  }
}

export default OrderService;