export declare class AdminOrderMutations {
    static confirmPaymentTransaction(orderId: number): Promise<{
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone: string | null;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            is_verified: boolean;
            image_url: string | null;
            image_id: string | null;
            store_id: number | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
        };
        payments: {
            id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            order_id: number;
            payment_method_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            transaction_id: string | null;
            paid_at: Date | null;
        }[];
    } & {
        id: number;
        store_id: number;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        latitude: number | null;
        longitude: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_status_id: number;
        destination_address: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shipping_cost: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    static rejectPaymentTransaction(orderId: number): Promise<{
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone: string | null;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            is_verified: boolean;
            image_url: string | null;
            image_id: string | null;
            store_id: number | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
        };
    } & {
        id: number;
        store_id: number;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        latitude: number | null;
        longitude: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_status_id: number;
        destination_address: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shipping_cost: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    static sendOrderTransaction(orderId: number): Promise<{
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone: string | null;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            is_verified: boolean;
            image_url: string | null;
            image_id: string | null;
            store_id: number | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
        };
    } & {
        id: number;
        store_id: number;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        latitude: number | null;
        longitude: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_status_id: number;
        destination_address: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shipping_cost: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    static adminCancelOrderTransaction(orderId: number, adminId: string): Promise<{
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone: string | null;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            is_verified: boolean;
            image_url: string | null;
            image_id: string | null;
            store_id: number | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
        };
        orderItems: {
            id: number;
            store_id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            quantity: number;
            order_id: number;
            price_at_purchase: import("@prisma/client/runtime/library").Decimal;
        }[];
        orderStatus: {
            id: number;
            status: import(".prisma/client").$Enums.OrderStatus;
        };
    } & {
        id: number;
        store_id: number;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        latitude: number | null;
        longitude: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_status_id: number;
        destination_address: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        shipping_cost: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    static markAsRefundedTransaction(orderId: number): Promise<void>;
}
//# sourceMappingURL=AdminOrderMutations.d.ts.map