import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import axios from "axios";
import prisma from "../config/prisma";

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY_COST!;
const RAJAONGKIR_BASE_URL =
  "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost";
const COURIERS = ["jne", "tiki"];

class ShippingController {
  // public static getShippingOptions = asyncHandler(async (req: Request, res: Response) => {
  //   const { addressId } = req.body;

  //   if (!addressId) {
  //     return ApiResponse.error(res, "addressId is required", 400);
  //   }
  //   const destinationCityId = await getCityIdFromAddress(Number(addressId));
  //   console.log("ini destinasi", destinationCityId);

  //   if (!destinationCityId) {
  //     return ApiResponse.error(res, "City ID not found for given addressId", 404);
  //   }

  //   try {
  //     const allOptions: any[] = [];

  //     for (const courier of COURIERS) {
  //       const params = new URLSearchParams();
  //       params.append("origin", ORIGIN_CITY_ID);
  //       params.append("destination", destinationCityId);
  //       params.append("weight", "1000");
  //       params.append("courier", courier);

  //       const response = await axios.post(RAJAONGKIR_BASE_URL, params, {
  //         headers: {
  //           key: RAJAONGKIR_API_KEY,
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //       });

  //       const data = response.data.data;

  //       allOptions.push(
  //         ...data.map((option: any) => ({
  //           courier: option.name,
  //           code: option.code,
  //           service: option.service,
  //           description: option.description,
  //           cost: option.cost,
  //           estimated: option.etd,
  //         }))
  //       );
  //     }
  //     console.log("ini berhasil", allOptions);
  //     return ApiResponse.success(res, allOptions, "Shipping options fetched successfully");
  //   } catch (error: any) {
  //     console.error("RajaOngkir API error:", error?.response?.data || error.message);
  //     return ApiResponse.error(res, "Failed to fetch shipping options", 500);
  //   }
  // });
  public static getShippingOptions = asyncHandler(
    async (req: Request, res: Response) => {
      const { addressId } = req.body;

      if (!addressId) {
        return ApiResponse.error(res, "addressId is required", 400);
      }

      const originCityId = await getOriginCityIdFromMainStore();
      if (!originCityId) {
        return ApiResponse.error(
          res,
          "Origin city not found from main store",
          500
        );
      }

      const destinationCityId = await getCityIdFromAddress(Number(addressId));
      console.log("ini destinasi", destinationCityId);

      if (!destinationCityId) {
        return ApiResponse.error(
          res,
          "City ID not found for given addressId",
          404
        );
      }

      try {
        const allOptions: any[] = [];

        for (const courier of COURIERS) {
          const params = new URLSearchParams();
          params.append("origin", originCityId); // GANTI DARI HARDCODE
          params.append("destination", destinationCityId);
          params.append("weight", "1000");
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

        console.log("ini berhasil", allOptions);
        return ApiResponse.success(
          res,
          allOptions,
          "Shipping options fetched successfully"
        );
      } catch (error: any) {
        console.error(
          "RajaOngkir API error:",
          error?.response?.data || error.message
        );
        return ApiResponse.error(res, "Failed to fetch shipping options", 500);
      }
    }
  );
}

async function getCityIdFromAddress(addressId: number): Promise<string | null> {
  const address = await prisma.userAddress.findUnique({
    where: { id: addressId },
    select: { city_id: true },
  });

  return address?.city_id || null;
}
async function getOriginCityIdFromMainStore(): Promise<string | null> {
  const store = await prisma.store.findFirst({
    where: { is_main_store: true, is_active: true },
    select: { city_id: true },
  });

  return store?.city_id || null;
}

export default ShippingController;
