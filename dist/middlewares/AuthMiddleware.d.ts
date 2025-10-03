import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        store_id?: number | null;
    };
}
<<<<<<< HEAD
export declare const authMiddleware: (roles?: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
=======
export declare const authMiddleware: (roles?: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
>>>>>>> origin/temporary-3
//# sourceMappingURL=AuthMiddleware.d.ts.map