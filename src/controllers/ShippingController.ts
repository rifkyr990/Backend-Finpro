import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import ShippingService  from "../services/ShippingService";

class ShippingController {
  public static getShippingOptions = asyncHandler(ShippingController.handleShipping);

  private static async handleShipping(req: Request, res: Response) {
    const { addressId, storeId } = req.body;

    if (!addressId || !storeId) return ApiResponse.error(res, "addressId and storeId are required", 400);

    const destinationCityId = await ShippingService.getCityIdFromAddress(Number(addressId));
    const originCityId = await ShippingService.getCityIdFromStore(Number(storeId));

    if (!destinationCityId || !originCityId) {
      return ApiResponse.error(res, "City ID not found", 404);
    }

    try {
      const options = await ShippingService.getShippingOptions(originCityId, destinationCityId);
      return ApiResponse.success(res, options, "Shipping options fetched successfully");
    } catch (error: any) {
      return ApiResponse.error(res, "Failed to fetch shipping options", 500);
    }
  }
}

export default ShippingController;