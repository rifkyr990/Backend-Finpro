import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import cloudinary from "../config/cloudinary";
import EmailService from "../services/EmailService";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { OrderStatus, Prisma, Discount } from "@prisma/client";
import OrderService from "../services/OrderService";

class OrderController {
  public static createOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }
      const { addressId, storeId, shippingCost, paymentMethodId, promoCode } =
        req.body;
      if (
        typeof addressId !== "number" ||
        typeof storeId !== "number" ||
        typeof shippingCost !== "string" ||
        typeof paymentMethodId !== "number"
      ) {
        return ApiResponse.error(
          res,
          "Invalid data types for required fields",
          400
        );
      }
      try {
        const newOrder = await OrderService.createOrder({
          userId,
          addressId,
          storeId,
          shippingCost,
          paymentMethodId,
          promoCode,
        });
        return ApiResponse.success(
          res,
          { orderId: newOrder.id },
          "Order created successfully",
          201
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static getOrderById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);

      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid order ID", 400);

      try {
        const formattedOrder = await OrderService.getOrderById(userId, orderId);
        return ApiResponse.success(
          res,
          formattedOrder,
          "Order fetched successfully"
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 404);
      }
    }
  );

  public static uploadPaymentProof = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);

      const { orderId: orderIdParam } = req.params;
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid order ID", 400);

      try {
        await OrderService.uploadPaymentProof(userId, orderId, req.file);
        return ApiResponse.success(
          res,
          null,
          "Payment proof uploaded. Awaiting confirmation.",
          200
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static getMyOrders = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      const { page, limit, search, status, startDate, endDate } = req.query;
      try {
        const result = await OrderService.getMyOrders({
          userId,
          page: page as string,
          limit: limit as string,
          search: search as string,
          status: status as string,
          startDate: startDate as string,
          endDate: endDate as string,
        });
        return ApiResponse.success(
          res,
          result,
          "User orders fetched successfully"
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 500);
      }
    }
  );

  public static cancelOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      const { orderId: orderIdParam } = req.params;
      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);
      try {
        await OrderService.cancelOrder(userId, orderId);
        return ApiResponse.success(res, null, "Order successfully cancelled.");
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static confirmReceipt = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      const { orderId: orderIdParam } = req.params;

      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);
      try {
        await OrderService.confirmReceipt(userId, orderId);
        return ApiResponse.success(
          res,
          null,
          "Order receipt confirmed. Thank you!"
        );
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );

  public static repayOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      const { orderId: orderIdParam } = req.params;

      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);
      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);

      try {
        await OrderService.validateRepay(userId, orderId);
        return ApiResponse.success(res, { orderId }, "Ready for re-payment.");
      } catch (error: any) {
        return ApiResponse.error(res, error.message, 400);
      }
    }
  );
}

export default OrderController;
