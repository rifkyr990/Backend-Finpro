import prisma from "../config/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import EmailService from "./EmailService";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  store_id?: number | null;
};

class AdminOrderService {
  public static async getAllAdminOrders(params: {
    user: AuthenticatedUser;
    query: any;
  }) {
    const { user, query } = params;
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { search, status, storeId, startDate, endDate } = query;

    const whereClause: Prisma.OrderWhereInput = {};

    if (user.role === "STORE_ADMIN") {
      if (!user.store_id) {
        throw new Error("Admin not assigned to a store.");
      }
      whereClause.store_id = user.store_id;
    } else if (user.role === "SUPER_ADMIN" && storeId && storeId !== "all") {
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
        { user: { first_name: { contains: searchString, mode: "insensitive" } } },
        { user: { last_name: { contains: searchString, mode: "insensitive" } } },
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
      totalItems: order.orderItems.reduce((sum, i) => sum + i.quantity, 0),
      status: order.orderStatus.status,
    }));

    return {
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    };
  }

  public static async getAdminOrderDetail(
    user: AuthenticatedUser,
    orderId: number
  ) {
    const whereClause: Prisma.OrderWhereInput = { id: orderId };
    if (user.role === "STORE_ADMIN") {
      if (!user.store_id) {
        throw new Error("Store admin is not assigned to a store.");
      }
      whereClause.store_id = user.store_id;
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        user: true,
        store: true,
        orderStatus: true,
        orderItems: {
          include: { product: { include: { images: { take: 1 } } } },
        },
        payments: { include: { paymentMethod: true, proof: true } },
      },
    });

    if (!order) {
      throw new Error("Order not found or access denied.");
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
      const { discount } = discountUsage;
      if (discount.type === "B1G1") {
        const target = order.orderItems.find(
          (i) => i.product_id === discount.product_id
        );
        if (target) discountAmount = Number(target.price_at_purchase);
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
      status: order.orderStatus.status,
      customer: {
        name: `${order.user.first_name} ${order.user.last_name}`,
        email: order.user.email,
        phone: order.user.phone,
      },
      store: { name: order.store.name },
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
  }

  public static async confirmPayment(orderId: number) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payments: true, user: true },
      });
      if (!order || !order.user) throw new Error("Order or user not found.");
      if (order.order_status_id !== 2)
        throw new Error("Order not awaiting confirmation.");

      const payment = order.payments.find((p) => p.status === "PENDING");
      if (!payment) throw new Error("No pending payment found.");

      const newStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "PROCESSING" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: newStatus.id },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paid_at: new Date() },
      });
      await EmailService.sendPaymentConfirmedEmail(order.user, order);
    });
  }

  public static async rejectPayment(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order || !order.user) throw new Error("Order or user not found.");
    if (order.order_status_id !== 2)
      throw new Error("Order not awaiting confirmation.");
    
    const newStatus = await prisma.orderStatuses.findUniqueOrThrow({
      where: { status: "PENDING_PAYMENT" },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { order_status_id: newStatus.id },
    });
    await prisma.paymentProof.deleteMany({
      where: { payment: { order_id: orderId } },
    });
    await EmailService.sendPaymentRejectedEmail(order.user, order);
  }

  public static async sendOrder(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order || !order.user) throw new Error("Order or user not found.");
    if (order.order_status_id !== 3) throw new Error("Order not processing.");
    
    const newStatus = await prisma.orderStatuses.findUniqueOrThrow({
      where: { status: "SHIPPED" },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { order_status_id: newStatus.id },
    });
    await EmailService.sendOrderShippedEmail(order.user, order);
  }

  public static async adminCancelOrder(orderId: number, adminId: string) {
    await prisma.$transaction(async (tx) => {
      const [order, admin] = await Promise.all([
        tx.order.findUnique({
          where: { id: orderId },
          include: { orderStatus: true, orderItems: true, user: true },
        }),
        tx.user.findUnique({ where: { id: adminId } }),
      ]);
      if (!order || !admin || !order.user) throw new Error("Data missing.");
      if (!["PAID", "PROCESSING"].includes(order.orderStatus.status))
        throw new Error("Order cannot be cancelled at this stage.");
      
      const newStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "CANCELLED" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: newStatus.id },
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
      await EmailService.sendUserOrderCancelledEmail(order.user, order as any);
    });
  }

  public static async markAsRefunded(orderId: number) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          orderStatus: { status: "CANCELLED" },
          payments: { some: { status: "SUCCESS" } },
        },
        include: { payments: true },
      });
      if (!order) throw new Error("Order not eligible for refund.");
      
      const payment = order.payments.find((p) => p.status === "SUCCESS");
      if (!payment) throw new Error("No successful payment to refund.");

      const newStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "REFUNDED" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: newStatus.id },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
    });
  }

  public static async getOrderSummary(user: AuthenticatedUser) {
    const whereClause: Prisma.OrderWhereInput = {};
    if (user.role === "STORE_ADMIN") {
      if (!user.store_id) throw new Error("Admin not assigned to a store.");
      whereClause.store_id = user.store_id;
    }
    const summaryData = await prisma.order.groupBy({
      by: ["order_status_id"],
      _count: { id: true },
      where: whereClause,
    });
    const statuses = await prisma.orderStatuses.findMany({
      select: { id: true, status: true },
    });
    const statusMap = new Map(statuses.map((s) => [s.id, s.status]));
    const formatted = summaryData.reduce((acc, curr) => {
      const statusName = statusMap.get(curr.order_status_id);
      if (statusName) acc[statusName] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);
    return formatted;
  }
}

export default AdminOrderService;