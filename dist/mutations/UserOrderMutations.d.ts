import { Prisma, Discount, Cart, CartItem, Product, UserAddress } from "@prisma/client";
type UserCart = Cart & {
    cartItems: (CartItem & {
        product: Product;
    })[];
};
interface CreateOrderTransactionPayload {
    tx: Prisma.TransactionClient;
    userId: string;
    storeId: number;
    userCart: UserCart;
    userAddress: UserAddress;
    destinationAddress: string;
    paymentMethodId: number;
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    totalPrice: number;
    finalAppliedDiscount: Discount | null;
}
export declare class UserOrderMutations {
    static createOrderTransaction(payload: CreateOrderTransactionPayload): Promise<{
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
    static cancelOrderTransaction(userId: string, orderId: number): Promise<{
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
            price_at_purchase: Prisma.Decimal;
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
        total_price: Prisma.Decimal;
        order_status_id: number;
        destination_address: string;
        subtotal: Prisma.Decimal;
        shipping_cost: Prisma.Decimal;
        discount_amount: Prisma.Decimal;
    }>;
    static confirmReceiptTransaction(userId: string, orderId: number): Promise<{
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
    static validateRepay(userId: string, orderId: number): Promise<boolean>;
    static uploadPaymentProofTransaction(userId: string, orderId: number, imageUrl: string): Promise<void>;
}
export {};
//# sourceMappingURL=UserOrderMutations.d.ts.map