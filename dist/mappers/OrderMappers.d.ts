import { Order, User, Store, OrderStatuses, OrderItem, Product, ProductImage, Payment, PaymentMethod, PaymentProof, DiscountUsage, Discount } from "@prisma/client";
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
type FullUserPrismaOrder = Order & {
    store: Store;
    orderStatus: OrderStatuses;
    payments: (Payment & {
        paymentMethod: PaymentMethod;
    })[];
    orderItems: (OrderItem & {
        product: Product & {
            images: ProductImage[];
        };
    })[];
    DiscountUsage: (DiscountUsage & {
        discount: Discount;
    })[];
};
export declare class OrderMappers {
    static formatOrderForAdminDetailResponse(order: FullPrismaOrder): {
        id: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customer: {
            name: string;
            email: string;
            phone: string;
        };
        store: {
            name: string;
        };
        shipping: {
            address: string;
        };
        payment: {
            method: string;
            status: string;
            proofUrl: string;
        };
        pricing: {
            subtotal: string;
            discount: string;
            cost: string;
            total: string;
        };
        items: {
            id: number;
            name: string;
            quantity: number;
            price: string;
            imageUrl: string;
        }[];
    };
    static formatOrderForUserDetailResponse(order: FullUserPrismaOrder): {
        id: number;
        createdAt: Date;
        totalPrice: string;
        subtotal: string;
        shippingCost: string;
        discountAmount: string;
        destinationAddress: {
            name: string;
            phone: string;
            fullAddress: string;
        };
        store: {
            id: number;
            name: string;
        };
        status: import(".prisma/client").$Enums.OrderStatus;
        payment: {
            method: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
        };
        items: {
            id: number;
            quantity: number;
            priceAtPurchase: string;
            product: {
                id: number;
                name: string;
                imageUrl: string;
            };
        }[];
    };
}
export {};
//# sourceMappingURL=OrderMappers.d.ts.map