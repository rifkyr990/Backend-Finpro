import { Request, Response } from "express";
declare class AuthController {
    static register: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static verifyEmail: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static resendVerification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static resendRegistVerification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static requestResetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static loginWithGoogle: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static uploadProfilePicture: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export default AuthController;
//# sourceMappingURL=AuthController.d.ts.map