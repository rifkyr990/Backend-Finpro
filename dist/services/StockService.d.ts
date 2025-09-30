import { HistoryQueryParams, StockChangeData } from "../types/stock";
declare class StockService {
    static getAllProductStocks: () => Promise<{
        id: number;
        created_at: Date;
        updated_at: Date;
        store: {
            name: string;
            id: number;
        };
        product: {
            name: string;
            id: number;
            is_active: boolean;
        };
        stock_quantity: number;
        min_stock: number;
    }[]>;
    static changeProductStock: (storeId: number, data: StockChangeData) => Promise<{
        updatedStockRecord: {
            id: number;
            store_id: number;
            created_at: Date;
            updated_at: Date;
            product_id: number;
            stock_quantity: number;
            min_stock: number;
        };
        stockHistoryRecord: {
            id: number;
            created_at: Date;
            user_id: string | null;
            quantity: number;
            order_id: number | null;
            type: import(".prisma/client").$Enums.StockChangeType;
            min_stock: number;
            prev_stock: number;
            updated_stock: number;
            reason: string;
            created_by_name: string;
            productStockId: number;
        };
    }>;
    static getAllStockHistory: () => Promise<{
        created_at: Date;
        quantity: number;
        type: import(".prisma/client").$Enums.StockChangeType;
        min_stock: number;
        prev_stock: number;
        updated_stock: number;
        reason: string;
        created_by: {
            first_name: string;
            last_name: string;
        } | null;
        productStock: {
            store: {
                name: string;
            };
            product: {
                name: string;
            };
        };
    }[]>;
    static getStockHistoryWithSummary: (query: HistoryQueryParams) => Promise<{
        stockHistory: {
            created_at: Date;
            quantity: number;
            type: import(".prisma/client").$Enums.StockChangeType;
            min_stock: number;
            prev_stock: number;
            updated_stock: number;
            reason: string;
            created_by_name: string;
            productStock: {
                store: {
                    name: string;
                };
                product: {
                    name: string;
                };
            };
        }[];
        summary: {
            totalAddition: number;
            totalReduction: number;
            totalOutOfStock: number;
        };
    }>;
}
export default StockService;
//# sourceMappingURL=StockService.d.ts.map