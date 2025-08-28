import prisma from "../config/prisma";
import cloudinary from "../config/cloudinary";

export default class UserService {
    public async getUsers() {
        return prisma.user.findMany();
    }

    public async createUser(email: string, firstName: string, lastName: string) {
        return prisma.user.create({
            data: {
                email,
                first_name: firstName,
                last_name: lastName,
            },
        });
    }

    public async updateProfilePicture(userId: number, fileBuffer: Buffer) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User tidak ditemukan");

        if (user.imageUrlPublicId) {
            await cloudinary.uploader.destroy(user.imageUrlPublicId);
        }

        const fileBase64 = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(fileBase64, {
            folder: "profile_picture",
            resource_type: "image"
        });

        return prisma.user.update({
            where: { id: userId },
            data: { 
                image_url: uploadResult.secure_url,
                imageUrlPublicId: uploadResult.public_id,
            },
        })
    }
}