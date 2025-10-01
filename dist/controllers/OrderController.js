"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const OrderService_1 = __importDefault(require("../services/OrderService"));
class OrderController {
}
_a = OrderController;
OrderController.createOrder = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    }
    const { addressId, storeId, shippingCost, paymentMethodId, promoCode } = req.body;
    if (typeof addressId !== "number" ||
        typeof paymentMethodId !== "number") {
        return ApiResponse_1.ApiResponse.error(res, "Invalid data types for required fields", 400);
    }
    try {
        const newOrder = await OrderService_1.default.createOrder({
            userId,
            addressId,
            storeId,
            shippingCost,
            paymentMethodId,
            promoCode,
        });
        return ApiResponse_1.ApiResponse.success(res, { orderId: newOrder.id }, "Order created successfully", 201);
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
OrderController.getOrderById = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId))
        return ApiResponse_1.ApiResponse.error(res, "Invalid order ID", 400);
    try {
        const formattedOrder = await OrderService_1.default.getOrderById(userId, orderId);
        return ApiResponse_1.ApiResponse.success(res, formattedOrder, "Order fetched successfully");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 404);
    }
});
OrderController.uploadPaymentProof = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId))
        return ApiResponse_1.ApiResponse.error(res, "Invalid order ID", 400);
    try {
        await OrderService_1.default.uploadPaymentProof(userId, orderId, req.file);
        return ApiResponse_1.ApiResponse.success(res, null, "Payment proof uploaded. Awaiting confirmation.", 200);
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
OrderController.getMyOrders = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    const { page, limit, search, status, startDate, endDate } = req.query;
    try {
        const result = await OrderService_1.default.getMyOrders({
            userId,
            page: page,
            limit: limit,
            search: search,
            status: status,
            startDate: startDate,
            endDate: endDate,
        });
        return ApiResponse_1.ApiResponse.success(res, result, "User orders fetched successfully");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 500);
    }
});
OrderController.cancelOrder = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { orderId: orderIdParam } = req.params;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId))
        return ApiResponse_1.ApiResponse.error(res, "Invalid Order ID", 400);
    try {
        await OrderService_1.default.cancelOrder(userId, orderId);
        return ApiResponse_1.ApiResponse.success(res, null, "Order successfully cancelled.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
OrderController.confirmReceipt = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { orderId: orderIdParam } = req.params;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId))
        return ApiResponse_1.ApiResponse.error(res, "Invalid Order ID", 400);
    try {
        await OrderService_1.default.confirmReceipt(userId, orderId);
        return ApiResponse_1.ApiResponse.success(res, null, "Order receipt confirmed. Thank you!");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
OrderController.repayOrder = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { orderId: orderIdParam } = req.params;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId))
        return ApiResponse_1.ApiResponse.error(res, "Invalid Order ID", 400);
    try {
        await OrderService_1.default.validateRepay(userId, orderId);
        return ApiResponse_1.ApiResponse.success(res, { orderId }, "Ready for re-payment.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
exports.default = OrderController;
//# sourceMappingURL=OrderController.js.map