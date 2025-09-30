"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOrderMutations = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class UserOrderMutations {
    static async createOrderTransaction(payload) {
        const { tx, userId, storeId, userCart, userAddress, destinationAddress, paymentMethodId, subtotal, shippingCost, discountAmount, totalPrice, finalAppliedDiscount, } = payload;
        const order = await tx.order.create({
            data: {
                user_id: userId,
                store_id: storeId,
                destination_address: destinationAddress,
                latitude: userAddress.latitude,
                longitude: userAddress.longitude,
                subtotal: subtotal,
                shipping_cost: shippingCost,
                discount_amount: discountAmount,
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
                data: { discount_id: finalAppliedDiscount.id, user_id: userId, order_id: order.id, status: "APPLIED" },
            });
        }
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
        await tx.cartItem.deleteMany({ where: { cart_id: userCart.id } });
        await tx.cart.update({
            where: { id: userCart.id },
            data: { total_quantity: 0, total_price: 0 },
        });
        return order;
    }
    static async cancelOrderTransaction(userId, orderId) {
        return prisma_1.default.$transaction(async (tx) => {
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
            return order;
        });
    }
    static async confirmReceiptTransaction(userId, orderId) {
        const order = await prisma_1.default.order.findFirst({
            where: {
                id: orderId,
                user_id: userId,
                orderStatus: { status: "SHIPPED" },
            },
        });
        if (!order) {
            throw new Error("Order not found or is not in 'Shipped' status.");
        }
        const deliveredStatus = await prisma_1.default.orderStatuses.findUniqueOrThrow({
            where: { status: "DELIVERED" },
        });
        return prisma_1.default.order.update({
            where: { id: orderId },
            data: { order_status_id: deliveredStatus.id },
        });
    }
    static async validateRepay(userId, orderId) {
        const order = await prisma_1.default.order.findFirst({
            where: {
                id: orderId,
                user_id: userId,
                orderStatus: { status: "PENDING_PAYMENT" },
            },
        });
        if (!order) {
            throw new Error("Order not found or is not pending payment.");
        }
        return true;
    }
    static async uploadPaymentProofTransaction(userId, orderId, imageUrl) {
        return prisma_1.default.$transaction(async (tx) => {
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
exports.UserOrderMutations = UserOrderMutations;
//# sourceMappingURL=UserOrderMutations.js.map