"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const AuthService_1 = __importDefault(require("../services/AuthService"));
const GoogleAuthService_1 = __importDefault(require("../services/GoogleAuthService"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
class AuthController {
}
_a = AuthController;
// REGISTRASI USER/TENANT TANPA PASSWORD
AuthController.register = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
        return ApiResponse_1.ApiResponse.error(res, "Semua field wajib diisi", 400);
    }
    const { user } = await AuthService_1.default.register(first_name, last_name, email);
    return ApiResponse_1.ApiResponse.success(res, { email: user.email }, "Registrasi berhasil, silakan cek email untuk verifikasi", 201);
});
// VERIFIKASI EMAIL + SET PASSWORD
AuthController.verifyEmail = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return ApiResponse_1.ApiResponse.error(res, "Token dan password wajib diisi", 400);
    }
    if (password.length < 8) {
        return ApiResponse_1.ApiResponse.error(res, "Password minimal 8 karakter", 400);
    }
    try {
        await AuthService_1.default.verifyEmailAndSetPassword(token, password);
        return ApiResponse_1.ApiResponse.success(res, null, "Verifikasi berhasil, silakan login");
    }
    catch (error) {
        return ApiResponse_1.ApiResponse.error(res, error.message || "Terjadi kesalahan", 400);
    }
});
// LOGIN DENGAN VALIDASI VERIFIKASI
AuthController.login = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return ApiResponse_1.ApiResponse.error(res, "Email dan password wajib diisi", 400);
    }
    const { user, token } = await AuthService_1.default.login(email, password);
    return ApiResponse_1.ApiResponse.success(res, { token, user }, "Login berhasil");
});
// KIRIM ULANG VERIFIKASI EMAIL
AuthController.resendVerification = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    console.log("ini req: body", req.body);
    const { email } = req.body;
    const result = await AuthService_1.default.resendVerification(email);
    return ApiResponse_1.ApiResponse.success(res, result, "Verifikasi email berhasil dikirim ulang");
});
// KIRIM ULANG VERIFIKASI EMAIL
AuthController.resendRegistVerification = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    console.log("ini req: body", req.body);
    const { email } = req.body;
    const result = await AuthService_1.default.resendRegistVerification(email);
    return ApiResponse_1.ApiResponse.success(res, result, "Verifikasi email berhasil dikirim ulang");
});
// REQUEST UNTUK RESET PASSWORD
AuthController.requestResetPassword = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        return ApiResponse_1.ApiResponse.error(res, "Email wajib diisi", 400);
    await AuthService_1.default.requestPasswordReset(email);
    return ApiResponse_1.ApiResponse.success(res, null, "Token reset sudah dikirim ke email");
});
AuthController.resetPassword = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, new_password } = req.body;
    if (!token || !new_password)
        return ApiResponse_1.ApiResponse.error(res, "Token wajid diisi dulu, kalo nggak ada beli", 400);
    await AuthService_1.default.resetPasswordWithToken(token, new_password);
    return ApiResponse_1.ApiResponse.success(res, null, "Password berhasil direset");
});
// LOGIN PAKE AKUN GOOGLE
AuthController.loginWithGoogle = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return ApiResponse_1.ApiResponse.error(res, "Token Google nggak ditemukan", 400);
    }
    const { user, token } = await GoogleAuthService_1.default.loginWithGoogle(idToken);
    return ApiResponse_1.ApiResponse.success(res, { token, user }, "Login dengan google berhasil");
});
// UPDATE PROFILE PICTURE
AuthController.uploadProfilePicture = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        return ApiResponse_1.ApiResponse.error(res, "File tidak ditemukan", 400);
    const userId = req.user?.id;
    if (!userId)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    const result = await new Promise((resolve, reject) => {
        cloudinary_1.default.uploader.upload_stream({
            folder: "profile_pictures",
            resource_type: "image",
        }, (error, uploaded) => {
            if (error)
                reject(error);
            else
                resolve(uploaded);
        }).end(req.file?.buffer);
    });
    const updatedUser = await prisma_1.default.user.update({
        where: { id: userId },
        data: { image_url: result.secure_url },
    });
    return ApiResponse_1.ApiResponse.success(res, updatedUser, "Profile berhasil diupdate");
});
exports.default = AuthController;
//# sourceMappingURL=AuthController.js.map