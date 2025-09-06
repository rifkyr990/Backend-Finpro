import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class CartController {
  public static async getCart(req: any, res: any) {
    try {
      const userId = req.user?.id ?? 1; // TODO: replace with auth userId

      const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
        include: {
          cartItems: {
            include: { product: true },
          },
          store: true,
        },
      });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      res.json(cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  }

  static async updateCart(req: any, res: any) {
    try {
      const userId = req.user?.id ?? 1;
      const { storeId, items } = req.body as {
        storeId: number;
        items: { productId: number; quantity: number }[];
      };

      const updatedCart = await prisma.$transaction(async (tx) => {
        let cart = await tx.cart.findUnique({ where: { user_id: userId } });
        if (!cart) {
          cart = await tx.cart.create({
            data: { user_id: userId, store_id: storeId },
          });
        }

        if (cart.store_id !== storeId) {
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

        await tx.cartItem.createMany({
          data: items.map((i) => ({
            cart_id: cart!.id,
            product_id: i.productId,
            quantity: i.quantity,
          })),
        });

        const productIds = items.map((i) => i.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, price: true },
        });

        let totalQuantity = 0;
        let totalPrice = 0;
        for (const item of items) {
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

      res.json(updatedCart);
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ error: "Failed to update cart" });
    }
  }
}

export default CartController;
