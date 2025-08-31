import prisma from "../config/prisma";
import cloudinary from "../config/cloudinary";

class UserService {
    private defaultProfileUrl = "https://res.cloudinary.com/your_cloud/image/upload/v123456789/default-profile.png";

    public async uploadProfilePicture(userId: string, fileBuffer: Buffer) {
        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
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
            data: { image_url: result.secure_url },
        })
    }

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

    public async deleteProfilePicture(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }});
        if (!user) throw new Error("User not found");

        if (user.image_id) {
            await cloudinary.uploader.destroy(user.image_id);
        }

        return prisma.user.update({
            where: { id: userId },
            data: { image_url: this.defaultProfileUrl, image_id: null }
        })
    }
}

export default new UserService();