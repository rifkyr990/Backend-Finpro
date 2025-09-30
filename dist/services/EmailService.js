"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationEmailTemplate_1 = require("../templates/NotificationEmailTemplate");
const email_1 = require("../utils/email");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
class EmailService {
    static async sendNotification(user, order, emailDetails) {
        const orderUrl = `${FRONTEND_URL}/profile/orders/${order.id}`;
        const emailHtml = (0, NotificationEmailTemplate_1.notificationEmailTemplate)({
            title: emailDetails.title,
            message: emailDetails.message,
            buttonUrl: orderUrl,
            buttonText: emailDetails.buttonText,
        });
        await (0, email_1.sendEmail)({
            to: user.email,
            subject: `Update on Your FreshCart Order #${order.id}`,
            text: `${emailDetails.title}\n\n${emailDetails.message}\n\nView your order here: ${orderUrl}`,
            html: emailHtml,
        });
    }
    static async sendPaymentConfirmedEmail(user, order) {
        await this.sendNotification(user, order, {
            title: "Payment Confirmed!",
            message: `We have successfully confirmed the payment for your order #${order.id}. We are now preparing your items for shipment.`,
            buttonText: "View Order Status",
        });
    }
    static async sendPaymentRejectedEmail(user, order) {
        await this.sendNotification(user, order, {
            title: "Payment Rejected",
            message: `There was an issue with the payment proof for your order #${order.id}. Please upload a valid proof to proceed.`,
            buttonText: "Upload New Proof",
        });
    }
    static async sendOrderShippedEmail(user, order) {
        await this.sendNotification(user, order, {
            title: "Your Order is On The Way!",
            message: `Great news! Your order #${order.id} has been shipped and is on its way to you.`,
            buttonText: "Track Your Order",
        });
    }
    static async sendAdminOrderCancelledEmail(user, order) {
        await this.sendNotification(user, order, {
            title: "Order Cancelled",
            message: `We're sorry to inform you that your order #${order.id} has been cancelled by our administration. Please check the order details for more information.`,
            buttonText: "View Order Details",
        });
    }
    static async sendUserOrderCancelledEmail(user, order) {
        await this.sendNotification(user, order, {
            title: "Your Order Has Been Cancelled",
            message: `This email confirms that your order #${order.id} has been successfully cancelled as per your request. We hope to see you again soon.`,
            buttonText: "View Order Details",
        });
    }
    static async sendOrderRefundedEmail(user, order) {
        await this.sendNotification(user, order, {
            title: "Order Refunded",
            message: `Your cancelled order #${order.id} has been successfully processed for a refund.`,
            buttonText: "View Order Details",
        });
    }
}
exports.default = EmailService;
//# sourceMappingURL=EmailService.js.map