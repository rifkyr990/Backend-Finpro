import { Request, Response } from "express";
declare class DiscountController {
    static getAllDiscount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static softDeleteDiscount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createDiscount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static verifyDiscount: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export default DiscountController;
//# sourceMappingURL=DiscountController.d.ts.map