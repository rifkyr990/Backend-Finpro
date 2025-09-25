import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import EmailService from "../services/EmailService";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { OrderStatus, Prisma } from "@prisma/client";

class AdminOrderController {
  public static getAllAdminOrders = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role;
      const userStoreId = req.user?.store_id;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const { search, status, storeId, startDate, endDate } = req.query;

      const whereClause: Prisma.OrderWhereInput = {};

      if (userRole === "STORE_ADMIN") {
        if (!userStoreId) {
          return ApiResponse.error(res, "Admin not assigned to a store.", 403);
        }
        whereClause.store_id = userStoreId;
      } else if (userRole === "SUPER_ADMIN" && storeId && storeId !== "all") {
        whereClause.store_id = parseInt(storeId as string);
      }

      if (status && status !== "ALL") {
        whereClause.orderStatus = { status: status as OrderStatus };
      }

      if (startDate && endDate) {
        whereClause.created_at = {
          gte: new Date(startDate as string),
          lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999)),
        };
      }

      if (search) {
        const searchString = search as string;
        const searchNumber = parseInt(searchString, 10);

        const orConditions: Prisma.OrderWhereInput[] = [
          {
            user: {
              first_name: { contains: searchString, mode: "insensitive" },
            },
          },
          {
            user: {
              last_name: { contains: searchString, mode: "insensitive" },
            },
          },
        ];

        if (!isNaN(searchNumber)) {
          orConditions.push({ id: searchNumber });
        }

        whereClause.OR = orConditions;
      }

      const [orders, totalOrders] = await prisma.$transaction([
        prisma.order.findMany({
          where: whereClause,
          include: {
            user: true,
            store: true,
            orderStatus: true,
            orderItems: true,
          },
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: whereClause }),
      ]);

      const formattedOrders = orders.map((order) => ({
        id: order.id,
        createdAt: order.created_at,
        customerName: `${order.user.first_name} ${order.user.last_name}`,
        storeName: order.store.name,
        totalPrice: order.total_price.toString(),
        totalItems: order.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        status: order.orderStatus.status,
      }));

      return ApiResponse.success(
        res,
        {
          orders: formattedOrders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
          },
        },
        "Admin orders fetched successfully"
      );
    }
  );

  public static getAdminOrderDetail = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role;
      const userStoreId = req.user?.store_id;

      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid Order ID", 400);
      }

      const whereClause: Prisma.OrderWhereInput = { id: orderId };

      if (userRole === "STORE_ADMIN") {
        if (!userStoreId) {
          return ApiResponse.error(
            res,
            "Store admin is not assigned to a store.",
            403
          );
        }
        whereClause.store_id = userStoreId;
      }

      const order = await prisma.order.findFirst({
        where: whereClause,
        include: {
          user: true,
          store: true,
          orderStatus: true,
          orderItems: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
          payments: {
            include: {
              paymentMethod: true,
              proof: true,
            },
          },
        },
      });

      if (!order) {
        return ApiResponse.error(res, "Order not found or access denied.", 404);
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
            discountAmount =
              Number(targetItem.price_at_purchase) * freeItemsCount;
          }
        } else {
          discountAmount = Number(discount.discAmount) || 0;
        }
      }
      discountAmount = Math.min(subtotal, discountAmount);

      const shippingCost =
        Number(order.total_price) - (subtotal - discountAmount);

      const formattedOrder = {
        id: order.id,
        createdAt: order.created_at,
        status: order.orderStatus.status,
        customer: {
          name: `${order.user.first_name} ${order.user.last_name}`,
          email: order.user.email,
          phone: order.user.phone,
        },
        store: {
          name: order.store.name,
        },
        shipping: {
          address: order.destination_address,
          cost: (shippingCost > 0 ? shippingCost : 0).toString(),
        },
        payment: {
          method: order.payments[0]?.paymentMethod.name || "N/A",
          status: order.payments[0]?.status || "N/A",
          proofUrl: order.payments[0]?.proof?.image_url || null,
        },
        pricing: {
          subtotal: subtotal.toString(),
          discount: discountAmount.toString(),
          total: order.total_price.toString(),
        },
        items: order.orderItems.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price_at_purchase.toString(),
          imageUrl: item.product.images[0]?.image_url || "/fallback.png",
        })),
      };

      return ApiResponse.success(
        res,
        formattedOrder,
        "Admin order detail fetched."
      );
    }
  );

  public static confirmPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { payments: true, user: true },
        });

        if (!order || !order.user) {
          throw new Error("Order not found or user data is missing.");
        }
        if (order.order_status_id !== 2) {
          // Status should be PAID (awaiting confirmation)
          throw new Error("Order is not awaiting payment confirmation.");
        }

        const paymentToConfirm = order.payments.find(
          (p) => p.status === "PENDING"
        );
        if (!paymentToConfirm) {
          throw new Error(
            "No pending payment record found for this order to confirm."
          );
        }

        const processingStatus = await tx.orderStatuses.findUniqueOrThrow({
          where: { status: "PROCESSING" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { order_status_id: processingStatus.id },
        });

        await tx.payment.update({
          where: { id: paymentToConfirm.id },
          data: { status: "SUCCESS", paid_at: new Date() },
        });

        await EmailService.sendPaymentConfirmedEmail(order.user, order);
      });

      return ApiResponse.success(
        res,
        null,
        "Payment confirmed. Order is now processing."
      );
    }
  );

  public static rejectPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order || !order.user)
        throw new Error("Order not found or user data is missing.");
      if (order.order_status_id !== 2)
        throw new Error("Order is not awaiting payment confirmation.");

      const pendingStatus = await prisma.orderStatuses.findUniqueOrThrow({
        where: { status: "PENDING_PAYMENT" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { order_status_id: pendingStatus.id },
      });

      await prisma.paymentProof.deleteMany({
        where: { payment: { order_id: orderId } },
      });

      await EmailService.sendPaymentRejectedEmail(order.user, order);

      return ApiResponse.success(
        res,
        null,
        "Payment rejected. Order is now pending payment again."
      );
    }
  );

  public static sendOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order || !order.user)
        throw new Error("Order not found or user data is missing.");
      if (order.order_status_id !== 3)
        throw new Error("Order is not in processing status.");

      const shippedStatus = await prisma.orderStatuses.findUniqueOrThrow({
        where: { status: "SHIPPED" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { order_status_id: shippedStatus.id },
      });

      await EmailService.sendOrderShippedEmail(order.user, order);

      return ApiResponse.success(res, null, "Order marked as shipped.");
    }
  );

  public static adminCancelOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      const adminId = req.user?.id;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (!adminId) return ApiResponse.error(res, "Unauthorized", 401);

      await prisma.$transaction(async (tx) => {
        const [order, admin] = await Promise.all([
          tx.order.findUnique({
            where: { id: orderId },
            include: { orderStatus: true, orderItems: true, user: true },
          }),
          tx.user.findUnique({ where: { id: adminId } }),
        ]);

        if (!order || !admin || !order.user)
          throw new Error("Order, Admin, or User data is missing.");

        const cancellableStatuses: OrderStatus[] = ["PAID", "PROCESSING"];
        if (!cancellableStatuses.includes(order.orderStatus.status)) {
          throw new Error(
            "This order cannot be cancelled by an admin at its current stage."
          );
        }

        const cancelledStatus = await tx.orderStatuses.findUniqueOrThrow({
          where: { status: "CANCELLED" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { order_status_id: cancelledStatus.id },
        });

        for (const item of order.orderItems) {
          const productStock = await tx.productStocks.findUniqueOrThrow({
            where: {
              store_id_product_id: {
                store_id: order.store_id,
                product_id: item.product_id,
              },
            },
          });
          const newStockQuantity = productStock.stock_quantity + item.quantity;
          await tx.productStocks.update({
            where: { id: productStock.id },
            data: { stock_quantity: newStockQuantity },
          });
          await tx.stockHistory.create({
            data: {
              type: "IN",
              quantity: item.quantity,
              prev_stock: productStock.stock_quantity,
              updated_stock: newStockQuantity,
              min_stock: productStock.min_stock,
              reason: `Order #${order.id} cancelled by admin`,
              order_id: order.id,
              productStockId: productStock.id,
              user_id: adminId,
              created_by_name: `${admin.first_name} ${admin.last_name}`,
            },
          });
        }

        await tx.discountUsage.updateMany({
          where: { order_id: orderId, status: "APPLIED" },
          data: { status: "CANCELLED" },
        });

        await EmailService.sendUserOrderCancelledEmail(
          order.user,
          order as any
        );
      });

      return ApiResponse.success(
        res,
        null,
        "Order successfully cancelled by admin."
      );
    }
  );

  public static markAsRefunded = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            orderStatus: { status: "CANCELLED" },
            payments: { some: { status: "SUCCESS" } },
          },
          include: { payments: true },
        });

        if (!order) {
          throw new Error(
            "Order not found, is not cancelled, or was not successfully paid for."
          );
        }

        const paymentToRefund = order.payments.find(
          (p) => p.status === "SUCCESS"
        );
        if (!paymentToRefund) {
          throw new Error(
            "Could not find a successful payment record to refund."
          );
        }

        const refundedStatus = await tx.orderStatuses.findUniqueOrThrow({
          where: { status: "REFUNDED" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { order_status_id: refundedStatus.id },
        });

        await tx.payment.update({
          where: { id: paymentToRefund.id },
          data: { status: "REFUNDED" },
        });
      });

      return ApiResponse.success(
        res,
        null,
        "Order successfully marked as refunded."
      );
    }
  );

  public static getOrderSummary = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role;
      const userStoreId = req.user?.store_id;

      const whereClause: Prisma.OrderWhereInput = {};

      if (userRole === "STORE_ADMIN") {
        if (!userStoreId) {
          return ApiResponse.error(res, "Admin not assigned to a store.", 403);
        }
        whereClause.store_id = userStoreId;
      }

      const summaryData = await prisma.order.groupBy({
        by: ["order_status_id"],
        _count: {
          id: true,
        },
        where: whereClause,
      });

      const statuses = await prisma.orderStatuses.findMany({
        select: { id: true, status: true },
      });

      const statusMap = new Map(statuses.map((s) => [s.id, s.status]));

      const formattedSummary = summaryData.reduce((acc, curr) => {
        const statusName = statusMap.get(curr.order_status_id);
        if (statusName) {
          acc[statusName] = curr._count.id;
        }
        return acc;
      }, {} as Record<string, number>);

      return ApiResponse.success(
        res,
        formattedSummary,
        "Order summary fetched successfully."
      );
    }
  );
}

export default AdminOrderController;