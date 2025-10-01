"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const crypto_1 = __importDefault(require("crypto"));
const EmailService_1 = __importDefault(require("../services/EmailService"));
const midtransClient = require("midtrans-client");
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});
class PaymentController {
}
_a = PaymentController;
PaymentController.createTransaction = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    }
    const { orderId } = req.body;
    if (!orderId) {
        return ApiResponse_1.ApiResponse.error(res, "orderId is required", 400);
    }
    const order = await prisma_1.default.order.findFirst({
        where: { id: orderId, user_id: userId },
        include: {
            user: true,
            orderItems: {
                include: {
                    product: true,
                },
            },
            payments: true,
        },
    });
    if (!order) {
        return ApiResponse_1.ApiResponse.error(res, "Order not found", 404);
    }
    const payment = order.payments.find((p) => p.status === "PENDING");
    if (!payment) {
        return ApiResponse_1.ApiResponse.error(res, "No pending payment found for this order", 404);
    }
    const item_details = order.orderItems.map((item) => ({
        id: item.product_id.toString(),
        price: Math.round(Number(item.price_at_purchase)),
        quantity: item.quantity,
        name: item.product.name.substring(0, 50),
    }));
    if (Number(order.shipping_cost) > 0) {
        item_details.push({
            id: "SHIPPING_COST",
            price: Math.round(Number(order.shipping_cost)),
            quantity: 1,
            name: "Shipping Fee",
        });
    }
    if (Number(order.discount_amount) > 0) {
        item_details.push({
            id: "DISCOUNT",
            price: -Math.round(Number(order.discount_amount)),
            quantity: 1,
            name: "Discount",
        });
    }
    const calculatedGrossAmount = item_details.reduce((total, item) => total + item.price * item.quantity, 0);
    const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;
    const parameter = {
        transaction_details: {
            order_id: midtransOrderId,
            gross_amount: calculatedGrossAmount,
        },
        customer_details: {
            first_name: order.user.first_name,
            last_name: order.user.last_name,
            email: order.user.email,
            phone: order.user.phone || undefined,
        },
        item_details,
        credit_card: {
            secure: true,
        },
    };
    const transaction = await snap.createTransaction(parameter);
    await prisma_1.default.payment.update({
        where: { id: payment.id },
        data: { transaction_id: midtransOrderId },
    });
    return ApiResponse_1.ApiResponse.success(res, { transactionToken: transaction.token }, "Midtrans transaction created successfully");
});
PaymentController.handleMidtransNotification = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const notification = req.body;
    console.log("--- Received Midtrans Notification ---");
    console.log(JSON.stringify(notification, null, 2));
    const serverKey = snap.apiConfig.get().serverKey;
    const hashed = crypto_1.default
        .createHash("sha512")
        .update(notification.order_id +
        notification.status_code +
        notification.gross_amount +
        serverKey)
        .digest("hex");
    if (hashed !== notification.signature_key) {
        console.log("--- SIGNATURE MISMATCH ---");
        console.log("Generated Signature:", hashed);
        console.log("Midtrans Signature: ", notification.signature_key);
        return ApiResponse_1.ApiResponse.error(res, "Invalid signature", 403);
    }
    const midtransOrderId = notification.order_id;
    const orderIdString = midtransOrderId.split("-")[1];
    if (!orderIdString)
        return ApiResponse_1.ApiResponse.error(res, "Invalid order_id format fom Midtrans notification", 400);
    const orderId = parseInt(orderIdString, 10);
    if (isNaN(orderId)) {
        return ApiResponse_1.ApiResponse.error(res, "Invalid order_id format", 400);
    }
    const transactionStatus = notification.transaction_status;
    if (transactionStatus == "settlement" || transactionStatus == "capture") {
        await prisma_1.default.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { user: true },
            });
            if (order && order.user && order.order_status_id === 1) {
                // Update order status to PROCESSING (ID 3)
                await tx.order.update({
                    where: { id: orderId },
                    data: { order_status_id: 3 },
                });
                await tx.payment.updateMany({
                    where: { order_id: orderId },
                    data: { status: "SUCCESS", paid_at: new Date() },
                });
                // Send the confirmation email
                await EmailService_1.default.sendPaymentConfirmedEmail(order.user, order);
            }
        });
    }
    return ApiResponse_1.ApiResponse.success(res, null, "Notification processed.", 200);
});
exports.default = PaymentController;
//# sourceMappingURL=PaymentController.js.map