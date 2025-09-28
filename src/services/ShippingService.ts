import axios from "axios";
import prisma from "../config/prisma";
import { getDistance } from "../utils/GeoUtils";

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY_COST!;
const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost";
const COURIERS = ["jne", "tiki"];

class ShippingService {
    static async getCityIdFromAddress(addressId: number): Promise<string | null> {
        const address = await prisma.userAddress.findUnique({
            where: { id: addressId },
            select: { city_id: true },
        });

        return address?.city_id || null;
    }

    static async getCityIdFromStore(storeId: number): Promise<string | null> {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { city_id: true },
        });

        return store?.city_id || null;
    }

    static async getShippingOptions(originCityId: string, destinationCityId: string): Promise<any[]> {
        const allOptions: any[] = [];

        for (const courier of COURIERS) {
            const options = await this.fetchCourierOption(courier, originCityId, destinationCityId);
            allOptions.push(...options);
        }

        return allOptions;
    }

    private static async fetchCourierOption(courier: string, origin: string, destination: string) {
        const params = new URLSearchParams({ origin, destination, weight: "1000", courier,});

        const response = await axios.post(RAJAONGKIR_BASE_URL, params, {
            headers: { key: RAJAONGKIR_API_KEY, "Content-Type": "application/x-www-form-urlencoded",},
        });

        const data = response.data.data;

        return data.map((option: any) => ({ courier: option.name, code: option.code, service: option.service, description: option.description, cost: String(option.cost), estimated: option.etd,}));
    }

    static async validateDistance(addressId: number, storeId: number): Promise<{ success: boolean; message?: string }> {
        const [store, address] = await Promise.all([
            prisma.store.findUnique({ where: { id: storeId }, select: { latitude: true, longitude: true } }),
            prisma.userAddress.findUnique({ where: { id: addressId }, select: { latitude: true, longitude: true }})
        ]);

        if (!store || !address || store.latitude == null || store.longitude == null || address.latitude == null || address.longitude == null) {
            return { success: false, message: "Coordinates not found for store or address" };
        }

        const storeLat = store.latitude;
        const storeLon = store.longitude;
        const addrLat = address.latitude;
        const addrLon = address.longitude;
        const distance = getDistance(storeLat, storeLon, addrLat, addrLon);
        
        if (distance > 30) return { success: false, message: `Shipping address is too far from store (${distance.toFixed(2)} km > 30 km)`,};

        return { success: true };
    }
}

export default ShippingService;