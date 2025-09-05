import { Request, Response } from "express";
import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import AuthService from "../services/AuthService";
import GoogleAuthService from "../services/GoogleAuthService";
import cloudinary from "../config/cloudinary";

class AuthController {
    // REGISTRASI USER/TENANT TANPA PASSWORD
    public static register = asyncHandler(async (req: Request, res: Response) => {
        const { first_name, last_name, email } = req.body;

        if (!first_name || !last_name || !email) {
            return ApiResponse.error(res, "Semua field wajib diisi", 400);
        }

        const { user } = await AuthService.register(first_name, last_name, email);

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

    // KIRIM ULANG VERIFIKASI EMAIL
    public static resendVerification = asyncHandler(async (req: Request, res: Response) => {
        console.log("ini req: body", req.body);
        const { email } = req.body;
        const result = await AuthService.resendVerification(email);

        return ApiResponse.success(res, result, "Verifikasi email berhasil dikirim ulang");
    })

    // REQUEST UNTUK RESET PASSWORD
    public static requestResetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) return ApiResponse.error(res, "Email wajib diisi", 400);

        await AuthService.requestPasswordReset(email);
        return ApiResponse.success(res, null, "Token reset sudah dikirim ke email");
    });

    public static resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { token, new_password } = req.body;
        if (!token || !new_password) return ApiResponse.error(res, "Token wajid diisi dulu, kalo nggak ada beli", 400);

        await AuthService.resetPasswordWithToken(token, new_password);

        return ApiResponse.success(res, null, "Password berhasil direset");
    })

    // LOGIN PAKE AKUN GOOGLE
    public static loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
        const { idToken } = req.body;
        if (!idToken) {
            return ApiResponse.error(res, "Token Google nggak ditemukan", 400);
        }
        const { user, token } = await GoogleAuthService.loginWithGoogle(idToken);

        return ApiResponse.success(res, { token, user }, "Login dengan google berhasil");
    });

    // UPDATE PROFILE PICTURE
    public static uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) return ApiResponse.error(res, "File tidak ditemukan", 400);

        const userId = (req as any).user?.id;
        if (!userId) return ApiResponse.error(res, "Unauthorized", 401);

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: "profile_pictures",
                resource_type: "image",
            }, (error, uploaded) => {
                if (error) reject(error);
                else resolve(uploaded);
            }).end(req.file?.buffer);
        });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image_url: result.secure_url },
        });

        return ApiResponse.success(res, updatedUser, "Profile berhasil diupdate")
    })
}

export default AuthController;
