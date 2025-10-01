import { Response, NextFunction } from "express";
import { AuthRequest } from "./AuthMiddleware";
export declare const authorizeRoles: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=AuthorizeRoles.d.ts.map