import { Request, Response } from "express";
declare class UserController {
<<<<<<< HEAD
    static getAllUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static getAllCustomers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static getAllStoreAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static softDeleteUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static assignAdminbyId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static revertAdminbyId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    static updateProfilePicture: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
=======
    static getAllUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static getAllCustomers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static getAllStoreAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static softDeleteUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static assignAdminbyId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static revertAdminbyId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    static updateProfilePicture: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
>>>>>>> origin/temporary-3
    static changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static verifyNewEmail: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export default UserController;
//# sourceMappingURL=UserController.d.ts.map