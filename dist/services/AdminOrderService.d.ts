import { AdminOrderQueryParams } from "../types/query-params";
type AuthenticatedUser = {
    id: string;
    email: string;
    role: string;
    store_id?: number | null;
};
declare class AdminOrderService {
    static getAllAdminOrders(user: AuthenticatedUser, query: AdminOrderQueryParams): Promise<{
        orders: {
            id: number;
            createdAt: Date;
            customerName: string;
            storeName: string;
            totalPrice: string;
            totalItems: number;
            status: import(".prisma/client").$Enums.OrderStatus;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalOrders: number;
        };
    }>;
    static getAdminOrderDetail(user: AuthenticatedUser, orderId: number): Promise<{
        id: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customer: {
<<<<<<< HEAD
            name: string;
            email: string;
            phone: string;
=======
            name: string | undefined;
            email: string;
            phone: string | null;
>>>>>>> origin/temporary-3
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
<<<<<<< HEAD
            proofUrl: string;
=======
            proofUrl: string | null;
>>>>>>> origin/temporary-3
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
    }>;
    static confirmPayment(orderId: number): Promise<void>;
    static rejectPayment(orderId: number): Promise<void>;
    static sendOrder(orderId: number): Promise<void>;
    static adminCancelOrder(orderId: number, adminId: string): Promise<void>;
    static markAsRefunded(orderId: number): Promise<void>;
    static getOrderSummary(user: AuthenticatedUser): Promise<Record<string, number>>;
}
export default AdminOrderService;
//# sourceMappingURL=AdminOrderService.d.ts.map