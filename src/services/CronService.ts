import cron from "node-cron";
import prisma from "../config/prisma";
import { OrderStatus } from "@prisma/client";

class CronService {
  public static startOrderCancellationJob() {

    cron.schedule("* * * * *", async () => {
      console.log("CRON: Checking for expired unpaid orders...");

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      try {

        const expiredOrders = await prisma.order.findMany({
          where: {
            created_at: {
              lt: oneHourAgo,
            },
            orderStatus: {
              status: OrderStatus.PENDING_PAYMENT,
            },
            payments: {
              some: {
                payment_method_id: 1, // Manual Bank Transfer
              },
            },
          },
          include: {
            orderItems: true,
          },
        });

        if (expiredOrders.length === 0) {
          console.log("CRON: No expired orders found.");
          return;
        }

        console.log(`CRON: Found ${expiredOrders.length} expired orders. Processing...`);


        const cancelledStatus = await prisma.orderStatuses.findUniqueOrThrow({
          where: { status: OrderStatus.CANCELLED },
        });

        for (const order of expiredOrders) {
          await prisma.$transaction(async (tx) => {

            await tx.order.update({
              where: { id: order.id },
              data: { order_status_id: cancelledStatus.id },
            });

            for (const item of order.orderItems) {
              const productStock = await tx.productStocks.findUniqueOrThrow({
                where: {
                  store_id_product_id: {
                    store_id: order.store_id,
                    product_id: item.product_id,
                  },
                },
              });

              const newStockQuantity = productStock.stock_quantity + item.quantity;

              await tx.productStocks.update({
                where: { id: productStock.id },
                data: { stock_quantity: newStockQuantity },
              });

              await tx.stockHistory.create({
                data: {
                  type: "IN",
                  quantity: item.quantity,
                  prev_stock: productStock.stock_quantity,
                  updated_stock: newStockQuantity,
                  min_stock: productStock.min_stock,
                  reason: `Order #${order.id} cancelled (unpaid)`,
                  order_id: order.id,
                  productStockId: productStock.id,
                  // Note: 'user_id' can be null for system actions
                },
              });
            }

            console.log(`CRON: Successfully cancelled Order #${order.id} and restored stock.`);
          });
        }
      } catch (error) {
        console.error("CRON: Error during order cancellation job:", error);
      }
    });
  }
}

export default CronService;