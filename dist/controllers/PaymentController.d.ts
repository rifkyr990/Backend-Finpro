import { Response } from "express";
declare class PaymentController {
    static createTransaction: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static handleMidtransNotification: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export default PaymentController;
//# sourceMappingURL=PaymentController.d.ts.map