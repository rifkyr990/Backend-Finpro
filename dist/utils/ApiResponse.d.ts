import { Response } from "express";
export declare class ApiResponse {
    static success(res: Response, data: any, message?: string, status?: number): Response<any, Record<string, any>>;
    static error(res: Response, message?: string, status?: number, errors?: any): Response<any, Record<string, any>>;
}
//# sourceMappingURL=ApiResponse.d.ts.map