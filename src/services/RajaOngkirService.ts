import axios from "axios";

const BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination";
const COST_URL = "https://rajaongkir.komerce.id/api/v1/cost";
const API_KEY = process.env.RAJAONGKIR_API_KEY_COST!;
const HEADERS = { key: API_KEY };

class RajaOngkirService {
    static async getProvinces() {
        const response = await axios.get(`${BASE_URL}/province`, { headers: HEADERS });
        return response.data.data.map((item: any) => ({
            province_id: String(item.id),
            province: item.name,
        }));
    }

    static async getCities(provinceId: string) {
        const response = await axios.get(`${BASE_URL}/city/${provinceId}`, { headers: HEADERS });
        return response.data.data.map((item: any) => ({
            city_id: String(item.id),
            city_name: item.name,
            type: item.type,
            postal_code: item.postal_code,
        }));
    }

    static async getDistricts(cityId: string) {
        const response = await axios.get(`${BASE_URL}/district/${cityId}`, { headers: HEADERS });
        return response.data.data.map((item: any) => ({
            district_id: String(item.id),
            district_name: item.name,
            city_id: String(item.city_id),
            zip_code: String(item.zip_code),
        }));
    }

    static async getSubdistricts(districtId: string) {
        const response = await axios.get(`${BASE_URL}/sub-district/${districtId}`, { headers: HEADERS });
        return response.data.data.map((item: any) => ({
            subdistrict_id: String(item.id),
            subdistrict_name: item.name,
            city_id: String(item.city_id),
            zip_code: String(item.zip_code),
        }));
    }

    static async getShippingCost(destination: string, weight: number, courier: string) {
        const origin = process.env.ORIGIN_SUBDISTRICT_ID!;
        const response = await axios.post(
            COST_URL,
            { origin, destination, weight, courier },
            {
                headers: {
                key: API_KEY,
                "Content-Type": "application/json",
                },
            }
        );
        return response.data.data;
    }
}

export default RajaOngkirService;
