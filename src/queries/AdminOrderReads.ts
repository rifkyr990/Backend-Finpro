import prisma from "../config/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { AdminOrderQueryParams } from "../types/query-params";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  store_id?: number | null;
};

export class AdminOrderReads {
  public static async getPaginatedAdminOrders(
    user: AuthenticatedUser,
    query: AdminOrderQueryParams
  ) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause = this.buildWhereClause(user, query);

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: { select: { first_name: true, last_name: true } },
          store: { select: { name: true } },
          orderStatus: { select: { status: true } },
          orderItems: { select: { quantity: true } },
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

  private static buildWhereClause(
    user: AuthenticatedUser,
    filters: AdminOrderQueryParams
  ): Prisma.OrderWhereInput {
    const whereClause: Prisma.OrderWhereInput = {};

    if (user.role === "STORE_ADMIN") {
      if (!user.store_id) {
        throw new Error("Admin not assigned to a store.");
      }
      whereClause.store_id = user.store_id;
    } else if (
      user.role === "SUPER_ADMIN" &&
      filters.storeId &&
      filters.storeId !== "all"
    ) {
      whereClause.store_id = parseInt(filters.storeId as string);
    }

    if (filters.status && filters.status !== "ALL") {
      whereClause.orderStatus = { status: filters.status as OrderStatus };
    }

    if (filters.startDate && filters.endDate) {
      whereClause.created_at = {
        gte: new Date(filters.startDate as string),
        lte: new Date(
          new Date(filters.endDate as string).setHours(23, 59, 59, 999)
        ),
      };
    }

    if (filters.search) {
      const searchString = filters.search as string;
      const searchNumber = parseInt(searchString, 10);
      const orConditions: Prisma.OrderWhereInput[] = [
        {
          user: { first_name: { contains: searchString, mode: "insensitive" } },
        },
        {
          user: { last_name: { contains: searchString, mode: "insensitive" } },
        },
      ];
      if (!isNaN(searchNumber)) {
        orConditions.push({ id: searchNumber });
      }
      whereClause.OR = orConditions;
    }

    return whereClause;
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