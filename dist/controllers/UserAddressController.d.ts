import { Request, Response } from "express";
declare class UserAddressController {
    static getAddress: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createAddress: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateAddress: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static setPrimaryAddress: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteAddress: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export default UserAddressController;
//# sourceMappingURL=UserAddressController.d.ts.map