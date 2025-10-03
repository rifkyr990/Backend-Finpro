import { Response, NextFunction } from "express";
import { AuthRequest } from "./AuthMiddleware";
<<<<<<< HEAD
export declare const authorizeRoles: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
=======
export declare const authorizeRoles: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
>>>>>>> origin/temporary-3
//# sourceMappingURL=AuthorizeRoles.d.ts.map