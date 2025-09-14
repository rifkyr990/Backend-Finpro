import prisma from "../config/prisma";

class UserAddressService {
    public static async getAddress(userId: string) {
        return prisma.userAddress.findMany({
            where: { user_id: userId },
            orderBy: { is_primary: "desc" },
        });
    }

    public static async createAddress(userId: string, data: any) {
        if (data.is_primary) {
            await prisma.userAddress.updateMany({
                where: { user_id: userId, is_primary: true },
                data: { is_primary: false },
            });
        }

        return prisma.userAddress.create({
            data: {
                ...data,
                user_id: userId,
                is_primary: Boolean(data.is_primary),
            },
        });
    }

    public static async updateAddress(userId: string, id: number, data: any) {
        if (data.is_primary) {
            await prisma.userAddress.updateMany({
                where: { user_id: userId, is_primary: true },
                data: { is_primary: false },
            });
        }

        return prisma.userAddress.update({
            where: { id },
            data: { ...data, is_primary: Boolean(data.is_primary) },
        });
    }

    public static async setPrimaryAddress(userId: string, addressId: number) {
        const address = await prisma.userAddress.findUnique({
            where: { id: addressId },
        });

        if (!address || address.user_id !== userId) {
            throw new Error("Alamat tidak ditemukan");
        }

        await prisma.userAddress.updateMany({
            where: { user_id: userId },
            data: { is_primary: false },
        });

        const updated = await prisma.userAddress.update({
            where: { id: addressId },
            data: { is_primary: true },
        });

        return updated;
    }

    public static async deleteAddress(userId: string,id: number) {
        return prisma.userAddress.delete({ where: { id }});
    }
}

export default UserAddressService;