import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request
export interface AuthRequest extends Request {
    user?: { id: string; email: string; role: string; store_id?: number | null };
}

export const authMiddleware = (roles: string[] = []) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            ) as unknown as { id: string; email: string; role: string; store_id?: number | null };

            req.user = decoded;

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }

            next();
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    };
};