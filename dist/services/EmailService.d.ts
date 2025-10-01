import { Order, User } from "@prisma/client";
declare class EmailService {
    private static sendNotification;
    static sendPaymentConfirmedEmail(user: User, order: Order): Promise<void>;
    static sendPaymentRejectedEmail(user: User, order: Order): Promise<void>;
    static sendOrderShippedEmail(user: User, order: Order): Promise<void>;
    static sendAdminOrderCancelledEmail(user: User, order: Order): Promise<void>;
    static sendUserOrderCancelledEmail(user: User, order: Order): Promise<void>;
    static sendOrderRefundedEmail(user: User, order: Order): Promise<void>;
}
export default EmailService;
//# sourceMappingURL=EmailService.d.ts.map