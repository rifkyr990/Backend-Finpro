"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../config/prisma"));
const GeoUtils_1 = require("../utils/GeoUtils");
const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY_COST;
const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost";
const COURIERS = ["jne", "tiki"];
class ShippingService {
    static async getCityIdFromAddress(addressId) {
        const address = await prisma_1.default.userAddress.findUnique({
            where: { id: addressId },
            select: { city_id: true },
        });
        return address?.city_id || null;
    }
    static async getCityIdFromStore(storeId) {
        const store = await prisma_1.default.store.findUnique({
            where: { id: storeId },
            select: { city_id: true },
        });
        return store?.city_id || null;
    }
    static async getShippingOptions(originCityId, destinationCityId) {
        const allOptions = [];
        for (const courier of COURIERS) {
            const options = await this.fetchCourierOption(courier, originCityId, destinationCityId);
            allOptions.push(...options);
        }
        return allOptions;
    }
    static async fetchCourierOption(courier, origin, destination) {
        const params = new URLSearchParams({ origin, destination, weight: "1000", courier, });
        const response = await axios_1.default.post(RAJAONGKIR_BASE_URL, params, {
            headers: { key: RAJAONGKIR_API_KEY, "Content-Type": "application/x-www-form-urlencoded", },
        });
        const data = response.data.data;
        return data.map((option) => ({ courier: option.name, code: option.code, service: option.service, description: option.description, cost: String(option.cost), estimated: option.etd, }));
    }
    static async validateDistance(addressId, storeId) {
        const [store, address] = await Promise.all([
            prisma_1.default.store.findUnique({ where: { id: storeId }, select: { latitude: true, longitude: true } }),
            prisma_1.default.userAddress.findUnique({ where: { id: addressId }, select: { latitude: true, longitude: true } })
        ]);
        if (!store || !address || store.latitude == null || store.longitude == null || address.latitude == null || address.longitude == null) {
            return { success: false, message: "Coordinates not found for store or address" };
        }
        const storeLat = store.latitude;
        const storeLon = store.longitude;
        const addrLat = address.latitude;
        const addrLon = address.longitude;
        const distance = (0, GeoUtils_1.getDistance)(storeLat, storeLon, addrLat, addrLon);
        if (distance > 30)
            return { success: false, message: `Shipping address is too far from store (${distance.toFixed(2)} km > 30 km)`, };
        return { success: true };
    }
}
exports.default = ShippingService;
//# sourceMappingURL=ShippingService.js.map