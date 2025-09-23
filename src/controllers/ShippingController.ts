import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import axios from "axios";
import prisma from "../config/prisma";

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY_COST!;
const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost";
const COURIERS = ["jne", "tiki"];

class ShippingController {
  public static getShippingOptions = asyncHandler(async (req: Request, res: Response) => {
    const { addressId, storeId } = req.body;
    console.log("Received body:", req.body);
    console.log("Parsed addressId:", addressId, "Parsed storeId:", storeId);

    if (!addressId || !storeId) {
      return ApiResponse.error(res, "addressId and storeId are required", 400);
    }

    // Ambil city_id tujuan dari alamat user
    const destinationCityId = await getCityIdFromAddress(Number(addressId));
    console.log("dest", destinationCityId);
    if (!destinationCityId) {
      return ApiResponse.error(res, "City ID not found for given addressId", 404);
    }

    // Ambil city_id asal dari store yang dipilih
    const originCityId = await getCityIdFromStore(Number(storeId));
    console.log("origin", originCityId);
    if (!originCityId) {
      return ApiResponse.error(res, "City ID not found for given storeId", 404);
    }

    try {
      const allOptions: any[] = [];

      for (const courier of COURIERS) {
        const params = new URLSearchParams();
        params.append("origin", originCityId);
        params.append("destination", destinationCityId);
        params.append("weight", "1000"); // Default 1000 gram (1kg), bisa dinamis nanti
        params.append("courier", courier);

        const response = await axios.post(RAJAONGKIR_BASE_URL, params, {
          headers: {
            key: RAJAONGKIR_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const data = response.data.data;

        allOptions.push(
          ...data.map((option: any) => ({
            courier: option.name,
            code: option.code,
            service: option.service,
            description: option.description,
            cost: option.cost,
            estimated: option.etd,
          }))
        );
      }

      return ApiResponse.success(res, allOptions, "Shipping options fetched successfully");
    } catch (error: any) {
      console.error("RajaOngkir API error:", error?.response?.data || error.message);
      return ApiResponse.error(res, "Failed to fetch shipping options", 500);
    }
  });
}

// Fungsi untuk mengambil city_id dari alamat user
async function getCityIdFromAddress(addressId: number): Promise<string | null> {
  const address = await prisma.userAddress.findUnique({
    where: { id: addressId },
    select: { city_id: true },
  });

  return address?.city_id || null;
}

// Fungsi untuk mengambil city_id dari store
async function getCityIdFromStore(storeId: number): Promise<string | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { city_id: true },
  });

  return store?.city_id || null;
}

export default ShippingController;