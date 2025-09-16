import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

class PaymentController {
  public static createTransaction = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { orderId } = req.body;
      if (!orderId) {
        return ApiResponse.error(res, "orderId is required", 400);
      }

      const order = await prisma.order.findFirst({
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
        return ApiResponse.error(res, "Order not found", 404);
      }

      const payment = order.payments.find((p) => p.status === "PENDING");
      if (!payment) {
        return ApiResponse.error(
          res,
          "No pending payment found for this order",
          404
        );
      }

      const subtotal = order.orderItems.reduce(
        (acc, item) => acc + Number(item.price_at_purchase) * item.quantity,
        0
      );
      const shippingCost = Number(order.total_price) - subtotal;

      const item_details = order.orderItems.map((item) => ({
        id: item.product_id.toString(),
        price: Math.round(Number(order.total_price)),
        quantity: item.quantity,
        name: item.product.name.substring(0, 50),
      }));

      if (shippingCost > 0) {
        item_details.push({
          id: "SHIPPING_COST",
          price: Math.round(shippingCost),
          quantity: 1,
          name: "Shipping Fee",
        });
      }

      const calculatedGrossAmount = item_details.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

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

      await prisma.payment.update({
        where: { id: payment.id },
        data: { transaction_id: midtransOrderId },
      });

      return ApiResponse.success(
        res,
        { transactionToken: transaction.token },
        "Midtrans transaction created successfully"
      );
    }
  );
}

export default PaymentController;
