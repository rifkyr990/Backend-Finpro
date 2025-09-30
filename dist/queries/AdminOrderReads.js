"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOrderReads = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AdminOrderReads {
    static async getPaginatedAdminOrders(user, query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const whereClause = this.buildWhereClause(user, query);
        const [orders, totalOrders] = await prisma_1.default.$transaction([
            prisma_1.default.order.findMany({
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
            prisma_1.default.order.count({ where: whereClause }),
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
    static buildWhereClause(user, filters) {
        const whereClause = {};
        if (user.role === "STORE_ADMIN") {
            if (!user.store_id) {
                throw new Error("Admin not assigned to a store.");
            }
            whereClause.store_id = user.store_id;
        }
        else if (user.role === "SUPER_ADMIN" &&
            filters.storeId &&
            filters.storeId !== "all") {
            whereClause.store_id = parseInt(filters.storeId);
        }
        if (filters.status && filters.status !== "ALL") {
            whereClause.orderStatus = { status: filters.status };
        }
        if (filters.startDate && filters.endDate) {
            whereClause.created_at = {
                gte: new Date(filters.startDate),
                lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)),
            };
        }
        if (filters.search) {
            const searchString = filters.search;
            const searchNumber = parseInt(searchString, 10);
            const orConditions = [
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
    static async getOrderSummary(user) {
        const whereClause = {};
        if (user.role === "STORE_ADMIN") {
            if (!user.store_id)
                throw new Error("Admin not assigned to a store.");
            whereClause.store_id = user.store_id;
        }
        const summaryData = await prisma_1.default.order.groupBy({
            by: ["order_status_id"],
            _count: { id: true },
            where: whereClause,
        });
        const statuses = await prisma_1.default.orderStatuses.findMany({
            select: { id: true, status: true },
        });
        const statusMap = new Map(statuses.map((s) => [s.id, s.status]));
        const formatted = summaryData.reduce((acc, curr) => {
            const statusName = statusMap.get(curr.order_status_id);
            if (statusName)
                acc[statusName] = curr._count.id;
            return acc;
        }, {});
        return formatted;
    }
}
exports.AdminOrderReads = AdminOrderReads;
//# sourceMappingURL=AdminOrderReads.js.map