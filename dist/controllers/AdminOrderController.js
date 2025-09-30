"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const AdminOrderService_1 = __importDefault(require("../services/AdminOrderService"));
class AdminOrderController {
}
_a = AdminOrderController;
AdminOrderController.getAllAdminOrders = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    try {
        const result = await AdminOrderService_1.default.getAllAdminOrders(req.user, req.query);
        return ApiResponse_1.ApiResponse.success(res, result, "Admin orders fetched successfully");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 403);
    }
});
AdminOrderController.getAdminOrderDetail = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam) {
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    }
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId)) {
        return ApiResponse_1.ApiResponse.error(res, "Invalid Order ID", 400);
    }
    try {
        const result = await AdminOrderService_1.default.getAdminOrderDetail(req.user, orderId);
        return ApiResponse_1.ApiResponse.success(res, result, "Admin order detail fetched.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 404);
    }
});
AdminOrderController.confirmPayment = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    try {
        await AdminOrderService_1.default.confirmPayment(orderId);
        return ApiResponse_1.ApiResponse.success(res, null, "Payment confirmed. Order is now processing.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
AdminOrderController.rejectPayment = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    try {
        await AdminOrderService_1.default.rejectPayment(orderId);
        return ApiResponse_1.ApiResponse.success(res, null, "Payment rejected. Order is now pending payment again.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
AdminOrderController.sendOrder = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    try {
        await AdminOrderService_1.default.sendOrder(orderId);
        return ApiResponse_1.ApiResponse.success(res, null, "Order marked as shipped.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
AdminOrderController.adminCancelOrder = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId: orderIdParam } = req.params;
    const adminId = req.user?.id;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    if (!adminId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    try {
        await AdminOrderService_1.default.adminCancelOrder(orderId, adminId);
        return ApiResponse_1.ApiResponse.success(res, null, "Order successfully cancelled by admin.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
AdminOrderController.markAsRefunded = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { orderId: orderIdParam } = req.params;
    if (!orderIdParam)
        return ApiResponse_1.ApiResponse.error(res, "Order ID is required", 400);
    const orderId = parseInt(orderIdParam, 10);
    try {
        await AdminOrderService_1.default.markAsRefunded(orderId);
        return ApiResponse_1.ApiResponse.success(res, null, "Order successfully marked as refunded.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 400);
    }
});
AdminOrderController.getOrderSummary = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    try {
        const result = await AdminOrderService_1.default.getOrderSummary(req.user);
        return ApiResponse_1.ApiResponse.success(res, result, "Order summary fetched successfully.");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message, 403);
    }
});
exports.default = AdminOrderController;
//# sourceMappingURL=AdminOrderController.js.map