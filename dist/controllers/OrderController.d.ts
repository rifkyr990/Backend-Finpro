import { Response } from "express";
declare class OrderController {
    static createOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getOrderById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static uploadPaymentProof: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getMyOrders: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static cancelOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static confirmReceipt: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static repayOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export default OrderController;
//# sourceMappingURL=OrderController.d.ts.map