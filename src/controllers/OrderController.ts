import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

class OrderController {
  public static createOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { addressId, shippingCost, shippingService, paymentMethodId } =
        req.body;

      if (!addressId || !shippingCost || !paymentMethodId) {
        return ApiResponse.error(res, "Missing required fields", 400);
      }

      const userCart = await prisma.cart.findUnique({
        where: { user_id: userId },
        include: { cartItems: { include: { product: true } } },
      });

      if (!userCart || userCart.cartItems.length === 0) {
        return ApiResponse.error(res, "Cart is empty", 400);
      }

      const userAddress = await prisma.userAddress.findFirst({
        where: { id: addressId, user_id: userId },
      });

      if (!userAddress) {
        return ApiResponse.error(
          res,
          "Address not found or does not belong to user",
          404
        );
      }

      const subtotal = userCart.cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      const totalPrice = subtotal + shippingCost;
      const destinationAddress = `${userAddress.address_details}, ${userAddress.postal_code}`;

      const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            user_id: userId,
            store_id: userCart.store_id,
            destination_address: destinationAddress,
            total_price: totalPrice,
            order_status_id: 1, // PENDING_PAYMENT
          },
        });

        await tx.orderItem.createMany({
          data: userCart.cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.product.price,
          })),
        });

        await tx.payment.create({
          data: {
            order_id: order.id,
            payment_method_id: paymentMethodId,
            amount: totalPrice,
            status: "PENDING",
          },
        });

        await tx.cartItem.deleteMany({ where: { cart_id: userCart.id } });
        await tx.cart.update({
          where: { id: userCart.id },
          data: { total_quantity: 0, total_price: 0 },
        });

        return order;
      });

      return ApiResponse.success(
        res,
        newOrder,
        "Order created successfully",
        201
      );
    }
  );
}

export default OrderController;
