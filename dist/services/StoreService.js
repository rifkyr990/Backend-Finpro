"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = require("../utils/bcrypt");
class StoreService {
    static async getAllStores() {
        return prisma_1.default.store.findMany({
            where: { is_deleted: false },
            include: { admins: { where: { is_deleted: false } } },
        });
    }
    static async getStoreAdminsWithoutStore() {
        return prisma_1.default.user.findMany({
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
        return prisma_1.default.store.findMany({
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
    static async checkUserExists(email) {
        return prisma_1.default.user.findUnique({ where: { email } });
    }
    static async createStoreAdmin(data) {
        const hashedPassword = await (0, bcrypt_1.hashPassword)(data.password);
        return prisma_1.default.user.create({
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
    static async softDeleteStore(storeId) {
        return prisma_1.default.$transaction(async (tx) => {
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
    static async createStore(payload) {
        const { name, address, city, city_id, province, province_id, latitude, longitude, is_active, adminIds } = payload;
        const newStore = await prisma_1.default.store.create({
            data: { name, address, city, city_id, province, province_id, latitude, longitude, is_active },
        });
        if (adminIds?.length) {
            await prisma_1.default.user.updateMany({
                where: { id: { in: adminIds } },
                data: { role: "STORE_ADMIN", store_id: newStore.id },
            });
        }
        return prisma_1.default.store.findUnique({
            where: { id: newStore.id },
            include: { admins: { select: { id: true, first_name: true, last_name: true, role: true } } },
        });
    }
    static async updateStore(storeId, payload) {
        const { name, address, city, city_id, province, province_id, latitude, longitude, is_active } = payload;
        return prisma_1.default.store.update({
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
    static async relocateStoreAdmin(adminId, store_id) {
        return prisma_1.default.user.update({
            where: { id: adminId },
            data: { store_id },
        });
    }
}
exports.default = StoreService;
//# sourceMappingURL=StoreService.js.map