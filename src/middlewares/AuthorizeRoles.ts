import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./AuthMiddleware";

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found in request",
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Access denied",
            });
        }

        next();
    };
};
