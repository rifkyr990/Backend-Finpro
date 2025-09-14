import { verificationEmailTemplate } from './../templates/VerificationEmail';
import bcrypt from 'bcrypt';
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { signToken } from "../utils/jwt";
import crypto from "crypto";
import { sendEmail } from '../utils/email';
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { requestResetPasswordEmail } from '../templates/ResetPassword';

class AuthService {
    // REGISTRASI TANPA PASSWORD + TOKEN VERIFIKASI
    public async register(first_name: string, last_name: string, email: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("Email sudah digunakan");

        const user = await prisma.user.create({
            data: {
                first_name,
                last_name,
                email,
                role: "CUSTOMER",
                is_verified: false,
            },
        });

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.verificationToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() + 60 * 60 * 1000),
                used: false,
            },
        });

        // await sendVerificationEmail(email, token, role);
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        await sendEmail({
            to: user.email,
            subject: "Verifikasi Email Anda - FreshCart",
            text: `Klik tautan berikut untuk memverifikasi email Anda: ${verificationUrl}`,
            html: verificationEmailTemplate(verificationUrl),
        });

        return { user };
    }

    // VERIFIKASI EMAIL + SET PASSWORD
    public async verifyEmailAndSetPassword(token: string, password: string) {
        const verificationToken = await prisma.verificationToken.findFirst({
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

        const hashedPassword = await hashPassword(password);

        await prisma.user.update({
            where: { id: verificationToken.user_id },
            data: {
                password: hashedPassword,
                is_verified: true,
            },
        });

        await prisma.verificationToken.update({
            where: { id: verificationToken.id },
            data: { used: true },
        });

        return true;
    }

    // Resend verifikasi email
    public async resendVerification(email: string) {
        const user = await prisma.user.findUnique({ where: { email }});

        if(!user) throw new Error("User tidak ditemukan");
        if (user.is_verified) throw new Error("Akun sudah terverifikasi");

        await prisma.verificationToken.deleteMany({
            where: {
                user_id: user.id,
                used: false,
                expires_at: { gt: new Date() },
            }
        });

        const token = crypto.randomBytes(32).toString("hex");
        await prisma.verificationToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() + 60 * 60 * 1000),
                used: false,
            }
        });

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: "Kirim Ulang Verifikasi Email - FreshCart",
            text: `Klik tautan berikut untuk memverifikasi email Anda: ${verificationUrl}`,
            html: verificationEmailTemplate(verificationUrl),
        });

        return { message: "Email verifikasi berhasil dikirim ulang" };
    }

    // LOGIN (dengan cek is_verified)
    public async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) throw new Error("Email atau password salah");
        if (!user.is_verified) throw new Error("Akun belum diverifikasi");

        const isValid = await comparePassword(password, user.password);
        if (!isValid) throw new Error("Email atau password salah");

        const token = signToken({ id: user.id, role: user.role, email: user.email });
        return { user, token };
    }

    // Request Reset Password
    public async requestPasswordReset(email: string) {
        const user = await prisma.user.findUnique({ where: { email }});

        if (!user) throw new Error("Email tidak ditemukan");

        const token = uuidv4();
        const expiresAt = addMinutes(new Date(), 30);

        await prisma.passwordResetToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: expiresAt
            },
        });

        console.log(`[RESET PASSWORD] Token untuk ${email}: ${token}`);
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await sendEmail({
            to: user.email,
            subject: "Reset Password Akun Anda",
            text: `Klik tautan berikut untuk reset password Anda: ${resetUrl}`,
            html: requestResetPasswordEmail(resetUrl),
        });
    }

    public async resetPasswordWithToken(token: string, newPassword: string) {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken || resetToken.used || resetToken.expires_at < new Date()) {
            throw new Error("Token tidak valid atau kadaluarsa")
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        // update data user
        await prisma.user.update({
            where: { id: resetToken.user_id },
            data: { password: hashed },
        });

        await prisma.passwordResetToken.update({
            where: { token },
            data: { used: true }
        });
    }
}

export default new AuthService();
