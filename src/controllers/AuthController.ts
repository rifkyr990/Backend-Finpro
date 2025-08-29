import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import AuthService from "../services/AuthService";

class AuthController {
    // REGISTRASI USER/TENANT TANPA PASSWORD
    public static register = asyncHandler(async (req: Request, res: Response) => {
        const { first_name, last_name, email, role } = req.body;

        if (!first_name || !last_name || !email || !role) {
            return ApiResponse.error(res, "Semua field wajib diisi", 400);
        }

        if (!["CUSTOMER", "TENANT"].includes(role)) {
            return ApiResponse.error(res, "Role tidak valid", 400);
        }

        const { user } = await AuthService.register(first_name, last_name, email, role);

        return ApiResponse.success(res, { email: user.email },"Registrasi berhasil, silakan cek email untuk verifikasi",201);
    });

    // VERIFIKASI EMAIL + SET PASSWORD
    public static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
        const { token, password } = req.body;

        if (!token || !password) {
            return ApiResponse.error(res, "Token dan password wajib diisi", 400);
        }
        await AuthService.verifyEmailAndSetPassword(token, password);

        return ApiResponse.success(res, null, "Verifikasi berhasil, silakan login");
    });

    // LOGIN DENGAN VALIDASI VERIFIKASI
    public static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return ApiResponse.error(res, "Email dan password wajib diisi", 400);
        }
        const { user, token } = await AuthService.login(email, password);

        return ApiResponse.success(res, { token, user }, "Login berhasil");
    });

    // Request untuk reset password
    public static requestResetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) return ApiResponse.error(res, "Email wajib diisi", 400);

        await AuthService.requestPasswordReset(email);
        return ApiResponse.success(res, null, "Token reset sudah dikirim ke email");
    });

    public static resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { token, new_password } = req.body;
        if (!token || !new_password) return ApiResponse.error(res, "Token wajid diisi dulu", 400);

        await AuthService.resetPasswordWithToken(token, new_password);

        return ApiResponse.success(res, null, "Password berhasil direset");
    })

    // AMBIL PROFIL USER
    public static getProfile = asyncHandler(async (req: Request, res: Response) => {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return ApiResponse.error(res, "User tidak ditemukan", 404);
        }

        return ApiResponse.success(res, user, "Profile fetched successfully");
    });
}

export default AuthController;
