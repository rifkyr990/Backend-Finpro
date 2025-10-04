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
    const recipientName = order.destination_address.split(" (")[0];
    const recipientPhone =
      order.destination_address.match(/\(([^)]+)\)/)?.[1] || null;

    const b1g1Discount = order.DiscountUsage?.find(
      (usage) => usage.discount.type === "B1G1"
    )?.discount;

    return {
      id: order.id,
      createdAt: order.created_at,
      status: order.orderStatus.status,
      customer: {
        name: recipientName,
        email: order.user.email,
        phone: recipientPhone,
      },
      store: {
        name: order.store.name,
      },
      shipping: {
        address: order.destination_address,
      },
      payment: {
        method: order.payments[0]?.paymentMethod.name || "N/A",
        status: order.payments[0]?.status || "N/A",
        proofUrl: order.payments[0]?.proof?.image_url || null,
      },
      pricing: {
        subtotal: order.subtotal.toString(),
        discount: order.discount_amount.toString(),
        cost: order.shipping_cost.toString(),
        total: order.total_price.toString(),
      },
      items: order.orderItems.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price_at_purchase.toString(),
        imageUrl: item.product.images[0]?.image_url || "/fallback.png",
        isB1G1Item: b1g1Discount?.product_id === item.product_id,
      })),
    };
  }

  public static formatOrderForUserDetailResponse(order: FullUserPrismaOrder) {
    const recipientName = order.destination_address.split(" (")[0];
    const recipientPhone =
      order.destination_address.match(/\(([^)]+)\)/)?.[1] || null;
    const fullAddress =
      order.destination_address.split("), ")[1] || order.destination_address;

    const b1g1Discount = order.DiscountUsage.find(
      (usage) => usage.discount.type === "B1G1"
    )?.discount;

    return {
      isB1G1Order: !!b1g1Discount,
      id: order.id,
      createdAt: order.created_at,
      totalPrice: order.total_price.toString(),
      subtotal: order.subtotal.toString(),
      shippingCost: order.shipping_cost.toString(),
      discountAmount: order.discount_amount.toString(),
      destinationAddress: {
        name: recipientName,
        phone: recipientPhone,
        fullAddress: fullAddress,
      },
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
        isB1G1Item: b1g1Discount?.product_id === item.product_id,
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