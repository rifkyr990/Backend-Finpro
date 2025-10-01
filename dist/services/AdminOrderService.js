"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const EmailService_1 = __importDefault(require("./EmailService"));
const OrderMappers_1 = require("../mappers/OrderMappers");
const AdminOrderReads_1 = require("../queries/AdminOrderReads");
const AdminOrderMutations_1 = require("../mutations/AdminOrderMutations");
class AdminOrderService {
    static async getAllAdminOrders(user, query) {
        return AdminOrderReads_1.AdminOrderReads.getPaginatedAdminOrders(user, query);
    }
    static async getAdminOrderDetail(user, orderId) {
        const whereClause = { id: orderId };
        if (user.role === "STORE_ADMIN") {
            if (!user.store_id) {
                throw new Error("Store admin is not assigned to a store.");
            }
            whereClause.store_id = user.store_id;
        }
        const order = await prisma_1.default.order.findFirst({
            where: whereClause,
            include: {
                user: true,
                store: true,
                orderStatus: true,
                orderItems: {
                    include: { product: { include: { images: { take: 1 } } } },
                },
                payments: { include: { paymentMethod: true, proof: true } },
                DiscountUsage: { include: { discount: true } },
            },
        });
        if (!order) {
            throw new Error("Order not found or access denied.");
        }
        return OrderMappers_1.OrderMappers.formatOrderForAdminDetailResponse(order);
    }
    static async confirmPayment(orderId) {
        const order = await AdminOrderMutations_1.AdminOrderMutations.confirmPaymentTransaction(orderId);
        await EmailService_1.default.sendPaymentConfirmedEmail(order.user, order);
    }
    static async rejectPayment(orderId) {
        const order = await AdminOrderMutations_1.AdminOrderMutations.rejectPaymentTransaction(orderId);
        await EmailService_1.default.sendPaymentRejectedEmail(order.user, order);
    }
    static async sendOrder(orderId) {
        const order = await AdminOrderMutations_1.AdminOrderMutations.sendOrderTransaction(orderId);
        await EmailService_1.default.sendOrderShippedEmail(order.user, order);
    }
    static async adminCancelOrder(orderId, adminId) {
        const order = await AdminOrderMutations_1.AdminOrderMutations.adminCancelOrderTransaction(orderId, adminId);
        await EmailService_1.default.sendUserOrderCancelledEmail(order.user, order);
    }
    static async markAsRefunded(orderId) {
        await AdminOrderMutations_1.AdminOrderMutations.markAsRefundedTransaction(orderId);
    }
    static async getOrderSummary(user) {
        return AdminOrderReads_1.AdminOrderReads.getOrderSummary(user);
    }
}
exports.default = AdminOrderService;
//# sourceMappingURL=AdminOrderService.js.map