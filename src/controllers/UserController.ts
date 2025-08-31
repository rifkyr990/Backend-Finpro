// src/controllers/UserController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import UserService from "../services/UserService";

class UserController {
    public uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);
        if (!req.file) return ApiResponse.error(res, "File tidak ditemukan", 400);

        const updatedUser = await UserService.uploadProfilePicture(req.user.id, req.file.buffer);
        return ApiResponse.success(res, updatedUser, "Profile picture berhasil diupdate");
    });

    public updateProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);
        if (!req.file) return ApiResponse.error(res, "File tidak ditemukan", 400);

        const user = await UserService.updateProfilePicture(req.user.id, req.file.buffer);
        return ApiResponse.success(res, user, "Profile picture berhasil diupdate");
    });

    public deleteProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);

        const user = await UserService.deleteProfilePicture(req.user.id);
        return ApiResponse.success(res, user, "Profile picture berhasil dihapus");
    })
}

export default new UserController();
