import { Prisma } from "@prisma/client";
interface GetMyOrdersParams {
    userId: string;
    page: string;
    limit: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}
export declare class UserOrderReads {
    static getPaginatedUserOrders(params: GetMyOrdersParams): Promise<{
        orders: {
            id: number;
            createdAt: Date;
            totalPrice: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            totalItems: number;
<<<<<<< HEAD
            firstProductImage: string;
=======
            firstProductImage: string | null;
>>>>>>> origin/temporary-3
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalOrders: number;
        };
    }>;
    static getFullOrderDetail(userId: string, orderId: number): Promise<{
        store: {
            name: string;
            id: number;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            address: string | null;
            province: string | null;
            province_id: string | null;
            city: string | null;
            city_id: string | null;
            latitude: number | null;
            longitude: number | null;
            is_active: boolean;
            is_main_store: boolean;
        };
        orderItems: ({
            product: {
                images: {
                    id: number;
                    image_url: string;
                    created_at: Date;
                    product_id: number;
                }[];
            } & {
                name: string;
                id: number;
                created_at: Date;
                is_deleted: boolean;
                is_active: boolean;
                category_id: number;
                description: string | null;
                price: string;
            };
        } & {
            id: number;
            store_id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            quantity: number;
            order_id: number;
            price_at_purchase: Prisma.Decimal;
        })[];
        orderStatus: {
            id: number;
            status: import(".prisma/client").$Enums.OrderStatus;
        };
        payments: ({
            paymentMethod: {
                name: string;
                id: number;
                type: string;
            };
        } & {
            id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            order_id: number;
            payment_method_id: number;
            amount: Prisma.Decimal;
            transaction_id: string | null;
            paid_at: Date | null;
        })[];
        DiscountUsage: ({
            discount: {
                name: string;
                id: number;
                store_id: number | null;
                is_deleted: boolean;
                product_id: number | null;
                description: string | null;
<<<<<<< HEAD
                createdAt: Date;
=======
>>>>>>> origin/temporary-3
                type: import(".prisma/client").$Enums.DiscountType;
                code: string;
                minPurch: Prisma.Decimal | null;
                minQty: number | null;
                freeQty: number | null;
                discAmount: Prisma.Decimal | null;
                valueType: import(".prisma/client").$Enums.ValueType | null;
                start_date: Date;
                end_date: Date;
<<<<<<< HEAD
=======
                createdAt: Date;
>>>>>>> origin/temporary-3
                createdBy: string;
            };
        } & {
            id: number;
            user_id: string | null;
            status: import(".prisma/client").$Enums.DiscountUsageStatus;
            order_id: number | null;
            discount_id: number;
            useAt: Date;
        })[];
    } & {
        id: number;
        store_id: number;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        latitude: number | null;
        longitude: number | null;
        total_price: Prisma.Decimal;
        order_status_id: number;
        destination_address: string;
        subtotal: Prisma.Decimal;
        shipping_cost: Prisma.Decimal;
        discount_amount: Prisma.Decimal;
    }>;
}
export {};
//# sourceMappingURL=UserOrderReads.d.ts.map