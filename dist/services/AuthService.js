"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VerificationEmail_1 = require("./../templates/VerificationEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_2 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const ResetPassword_1 = require("../templates/ResetPassword");
const validatePassword_1 = require("../utils/validatePassword");
class AuthService {
    async register(first_name, last_name, email) {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error("Email sudah digunakan");
        const user = await prisma_1.default.user.create({
            data: {
                first_name,
                last_name,
                email,
                role: "CUSTOMER",
                is_verified: false,
            },
        });
        const token = crypto_1.default.randomBytes(32).toString("hex");
        await prisma_1.default.verificationToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() + 60 * 60 * 1000),
                used: false,
            },
        });
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        await (0, email_1.sendEmail)({
            to: user.email,
<<<<<<< HEAD
            subject: "Verifikasi Email Anda - Groceria",
=======
            subject: "Verifikasi Email Anda - FreshCart",
>>>>>>> origin/temporary-3
            text: `Klik tautan berikut untuk memverifikasi email Anda: ${verificationUrl}`,
            html: (0, VerificationEmail_1.verificationEmailTemplate)(verificationUrl),
        });
        return { user };
    }
    async verifyEmailAndSetPassword(token, password) {
        const verificationToken = await prisma_1.default.verificationToken.findFirst({
            where: {
                token,
                used: false,
                expires_at: { gt: new Date() },
            },
            include: { user: true },
        });
        if (!verificationToken) {
            throw new Error("Token tidak valid atau sudah kedaluwarsa");
        }
        const error = (0, validatePassword_1.validatePassword)(password);
        if (error)
            throw new Error(error);
        const hashedPassword = await (0, bcrypt_2.hashPassword)(password);
        await prisma_1.default.user.update({
            where: { id: verificationToken.user_id },
            data: {
                password: hashedPassword,
                is_verified: true,
            },
        });
        await prisma_1.default.verificationToken.update({
            where: { id: verificationToken.id },
            data: { used: true },
        });
        return true;
    }
    // Internal reusable method untuk kirim email verifikasi
    async _sendVerificationEmail(userId, email, path) {
        await prisma_1.default.verificationToken.deleteMany({
            where: {
                user_id: userId,
                used: false,
                expires_at: { gt: new Date() },
            },
        });
        const token = crypto_1.default.randomBytes(32).toString("hex");
        await prisma_1.default.verificationToken.create({
            data: {
                user_id: userId,
                token,
                expires_at: new Date(Date.now() + 60 * 60 * 1000),
                used: false,
            },
        });
        const verificationUrl = `${process.env.FRONTEND_URL}${path}?token=${token}`;
        await (0, email_1.sendEmail)({
            to: email,
<<<<<<< HEAD
            subject: "Verifikasi Email Anda - Groceria",
=======
            subject: "Verifikasi Email Anda - FreshCart",
>>>>>>> origin/temporary-3
            text: `Klik tautan berikut untuk memverifikasi email Anda: ${verificationUrl}`,
            html: (0, VerificationEmail_1.verificationEmailTemplate)(verificationUrl),
        });
    }
    // Untuk kirim ulang verifikasi dari halaman profil atau update email
    async resendVerification(email) {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("User tidak ditemukan");
        if (user.is_verified)
            throw new Error("Akun sudah terverifikasi");
        await this._sendVerificationEmail(user.id, user.email, "/auth/verify-new-email");
        return { message: "Email verifikasi berhasil dikirim ulang" };
    }
    // Untuk kirim ulang verifikasi setelah registrasi
    async resendRegistVerification(email) {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("User tidak ditemukan");
        if (user.is_verified)
            throw new Error("Akun sudah terverifikasi");
        await this._sendVerificationEmail(user.id, user.email, "/verify-email");
        return { message: "Email verifikasi berhasil dikirim ulang" };
    }
    async login(email, password) {
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { store: { select: { name: true } } },
        });
        if (!user || !user.password)
            throw new Error("Email atau password salah");
        const isValid = await (0, bcrypt_2.comparePassword)(password, user.password);
        if (!isValid)
            throw new Error("Email atau password salah");
        const token = (0, jwt_1.signToken)({
            id: user.id,
            role: user.role,
            email: user.email,
            store_id: user.store_id,
        });
        return { user, token };
    }
    async requestPasswordReset(email) {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("Email tidak ditemukan");
        const token = (0, uuid_1.v4)();
        const expiresAt = (0, date_fns_1.addMinutes)(new Date(), 30);
        await prisma_1.default.passwordResetToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: expiresAt,
            },
        });
        console.log(`[RESET PASSWORD] Token untuk ${email}: ${token}`);
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await (0, email_1.sendEmail)({
            to: user.email,
            subject: "Reset Password Akun Anda",
            text: `Klik tautan berikut untuk reset password Anda: ${resetUrl}`,
            html: (0, ResetPassword_1.requestResetPasswordEmail)(resetUrl),
        });
    }
    async resetPasswordWithToken(token, newPassword) {
        const resetToken = await prisma_1.default.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetToken || resetToken.used || resetToken.expires_at < new Date()) {
            throw new Error("Token tidak valid atau kadaluarsa");
        }
        const error = (0, validatePassword_1.validatePassword)(newPassword);
        if (error)
            throw new Error(error);
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: resetToken.user_id },
            data: { password: hashed },
        });
        await prisma_1.default.passwordResetToken.update({
            where: { token },
            data: { used: true },
        });
        return true;
    }
}
exports.default = new AuthService();
//# sourceMappingURL=AuthService.js.map