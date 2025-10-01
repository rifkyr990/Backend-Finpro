import { Prisma } from "@prisma/client";
interface CreateOrderPayload {
    userId: string;
    addressId: number;
    storeId: number;
    shippingCost: string;
    paymentMethodId: number;
    promoCode?: string | null;
}
declare class OrderService {
    static createOrder(payload: CreateOrderPayload): Promise<{
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
    static getOrderById(userId: string, orderId: number): Promise<{
        id: number;
        createdAt: Date;
        totalPrice: string;
        subtotal: string;
        shippingCost: string;
        discountAmount: string;
        destinationAddress: {
            name: string | undefined;
            phone: string | null;
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
        } | null;
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
    }>;
    static getMyOrders(params: {
        userId: string;
        page: string;
        limit: string;
        search?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        orders: {
            id: number;
            createdAt: Date;
            totalPrice: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            totalItems: number;
            firstProductImage: string | null;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalOrders: number;
        };
    }>;
    static cancelOrder(userId: string, orderId: number): Promise<void>;
    static confirmReceipt(userId: string, orderId: number): Promise<void>;
    static validateRepay(userId: string, orderId: number): Promise<void>;
    static uploadPaymentProof(userId: string, orderId: number, file?: Express.Multer.File): Promise<void>;
}
export default OrderService;
//# sourceMappingURL=OrderService.d.ts.map