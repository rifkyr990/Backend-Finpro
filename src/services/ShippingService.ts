import axios from "axios";
import prisma from "../config/prisma";

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
            const params = new URLSearchParams();
            params.append("origin", originCityId);
            params.append("destination", destinationCityId);
            params.append("weight", "1000");
            params.append("courier", courier);
            const response = await axios.post(RAJAONGKIR_BASE_URL, params, {
                headers: {
                    key: RAJAONGKIR_API_KEY,"Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const data = response.data.data;
            allOptions.push(
                ...data.map((option: any) => ({ courier: option.name, code: option.code, service: option.service, description: option.description, cost: String(option.cost), estimated: option.etd }))
            );
        }

        return allOptions;
    }
}

export default ShippingService;
