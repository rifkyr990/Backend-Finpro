import { Request, Response, NextFunction } from "express";
type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const asyncHandler: (fn: ControllerFunction) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=AsyncHandler.d.ts.map