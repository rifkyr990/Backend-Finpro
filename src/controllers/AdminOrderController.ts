import { Response } from "express";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import AdminOrderService from "../services/AdminOrderService";

class AdminOrderController {
  public static getAllAdminOrders = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

      try {
        const result = await AdminOrderService.getAllAdminOrders({
          user: req.user,
          query: req.query,
        });
        return ApiResponse.success(
          res,
          result,
          "Admin orders fetched successfully"
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 403);
      }
    }
  );

  public static getAdminOrderDetail = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);
      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);

      try {
        const result = await AdminOrderService.getAdminOrderDetail(
          req.user,
          orderId
        );
        return ApiResponse.success(res, result, "Admin order detail fetched.");
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 404);
      }
    }
  );

  public static confirmPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);

      try {
        await AdminOrderService.confirmPayment(orderId);
        return ApiResponse.success(
          res,
          null,
          "Payment confirmed. Order is now processing."
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static rejectPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);

      try {
        await AdminOrderService.rejectPayment(orderId);
        return ApiResponse.success(
          res,
          null,
          "Payment rejected. Order is now pending payment again."
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static sendOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);

      try {
        await AdminOrderService.sendOrder(orderId);
        return ApiResponse.success(res, null, "Order marked as shipped.");
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static adminCancelOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      const adminId = req.user?.id;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);
      if (!adminId) return ApiResponse.error(res, "Unauthorized", 401);

      try {
        await AdminOrderService.adminCancelOrder(orderId, adminId);
        return ApiResponse.success(
          res,
          null,
          "Order successfully cancelled by admin."
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static markAsRefunded = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);

      try {
        await AdminOrderService.markAsRefunded(orderId);
        return ApiResponse.success(
          res,
          null,
          "Order successfully marked as refunded."
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static getOrderSummary = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

      try {
        const result = await AdminOrderService.getOrderSummary(req.user);
        return ApiResponse.success(
          res,
          result,
          "Order summary fetched successfully."
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 403);
      }
    }
  );
}

export default AdminOrderController;