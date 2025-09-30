"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination";
const COST_URL = "https://rajaongkir.komerce.id/api/v1/cost";
const API_KEY = process.env.RAJAONGKIR_API_KEY_COST;
const HEADERS = { key: API_KEY };
class RajaOngkirService {
    static async getProvinces() {
        const response = await axios_1.default.get(`${BASE_URL}/province`, { headers: HEADERS });
        return response.data.data.map((item) => ({
            province_id: String(item.id),
            province: item.name,
        }));
    }
    static async getCities(provinceId) {
        const response = await axios_1.default.get(`${BASE_URL}/city/${provinceId}`, { headers: HEADERS });
        return response.data.data.map((item) => ({
            city_id: String(item.id),
            city_name: item.name,
            type: item.type,
            postal_code: item.postal_code,
        }));
    }
    static async getDistricts(cityId) {
        const response = await axios_1.default.get(`${BASE_URL}/district/${cityId}`, { headers: HEADERS });
        return response.data.data.map((item) => ({
            district_id: String(item.id),
            district_name: item.name,
            city_id: String(item.city_id),
            zip_code: String(item.zip_code),
        }));
    }
    static async getSubdistricts(districtId) {
        const response = await axios_1.default.get(`${BASE_URL}/sub-district/${districtId}`, { headers: HEADERS });
        return response.data.data.map((item) => ({
            subdistrict_id: String(item.id),
            subdistrict_name: item.name,
            city_id: String(item.city_id),
            zip_code: String(item.zip_code),
        }));
    }
    static async getShippingCost(destination, weight, courier) {
        const origin = process.env.ORIGIN_SUBDISTRICT_ID;
        const response = await axios_1.default.post(COST_URL, { origin, destination, weight, courier }, {
            headers: {
                key: API_KEY,
                "Content-Type": "application/json",
            },
        });
        return response.data.data;
    }
}
exports.default = RajaOngkirService;
//# sourceMappingURL=RajaOngkirService.js.map