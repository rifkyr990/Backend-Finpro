import { Order, User } from "@prisma/client";
import { notificationEmailTemplate } from "../templates/NotificationEmailTemplate";
import { sendEmail } from "../utils/email";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

class EmailService {
  private static async sendNotification(
    user: User,
    order: Order,
    emailDetails: { title: string; message: string; buttonText: string }
  ) {
    const orderUrl = `${FRONTEND_URL}/profile/orders/${order.id}`;
    const emailHtml = notificationEmailTemplate({
      title: emailDetails.title,
      message: emailDetails.message,
      buttonUrl: orderUrl,
      buttonText: emailDetails.buttonText,
    });

    await sendEmail({
      to: user.email,
      subject: `Update on Your FreshCart Order #${order.id}`,
      text: `${emailDetails.title}\n\n${emailDetails.message}\n\nView your order here: ${orderUrl}`,
      html: emailHtml,
    });
  }

  public static async sendPaymentConfirmedEmail(user: User, order: Order) {
    await this.sendNotification(user, order, {
      title: "Payment Confirmed!",
      message: `We have successfully confirmed the payment for your order #${order.id}. We are now preparing your items for shipment.`,
      buttonText: "View Order Status",
    });
  }

  public static async sendPaymentRejectedEmail(user: User, order: Order) {
    await this.sendNotification(user, order, {
      title: "Payment Rejected",
      message: `There was an issue with the payment proof for your order #${order.id}. Please upload a valid proof to proceed.`,
      buttonText: "Upload New Proof",
    });
  }

  public static async sendOrderShippedEmail(user: User, order: Order) {
    await this.sendNotification(user, order, {
      title: "Your Order is On The Way!",
      message: `Great news! Your order #${order.id} has been shipped and is on its way to you.`,
      buttonText: "Track Your Order",
    });
  }

  public static async sendAdminOrderCancelledEmail(user: User, order: Order) {
    await this.sendNotification(user, order, {
      title: "Order Cancelled",
      message: `We're sorry to inform you that your order #${order.id} has been cancelled by our administration. Please check the order details for more information.`,
      buttonText: "View Order Details",
    });
  }

  public static async sendUserOrderCancelledEmail(user: User, order: Order) {
    await this.sendNotification(user, order, {
      title: "Your Order Has Been Cancelled",
      message: `This email confirms that your order #${order.id} has been successfully cancelled as per your request. We hope to see you again soon.`,
      buttonText: "View Order Details",
    });
  }

  public static async sendOrderRefundedEmail(user: User, order: Order) {
    await this.sendNotification(user, order, {
      title: "Order Refunded",
      message: `Your cancelled order #${order.id} has been successfully processed for a refund.`,
      buttonText: "View Order Details",
    });
  }
}

export default EmailService;