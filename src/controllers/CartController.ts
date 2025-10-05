import { Response } from "express";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import prisma from "../config/prisma";

class CartController {
  public static getCart = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }
      if (req.user?.role !== "CUSTOMER") {
        return ApiResponse.error(
          res,
          "Forbidden: Admins cannot access the cart.",
          403
        );
      }

      const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                  stocks: {
                    where: { store_id: { equals: req.user.store_id ?? undefined } },
                    select: { stock_quantity: true },
                  },
                },
              },
            },
            orderBy: { id: "asc" },
          },
          store: true,
        },
      });

      if (cart) {
        // Since the above `where` on stocks might not work in a nested include,
        // we'll ensure we get the right stock for the cart's store.
        const cartStoreId = cart.store_id;
        for (const item of cart.cartItems) {
          const stock = await prisma.productStocks.findUnique({
            where: {
              store_id_product_id: {
                store_id: cartStoreId,
                product_id: item.product_id,
              },
            },
            select: { stock_quantity: true },
          });
          (item.product as any).stocks = [stock || { stock_quantity: 0 }];
        }
      }

      if (!cart) {
        return ApiResponse.success(
          res,
          {
            store: null,
            cartItems: [],
          },
          "Cart is empty"
        );
      }

      const formattedCart = {
        storeId: cart.store?.id || null,
        store: cart.store,
        cartItems: cart.cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description || "",
            price: item.product.price.toString(),
            imageUrl:
              item.product.images[0]?.image_url ||
              "https://placehold.co/400x400/png",
            stock: (item.product as any).stocks[0]?.stock_quantity ?? 0,
          },
        })),
      };

      return ApiResponse.success(
        res,
        formattedCart,
        "Cart fetched successfully"
      );
    }
  );

  static updateCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }
    if (req.user?.role !== "CUSTOMER") {
      return ApiResponse.error(
        res,
        "Forbidden: Admins cannot add items to the cart.",
        403
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    if (!user.is_verified) {
      return ApiResponse.error(
        res,
        "Please verify your email to start shopping.",
        403
      );
    }

    if (!user.is_verified) {
      return ApiResponse.error(
        res,
        "Please verify your email to start shopping.",
        403
      );
    }

    const { storeId, items } = req.body as {
      storeId: number;
      items: { productId: number; quantity: number }[];
    };

    if (typeof storeId !== "number" || !Array.isArray(items)) {
      return ApiResponse.error(res, "Invalid payload format", 400);
    }

    const updatedCart = await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({ where: { user_id: userId } });

      if (!cart) {
        cart = await tx.cart.create({
          data: { user_id: userId, store_id: storeId },
        });
      }

      if (cart.store_id !== storeId) {
        await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });
        cart = await tx.cart.update({
          where: { id: cart.id },
          data: { store_id: storeId, total_quantity: 0, total_price: 0 },
        });
      }

      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      if (items.length === 0) {
        return tx.cart.update({
          where: { id: cart.id },
          data: { total_quantity: 0, total_price: 0 },
          include: { cartItems: true },
        });
      }

      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      const validItems = items.filter((item) => productMap.has(item.productId));
      if (validItems.length === 0) {
        return ApiResponse.error(res, "No valid products in request", 400);
      }

      if (validItems.length > 0) {
        await tx.cartItem.createMany({
          data: validItems.map((i) => ({
            cart_id: cart!.id,
            product_id: i.productId,
            quantity: i.quantity,
          })),
        });
      }

      let totalQuantity = 0;
      let totalPrice = 0;
      for (const item of validItems) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;
        totalQuantity += item.quantity;
        totalPrice += Number(product.price) * item.quantity;
      }

      return tx.cart.update({
        where: { id: cart.id },
        data: { total_quantity: totalQuantity, total_price: totalPrice },
        include: { cartItems: { include: { product: true } } },
      });
    });

    return ApiResponse.success(res, updatedCart, "Cart updated successfully");
  });
}

export default CartController;
