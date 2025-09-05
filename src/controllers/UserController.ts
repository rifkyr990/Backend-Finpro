// src/controllers/UserController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import UserService from "../services/UserService";
import AuthService from "../services/AuthService";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import prisma from "../config/prisma";

class UserController {
    // public uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    //     if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);
    //     if (!req.file) return ApiResponse.error(res, "File tidak ditemukan", 400);

    //     const updatedUser = await UserService.uploadProfilePicture(req.user.id, req.file.buffer);
    //     return ApiResponse.success(res, updatedUser, "Profile picture berhasil diupdate");
    // });

    public static updateProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);
        if (!req.file) return ApiResponse.error(res, "File tidak ditemukan", 400);

        const user = await UserService.updateProfilePicture(req.user.id, req.file.buffer);
        return ApiResponse.success(res, user, "Profile picture berhasil diupdate");
    });

    public static getProfile = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const profile = await UserService.getProfile(userId);

        return ApiResponse.success(res, profile, "Profile berhasil diambil");
    });

    public static updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const updated = await UserService.updateProfile(userId, req.body);

        return ApiResponse.success(res, updated, "Profile Berhasil diperbaharui");
    });

    public static changePassword = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return ApiResponse.error(res, "Password lama & baru wajib diisi dulu gaes", 400);
        }

        await UserService.changePassword(userId, oldPassword, newPassword);
        return ApiResponse.success(res, null, "Password berhasil dirubah");
    });

    public static resendVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return ApiResponse.error(res, "Unauthorized", 401);
        }

        // Ambil user dari DB dulu
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return ApiResponse.error(res, "User tidak ditemukan", 404);
        }

        const result = await AuthService.resendVerification(user.email);
        return ApiResponse.success(res, result, "Email verifikasi berhasil dikirim ulang");
    });



}

export default UserController;
