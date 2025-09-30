"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderMappers = void 0;
class OrderMappers {
    static formatOrderForAdminDetailResponse(order) {
        const recipientName = order.destination_address.split(" (")[0];
        const recipientPhone = order.destination_address.match(/\(([^)]+)\)/)?.[1] || null;
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
            })),
        };
    }
    static formatOrderForUserDetailResponse(order) {
        const recipientName = order.destination_address.split(" (")[0];
        const recipientPhone = order.destination_address.match(/\(([^)]+)\)/)?.[1] || null;
        const fullAddress = order.destination_address.split("), ")[1] || order.destination_address;
        return {
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
                priceAtPurchase: item.price_at_purchase.toString(),
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    imageUrl: item.product.images[0]?.image_url ||
                        "https://placehold.co/400x400/png",
                },
            })),
        };
    }
}
exports.OrderMappers = OrderMappers;
//# sourceMappingURL=OrderMappers.js.map