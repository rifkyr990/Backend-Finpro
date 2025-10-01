"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validatePassword_1 = require("../utils/validatePassword");
class UserService {
    async updateProfilePicture(userId, fileBuffer) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!userId)
            throw new Error("User not found");
        if (user?.image_id) {
            await cloudinary_1.default.uploader.destroy(user.image_id);
        }
        const result = await new Promise((resolve, reject) => {
            cloudinary_1.default.uploader.upload_stream({
                folder: "profile_picture", resource_type: "image",
            }, (error, uploaded) => { if (error)
                reject(error);
            else
                resolve(uploaded); }).end(fileBuffer);
        });
        return prisma_1.default.user.update({
            where: { id: userId },
            data: { image_url: result.secure_url, image_id: result.public_id, }
        });
    }
    async getProfile(userId) {
        return prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
    }
    buildProfileUpdateData(data, existingEmail) {
        const { first_name, last_name, bio, phone, date_of_birth, email } = data;
        const updateData = {
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
        if (email && email !== existingEmail) {
            updateData.email = email;
            updateData.is_verified = false;
        }
        return updateData;
    }
    async updateProfile(userId, data) {
        if (!data)
            throw new Error("Request body kosong, pastikan mengirim data profile");
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        const updateData = this.buildProfileUpdateData(data, existingUser?.email);
        return prisma_1.default.user.update({
            where: { id: userId },
            data: updateData,
            include: { profile: true },
        });
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user?.password)
            throw new Error("Password tidak ditemukan");
        const isMatch = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch)
            throw new Error("Password lama salah");
        const error = (0, validatePassword_1.validatePassword)(newPassword);
        if (error)
            throw new Error(error);
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        return true;
    }
    async verifyNewEmail(token) {
        const tokenRecord = await prisma_1.default.verificationToken.findFirst({
            where: { token },
            include: { user: true },
        });
        const isInvalid = !tokenRecord || tokenRecord.used || tokenRecord.expires_at < new Date();
        if (isInvalid)
            throw new Error("Token tidak valid atau sudah kadaluarsa");
        if (!tokenRecord.user)
            throw new Error("User tidak ditemukan");
        const updatedUser = await prisma_1.default.user.update({
            where: { id: tokenRecord.user.id },
            data: { is_verified: true },
        });
        await this.markTokenAsUsed(tokenRecord.id);
        return updatedUser;
    }
    async markTokenAsUsed(tokenId) {
        await prisma_1.default.verificationToken.update({
            where: { id: tokenId },
            data: { used: true },
        });
    }
}
exports.default = new UserService();
//# sourceMappingURL=UserService.js.map