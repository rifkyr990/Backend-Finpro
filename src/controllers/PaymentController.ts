import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import crypto from "crypto";
import EmailService from "../services/EmailService";
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

      const item_details = order.orderItems.map((item) => ({
        id: item.product_id.toString(),
        price: Math.round(Number(item.price_at_purchase)),
        quantity: item.quantity,
        name: item.product.name.substring(0, 50),
      }));

      const subtotal = item_details.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const discountUsage = await prisma.discountUsage.findFirst({
        where: { order_id: order.id },
        include: { discount: true },
      });

      let discountAmount = 0;

      if (discountUsage && discountUsage.discount) {
        const discount = discountUsage.discount;
        if (discount.type === "B1G1" && discount.product_id) {
          const targetItem = order.orderItems.find(
            (item) => item.product_id === discount.product_id
          );
          if (targetItem) {
            discountAmount = Math.round(Number(targetItem.price_at_purchase));
          }
        } else if (
          (discount.type === "MANUAL" || discount.type === "MIN_PURCHASE") &&
          discount.discAmount
        ) {
          if (discount.valueType === "PERCENTAGE") {
            discountAmount = Math.round(
              (subtotal * Number(discount.discAmount)) / 100
            );
          } else {
            discountAmount = Math.round(Number(discount.discAmount));
          }
        }

        if (discountAmount > 0) {
          item_details.push({
            id: `DISC-${discount.code}`,
            price: -discountAmount,
            quantity: 1,
            name: `Discount (${discount.code})`,
          });
        }
      }

      const actualShippingCost =
        Math.round(Number(order.total_price)) - (subtotal - discountAmount);

      if (actualShippingCost > 0) {
        item_details.push({
          id: "SHIPPING_COST",
          price: actualShippingCost,
          quantity: 1,
          name: "Shipping Fee",
        });
      }

      const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;
      const parameter = {
        transaction_details: {
          order_id: midtransOrderId,

          gross_amount: Math.round(Number(order.total_price)),
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

  public static handleMidtransNotification = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const notification = req.body;
      console.log("--- Received Midtrans Notification ---");
      console.log(JSON.stringify(notification, null, 2));

      const serverKey = snap.apiConfig.get().serverKey;
      const hashed = crypto
        .createHash("sha512")
        .update(
          notification.order_id +
            notification.status_code +
            notification.gross_amount +
            serverKey
        )
        .digest("hex");

      if (hashed !== notification.signature_key) {
        console.log("--- SIGNATURE MISMATCH ---");
        console.log("Generated Signature:", hashed);
        console.log("Midtrans Signature: ", notification.signature_key);
        return ApiResponse.error(res, "Invalid signature", 403);
      }

      const midtransOrderId = notification.order_id as string;
      const orderIdString = midtransOrderId.split("-")[1];

      if (!orderIdString)
        return ApiResponse.error(
          res,
          "Invalid order_id format fom Midtrans notification",
          400
        );

      const orderId = parseInt(orderIdString, 10);

      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid order_id format", 400);
      }

      const transactionStatus = notification.transaction_status;

      if (transactionStatus == "settlement" || transactionStatus == "capture") {
        await prisma.$transaction(async (tx) => {
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
            await EmailService.sendPaymentConfirmedEmail(order.user, order);
          }
        });
      }

      return ApiResponse.success(res, null, "Notification processed.", 200);
    }
  );
}

export default PaymentController;
