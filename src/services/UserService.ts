import prisma from "../config/prisma";
import cloudinary from "../config/cloudinary";
import bcrypt from "bcrypt";
import { validatePassword } from "../utils/validatePassword";

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

        const updateData: any = {
            first_name,
            last_name,
            phone,
            profile: {
                upsert: {
                    create: { bio, date_of_birth },
                    update: { bio, date_of_birth },
                },
            },
        };

        if (email && email !== existingUser?.email) {
            updateData.email = email;
            updateData.is_verified = false;
        }

        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: { profile: true },
        });

        return updateUser;
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user?.password) throw new Error("Password tidak ditemukan");

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error("Password lama salah");

        const error = validatePassword(newPassword);
        if (error) throw new Error(error);
        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        return true;
    }

    public async verifyNewEmail(token: string) {
        try {
            const tokenRecord = await prisma.verificationToken.findFirst({
                where: { token },
                include: { user: true },
            });
            if (
                !tokenRecord ||
                tokenRecord.used ||
                tokenRecord.expires_at < new Date()
            ) {
                throw new Error("Token tidak valid atau sudah kadaluarsa");
            }

            if (!tokenRecord.user) {
                throw new Error("User tidak ditemukan");
            }

            const updatedUser = await prisma.user.update({
                where: { id: tokenRecord.user_id },
                data: { is_verified: true },
            });

            await prisma.verificationToken.update({
                where: { id: tokenRecord.id },
                data: { used: true },
            });

            return updatedUser;
        } catch (err) {
            throw new Error("Token tidak valid atau sudah kadaluarsa");
        }
    }


}

export default new UserService();