import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { signToken } from "../utils/jwt";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email"; // kamu perlu buat ini

class AuthService {
    // REGISTRASI TANPA PASSWORD + TOKEN VERIFIKASI
    public async register(first_name: string, last_name: string, email: string, role: "CUSTOMER" | "TENANT") {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("Email sudah digunakan");

        const user = await prisma.user.create({
            data: {
                first_name,
                last_name,
                email,
                role,
                is_verified: false,
            },
        });

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.verificationToken.create({
            data: {
                user_id: user.id,
                token,
                expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 jam
                used: false,
            },
        });

        await sendVerificationEmail(email, token, role);

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

    // LOGIN (dengan cek is_verified)
    public async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) throw new Error("Email atau password salah");

        if (!user.is_verified) throw new Error("Akun belum diverifikasi");

        const isValid = await comparePassword(password, user.password);
        if (!isValid) throw new Error("Email atau password salah");

        const token = signToken({ id: user.id, role: user.role });

        return { user, token };
    }
}

export default new AuthService();
