import { Request, Response, NextFunction } from "express";

export default class ErrorMiddleware {
    public static handle(err: any, req: Request, res: Response, next: NextFunction) {
        console.error(err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
}