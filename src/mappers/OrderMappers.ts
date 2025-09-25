import {
  Order,
  User,
  Store,
  OrderStatuses,
  OrderItem,
  Product,
  ProductImage,
  Payment,
  PaymentMethod,
  PaymentProof,
  DiscountUsage,
  Discount,
} from "@prisma/client";

type FullPrismaOrder = Order & {
  user: User;
  store: Store;
  orderStatus: OrderStatuses;
  orderItems: (OrderItem & {
    product: Product & {
      images: ProductImage[];
    };
  })[];
  payments: (Payment & {
    paymentMethod: PaymentMethod;
    proof: PaymentProof | null;
  })[];
  DiscountUsage: (DiscountUsage & {
    discount: Discount;
  })[];
};

// New type for user order detail
type FullUserPrismaOrder = Order & {
  store: Store;
  orderStatus: OrderStatuses;
  payments: (Payment & { paymentMethod: PaymentMethod })[];
  orderItems: (OrderItem & { product: Product & { images: ProductImage[] } })[];
  DiscountUsage: (DiscountUsage & { discount: Discount })[];
};

export class OrderMappers {
  public static formatOrderForAdminDetailResponse(order: FullPrismaOrder) {
    const subtotal = order.orderItems.reduce(
      (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
      0
    );

    const discountUsage = order.DiscountUsage[0];
    let discountAmount = 0;

    if (discountUsage?.discount) {
      const { discount } = discountUsage;
      if (discount.type === "B1G1" && discount.product_id) {
        const targetItem = order.orderItems.find(
          (item) => item.product_id === discount.product_id
        );
        if (targetItem) {
          discountAmount = Number(targetItem.price_at_purchase);
        }
      } else if (discount.discAmount) {
        if (discount.valueType === "PERCENTAGE") {
          discountAmount = (subtotal * Number(discount.discAmount)) / 100;
        } else {
          discountAmount = Number(discount.discAmount);
        }
      }
    }

    discountAmount = Math.min(subtotal, discountAmount);
    const shippingCost =
      Number(order.total_price) - (subtotal - discountAmount);

    return {
      id: order.id,
      createdAt: order.created_at,
      status: order.orderStatus.status,
      customer: {
        name: `${order.user.first_name} ${order.user.last_name}`,
        email: order.user.email,
        phone: order.user.phone,
      },
      store: {
        name: order.store.name,
      },
      shipping: {
        address: order.destination_address,
        cost: (shippingCost > 0 ? shippingCost : 0).toString(),
      },
      payment: {
        method: order.payments[0]?.paymentMethod.name || "N/A",
        status: order.payments[0]?.status || "N/A",
        proofUrl: order.payments[0]?.proof?.image_url || null,
      },
      pricing: {
        subtotal: subtotal.toString(),
        discount: discountAmount.toString(),
        total: order.total_price.toString(),
      },
      items: order.orderItems.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price_at_purchase.toString(),
        imageUrl: item.product.images[0]?.image_url || "/fallback.png",
      })),
    };
  }

  public static formatOrderForUserDetailResponse(order: FullUserPrismaOrder) {
    const subtotal = order.orderItems.reduce(
      (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
      0
    );

    const discountUsage = order.DiscountUsage[0];
    let discountAmount = 0;

    if (discountUsage?.discount) {
      const { discount } = discountUsage;
      if (discount.type === "B1G1") {
        const targetItem = order.orderItems.find(
          (item) => item.product_id === discount.product_id
        );
        if (targetItem) {
          discountAmount = Number(targetItem.price_at_purchase);
        }
      } else if (discount.discAmount) {
        if (discount.valueType === "PERCENTAGE") {
          discountAmount = (subtotal * Number(discount.discAmount)) / 100;
        } else {
          discountAmount = Number(discount.discAmount);
        }
      }
    }
    discountAmount = Math.min(subtotal, discountAmount);
    const shippingCost =
      Number(order.total_price) - (subtotal - discountAmount);

    return {
      id: order.id,
      createdAt: order.created_at,
      totalPrice: order.total_price.toString(),
      subtotal: subtotal.toString(),
      shippingCost: (shippingCost > 0 ? shippingCost : 0).toString(),
      discountAmount: discountAmount.toString(),
      destinationAddress: order.destination_address,
      store: { id: order.store.id, name: order.store.name },
      status: order.orderStatus.status,
      payment: order.payments[0]
        ? {
            method: order.payments[0].paymentMethod.name,
            status: order.payments[0].status,
          }
        : null,
      items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.price_at_purchase.toString(),
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl:
            item.product.images[0]?.image_url ||
            "https://placehold.co/400x400/png",
        },
      })),
    };
  }
}