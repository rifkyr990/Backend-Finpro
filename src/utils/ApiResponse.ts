import { Response } from "express";

export class ApiResponse {
    static success(res: Response, data: any, message = "Success", status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data,
        });
    }

    static error(res: Response, message = "Something went wrong", status = 500, errors: any = null) {
        return res.status(status).json({
            success: false,
            message,
            errors,
        });
    }
}
