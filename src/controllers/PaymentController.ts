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
          DiscountUsage: {
            include: {
              discount: true,
            },
          },
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
      
      const b1g1Discount = order.DiscountUsage?.find(
        (d) => d.discount.type === "B1G1"
      )?.discount;

      const item_details = order.orderItems.flatMap((item) => {
        if (b1g1Discount && item.product_id === b1g1Discount.product_id) {
          const paidQty = item.quantity / 2;
          const freeQty = item.quantity / 2;
          return [
            {
              id: item.product_id.toString(),
              price: Math.round(Number(item.price_at_purchase)),
              quantity: paidQty,
              name: item.product.name.substring(0, 50),
            },
            {
              id: `${item.product_id}-free`,
              price: 0,
              quantity: freeQty,
              name: `[FREE] ${item.product.name.substring(0, 40)}`,
            },
          ];
        }
        return {
          id: item.product_id.toString(),
          price: Math.round(Number(item.price_at_purchase)),
          quantity: item.quantity,
          name: item.product.name.substring(0, 50),
        };
      });

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

      const calculatedGrossAmount = item_details.reduce(
        (total, item) => total + item.price * item.quantity,
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
