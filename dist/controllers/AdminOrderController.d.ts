import { Response } from "express";
declare class AdminOrderController {
    static getAllAdminOrders: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getAdminOrderDetail: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static confirmPayment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static rejectPayment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static sendOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static adminCancelOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static markAsRefunded: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getOrderSummary: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export default AdminOrderController;
//# sourceMappingURL=AdminOrderController.d.ts.map