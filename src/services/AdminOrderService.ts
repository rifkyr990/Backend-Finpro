import prisma from "../config/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import EmailService from "./EmailService";
import { OrderMappers } from "../mappers/OrderMappers";
import { AdminOrderReads } from "../queries/AdminOrderReads";
import { AdminOrderMutations } from "../mutations/AdminOrderMutations";
import { AdminOrderQueryParams } from "../types/query-params";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  store_id?: number | null;
};

class AdminOrderService {
  public static async getAllAdminOrders(
    user: AuthenticatedUser,
    query: AdminOrderQueryParams
  ) {
    return AdminOrderReads.getPaginatedAdminOrders(user, query);
  }

  public static async getAdminOrderDetail(
    user: AuthenticatedUser,
    orderId: number
  ) {
    const whereClause: Prisma.OrderWhereInput = { id: orderId };
    if (user.role === "STORE_ADMIN") {
      if (!user.store_id) {
        throw new Error("Store admin is not assigned to a store.");
      }
      whereClause.store_id = user.store_id;
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        user: true,
        store: true,
        orderStatus: true,
        orderItems: {
          include: { product: { include: { images: { take: 1 } } } },
        },
        payments: { include: { paymentMethod: true, proof: true } },
        DiscountUsage: { include: { discount: true } },
      },
    });

    if (!order) {
      throw new Error("Order not found or access denied.");
    }

    return OrderMappers.formatOrderForAdminDetailResponse(order);
  }

  public static async confirmPayment(orderId: number) {
    const order = await AdminOrderMutations.confirmPaymentTransaction(orderId);
    await EmailService.sendPaymentConfirmedEmail(order.user, order);
  }

  public static async rejectPayment(orderId: number) {
    const order = await AdminOrderMutations.rejectPaymentTransaction(orderId);
    await EmailService.sendPaymentRejectedEmail(order.user, order);
  }

  public static async sendOrder(orderId: number) {
    const order = await AdminOrderMutations.sendOrderTransaction(orderId);
    await EmailService.sendOrderShippedEmail(order.user, order);
  }

  public static async adminCancelOrder(orderId: number, adminId: string) {
    const order = await AdminOrderMutations.adminCancelOrderTransaction(
      orderId,
      adminId
    );
    await EmailService.sendUserOrderCancelledEmail(order.user, order as any);
  }

  public static async markAsRefunded(orderId: number) {
    await AdminOrderMutations.markAsRefundedTransaction(orderId);
  }

  public static async getOrderSummary(user: AuthenticatedUser) {
    return AdminOrderReads.getOrderSummary(user);
  }
}

export default AdminOrderService;