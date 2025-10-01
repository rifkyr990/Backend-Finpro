import prisma from "../config/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

interface GetMyOrdersParams {
  userId: string;
  page: string;
  limit: string;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class UserOrderReads {
  public static async getPaginatedUserOrders(params: GetMyOrdersParams) {
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

  public static async getFullOrderDetail(userId: string, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: {
        store: true,
        orderStatus: true,
        payments: { include: { paymentMethod: true } },
        orderItems: {
          include: { product: { include: { images: { take: 1 } } } },
        },
        DiscountUsage: { include: { discount: true } },
      },
    });

    if (!order) {
      throw new Error("Order not found or access denied.");
    }
    return order;
  }
}