import { AdminOrderQueryParams } from "../types/query-params";
type AuthenticatedUser = {
    id: string;
    email: string;
    role: string;
    store_id?: number | null;
};
export declare class AdminOrderReads {
    static getPaginatedAdminOrders(user: AuthenticatedUser, query: AdminOrderQueryParams): Promise<{
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
    private static buildWhereClause;
    static getOrderSummary(user: AuthenticatedUser): Promise<Record<string, number>>;
}
export {};
//# sourceMappingURL=AdminOrderReads.d.ts.map