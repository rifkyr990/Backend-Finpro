"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOrderReads = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class UserOrderReads {
    static async getPaginatedUserOrders(params) {
        const pageNum = parseInt(params.page) || 1;
        const limitNum = parseInt(params.limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const whereClause = { user_id: params.userId };
        if (params.search && !isNaN(parseInt(params.search))) {
            whereClause.id = parseInt(params.search);
        }
        if (params.status && params.status !== "ALL") {
            whereClause.orderStatus = { status: params.status };
        }
        if (params.startDate && params.endDate) {
            whereClause.created_at = {
                gte: new Date(params.startDate),
                lte: new Date(new Date(params.endDate).setHours(23, 59, 59, 999)),
            };
        }
        const [orders, totalOrders] = await prisma_1.default.$transaction([
            prisma_1.default.order.findMany({
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
            prisma_1.default.order.count({ where: whereClause }),
        ]);
        const formattedOrders = orders.map((order) => ({
            id: order.id,
            createdAt: order.created_at,
            totalPrice: order.total_price.toString(),
            status: order.orderStatus.status,
            totalItems: order.orderItems.reduce((sum, i) => sum + i.quantity, 0),
            firstProductImage: order.orderItems[0]?.product.images[0]?.image_url || null,
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
    static async getFullOrderDetail(userId, orderId) {
        const order = await prisma_1.default.order.findFirst({
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
exports.UserOrderReads = UserOrderReads;
//# sourceMappingURL=UserOrderReads.js.map