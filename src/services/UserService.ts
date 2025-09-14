import prisma from "../config/prisma";
import cloudinary from "../config/cloudinary";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/validatePassword";
import { sendEmail } from "../utils/email";
import crypto from "crypto";
import { verificationEmailTemplate } from "../templates/VerificationEmail";

class UserService {
    private defaultProfileUrl = "https://res.cloudinary.com/your_cloud/image/upload/v123456789/default-profile.png";

    public async updateProfilePicture(userId: string, fileBuffer: Buffer) {
        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!userId) throw new Error("User not found");

        if (user?.image_id) {
            await cloudinary.uploader.destroy(user.image_id);
        }

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "profile_picture",
                    resource_type: "image",
                },
                (error, uploaded) => {
                    if (error) reject(error);
                    else resolve(uploaded);
                }
            ).end(fileBuffer);
        });

        return prisma.user.update({
            where: { id: userId },
            data: {
                image_url: result.secure_url,
                image_id: result.public_id,
            }
        });
    }

    public async getProfile(userId: string) {
        return prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true },
            });
    }

    public async updateProfile(userId: string, data: any) {
        if (!data) {
            throw new Error("Request body kosong, pastikan mengirim data profile");
        }

        const { first_name, last_name, bio, phone, date_of_birth, email } = data;

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!existingUser) {
            throw new Error("User tidak ditemukan");
        }

        const updateData: any = {
            first_name,
            last_name,
            phone,
            profile: {
                upsert: {
                    create: { bio, date_of_birth: date_of_birth ? new Date(date_of_birth) : null },
                    update: { bio, date_of_birth: date_of_birth ? new Date(date_of_birth) : null },
                },
            },
        };

        let emailChanged = false;
        if (email && email !== existingUser.email) {
            updateData.email = email;
            updateData.is_verified = false;
            emailChanged = true;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { profile: true },
        });

        if (emailChanged) {
            const token = jwt.sign(
            { userId: updatedUser.id, email: updatedUser.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

            const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-new-email?token=${token}`;

            await sendEmail({
                to: updatedUser.email,
                subject: "Verifikasi Email Baru",
                text: `Klik link berikut untuk verifikasi email Anda: ${verifyUrl}`,
                html: verificationEmailTemplate(verifyUrl),
            });
        }
        return updatedUser;
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user?.password) throw new Error("Password tidak ditemukan");

        // Cek password lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error("Password lama salah");

        // ✅ Validasi password baru
        const error = validatePassword(newPassword);
        if (error) throw new Error(error);

        // Hash password baru
        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
        });

        return true;
    }

    public async verifyNewEmail(token: string) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
                email: string;
            };

            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
            });

            if (!user) throw new Error("User tidak ditemukan");
            if (user.email !== payload.email) {
                throw new Error("Email pada token tidak sesuai dengan data user");
            }
            const updatedUser = await prisma.user.update({
                where: { id: payload.userId },
                data: { is_verified: true },
            });

            return updatedUser;
        } catch (err) {
            throw new Error("Token tidak valid atau sudah kadaluarsa");
        }
    }


}

export default new UserService();