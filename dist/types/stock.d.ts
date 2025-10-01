export interface StockChangeData {
    user_id: string;
    product_id: number;
    type: "IN" | "OUT";
    updated_stock: number;
    prev_qty: number;
    min_stock: number;
    reason: string;
}
export interface HistoryQueryParams {
    storeId?: string;
    month?: string;
    year?: string;
}
//# sourceMappingURL=stock.d.ts.map