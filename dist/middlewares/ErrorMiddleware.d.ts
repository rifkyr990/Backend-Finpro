import { Request, Response, NextFunction } from "express";
export default class ErrorMiddleware {
    static handle(err: any, req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=ErrorMiddleware.d.ts.map