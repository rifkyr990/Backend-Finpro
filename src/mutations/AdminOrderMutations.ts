import prisma from "../config/prisma";

export class AdminOrderMutations {
  public static async confirmPaymentTransaction(orderId: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payments: true, user: true },
      });
      if (!order || !order.user) throw new Error("Order or user not found.");
      if (order.order_status_id !== 2)
        throw new Error("Order not awaiting confirmation.");

      const payment = order.payments.find((p) => p.status === "PENDING");
      if (!payment) throw new Error("No pending payment found.");

      const newStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "PROCESSING" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: newStatus.id },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paid_at: new Date() },
      });
      return order;
    });
  }

  public static async rejectPaymentTransaction(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order || !order.user) throw new Error("Order or user not found.");
    if (order.order_status_id !== 2)
      throw new Error("Order not awaiting confirmation.");

    const newStatus = await prisma.orderStatuses.findUniqueOrThrow({
      where: { status: "PENDING_PAYMENT" },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { order_status_id: newStatus.id },
    });
    await prisma.paymentProof.deleteMany({
      where: { payment: { order_id: orderId } },
    });
    return order;
  }

  public static async sendOrderTransaction(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order || !order.user) throw new Error("Order or user not found.");
    if (order.order_status_id !== 3) throw new Error("Order not processing.");

    const newStatus = await prisma.orderStatuses.findUniqueOrThrow({
      where: { status: "SHIPPED" },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { order_status_id: newStatus.id },
    });
    return order;
  }

  public static async adminCancelOrderTransaction(
    orderId: number,
    adminId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const [order, admin] = await Promise.all([
        tx.order.findUnique({
          where: { id: orderId },
          include: { orderStatus: true, orderItems: true, user: true },
        }),
        tx.user.findUnique({ where: { id: adminId } }),
      ]);
      if (!order || !admin || !order.user) throw new Error("Data missing.");
      if (!["PAID", "PROCESSING"].includes(order.orderStatus.status))
        throw new Error("Order cannot be cancelled at this stage.");

      const newStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "CANCELLED" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: newStatus.id },
      });
      for (const item of order.orderItems) {
        await tx.productStocks.update({
          where: {
            store_id_product_id: {
              store_id: order.store_id,
              product_id: item.product_id,
            },
          },
          data: { stock_quantity: { increment: item.quantity } },
        });
      }
      return order;
    });
  }

  public static async markAsRefundedTransaction(orderId: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          orderStatus: { status: "CANCELLED" },
          payments: { some: { status: "SUCCESS" } },
        },
        include: { payments: true },
      });
      if (!order) throw new Error("Order not eligible for refund.");

      const payment = order.payments.find((p) => p.status === "SUCCESS");
      if (!payment) throw new Error("No successful payment to refund.");

      const newStatus = await tx.orderStatuses.findUniqueOrThrow({
        where: { status: "REFUNDED" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { order_status_id: newStatus.id },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
    });
  }
}