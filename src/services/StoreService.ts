import prisma from "../config/prisma";
import { hashPassword } from "../utils/bcrypt";

class StoreService {
    static async getAllStores() {
        return prisma.store.findMany({
            where: { is_deleted: false },
            include: { admins: { where: { is_deleted: false } } },
        });
    }

    static async getStoreAdminsWithoutStore() {
        return prisma.user.findMany({
            where: {
                store_id: null,
                role: "STORE_ADMIN",
                is_deleted: false,
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
                phone: true,
            },
        });
    }

    static async getStoreAdminsWithStore() {
        return prisma.store.findMany({
        select: {
            name: true,
            id: true,
            admins: {
            where: { is_deleted: false },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
                phone: true,
            },
            },
        },
        });
    }

    static async checkUserExists(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    static async createStoreAdmin(data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        store_id?: number | null;
        phone: string;
    }) {
        const hashedPassword = await hashPassword(data.password);
        return prisma.user.create({
        data: {
            first_name: data.first_name,
            last_name: data.last_name,
            password: hashedPassword,
            email: data.email,
            store_id: data.store_id ?? null,
            phone: data.phone,
            is_verified: true,
            role: "STORE_ADMIN",
            image_url: "https://iili.io/KRwBd91.png",
        },
        });
    }

    static async softDeleteStore(storeId: number) {
        return prisma.$transaction(async (tx) => {
            await tx.user.updateMany({
                where: { store_id: storeId, role: "STORE_ADMIN" },
                data: { store_id: null },
            });
            return tx.store.update({
                where: { id: storeId },
                data: { is_deleted: true },
            });
        });
    }

    static async createStore(payload: any) {
        const { name, address, city, city_id, province, province_id, latitude, longitude, is_active, adminIds } = payload;

        const newStore = await prisma.store.create({
            data: { name, address, city, city_id, province, province_id, latitude, longitude, is_active },
        });

        if (adminIds?.length) {
            await prisma.user.updateMany({
                where: { id: { in: adminIds } },
                data: { role: "STORE_ADMIN", store_id: newStore.id },
            });
        }

        return prisma.store.findUnique({
            where: { id: newStore.id },
            include: { admins: { select: { id: true, first_name: true, last_name: true, role: true } } },
        });
    }

    static async updateStore(storeId: number, payload: any) {
        const { name, address, city, city_id, province, province_id, latitude, longitude, is_active } = payload;

        return prisma.store.update({
            where: { id: storeId },
            data: {
                name,
                address,
                city: city.trim().toUpperCase(),
                city_id,
                province: province.trim().toUpperCase(),
                province_id,
                latitude,
                longitude,
                is_active,
            },
        });
    }

    static async relocateStoreAdmin(adminId: string, store_id: number | null) {
        return prisma.user.update({
            where: { id: adminId },
            data: { store_id },
        });
    }
}

export default StoreService;
