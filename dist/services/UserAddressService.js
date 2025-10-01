"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
class UserAddressService {
    static validateAddressData(data) {
        const requiredFields = [
            'name', 'phone', 'label', 'province', 'province_id',
            'city', 'city_id', 'district', 'district_id',
            'subdistrict', 'subdistrict_id', 'postal_code', 'street',
        ];
        const missingFields = requiredFields.filter((field) => !data[field] && data[field] !== 0);
        if (missingFields.length > 0) {
            throw new Error(`Field berikut wajib diisi: ${missingFields.join(', ')}`);
        }
    }
    // tampil alamat
    static async getAddress(userId) {
        return prisma_1.default.userAddress.findMany({
            where: { user_id: userId },
            orderBy: { is_primary: "desc" },
        });
    }
    // buat alamat
    static async createAddress(userId, data) {
        this.validateAddressData(data);
        if (data.is_primary) {
            await prisma_1.default.userAddress.updateMany({
                where: { user_id: userId, is_primary: true },
                data: { is_primary: false },
            });
        }
        const province_id = data.province_id !== undefined && data.province_id !== null ? String(data.province_id) : null;
        const city_id = data.city_id !== undefined && data.city_id !== null ? String(data.city_id) : null;
        const district_id = data.district_id !== undefined && data.district_id !== null ? String(data.district_id) : null;
        const subdistrict_id = data.subdistrict_id !== undefined && data.subdistrict_id !== null ? String(data.subdistrict_id) : null;
        return prisma_1.default.userAddress.create({
            data: { user_id: userId, name: data.name, phone: data.phone, label: data.label, province: data.province, province_id, city: data.city, city_id, district: data.district, district_id, subdistrict: data.subdistrict, subdistrict_id, postal_code: data.postal_code, street: data.street, detail: data.detail ?? null, latitude: data.latitude ?? null, longitude: data.longitude ?? null, is_primary: Boolean(data.is_primary), },
        });
    }
    static async updateAddress(userId, id, data) {
        if (data.is_primary) {
            await prisma_1.default.userAddress.updateMany({
                where: { user_id: userId, is_primary: true },
                data: { is_primary: false },
            });
        }
        const updateData = {
            ...data,
            province_id: data.province_id !== undefined && data.province_id !== null ? String(data.province_id) : null,
            city_id: data.city_id !== undefined && data.city_id !== null ? String(data.city_id) : null,
            district_id: data.district_id !== undefined && data.district_id !== null ? String(data.district_id) : null,
            subdistrict_id: data.subdistrict_id !== undefined && data.subdistrict_id !== null ? String(data.subdistrict_id) : null,
            is_primary: Boolean(data.is_primary),
        };
        return prisma_1.default.userAddress.update({
            where: { id },
            data: updateData,
        });
    }
    static async setPrimaryAddress(userId, addressId) {
        const address = await prisma_1.default.userAddress.findUnique({
            where: { id: addressId },
        });
        if (!address || address.user_id !== userId) {
            throw new Error("Alamat tidak ditemukan");
        }
        await prisma_1.default.userAddress.updateMany({
            where: { user_id: userId },
            data: { is_primary: false },
        });
        const updated = await prisma_1.default.userAddress.update({
            where: { id: addressId },
            data: { is_primary: true },
        });
        return updated;
    }
    static async deleteAddress(userId, id) {
        return prisma_1.default.userAddress.delete({ where: { id } });
    }
}
exports.default = UserAddressService;
//# sourceMappingURL=UserAddressService.js.map