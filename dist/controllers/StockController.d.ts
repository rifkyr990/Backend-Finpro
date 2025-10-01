import { Request, Response } from "express";
declare class StockController {
    static getProductStocks: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static postChangeProductStock: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProductStockHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProductStockHistoryAllStoreSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProductStockHistorySummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export default StockController;
//# sourceMappingURL=StockController.d.ts.map