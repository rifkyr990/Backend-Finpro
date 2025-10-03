import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import ShippingService from "../services/ShippingService";

class ShippingController {
  public static getShippingOptions = asyncHandler(async (req: Request, res: Response) => {
    const { addressId, storeId } = req.body;

    if (!addressId || !storeId) {
      return ApiResponse.error(res, "addressId and storeId are required", 400);
    }

    const validation = await ShippingService.validateDistance(addressId, storeId);
    if (!validation.success) {
      return ApiResponse.error(res, validation.message, 400);
    }

    const originCityId = await ShippingService.getCityIdFromStore(storeId);
    const destinationCityId = await ShippingService.getCityIdFromAddress(addressId);

    if (!originCityId || !destinationCityId) {
      return ApiResponse.error(res, "City ID not found", 404);
    }

    try {
      const options = await ShippingService.getShippingOptions(originCityId, destinationCityId);
      return ApiResponse.success(res, options, "Shipping options fetched successfully");
    } catch {
      return ApiResponse.error(res, "Failed to fetch shipping options", 500);
    }
  });
}

export default ShippingController;