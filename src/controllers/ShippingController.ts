import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

const mockShippingOptions = [
  {
    id: 1,
    courier: "JNE",
    service: "Reguler",
    cost: 18000,
    estimated: "2-3 days",
  },
  {
    id: 2,
    courier: "SiCepat",
    service: "Express",
    cost: 32000,
    estimated: "1-2 days",
  },
  {
    id: 3,
    courier: "Ninja Xpress",
    service: "Same Day",
    cost: 45000,
    estimated: "Same day",
  },
];

class ShippingController {
  public static getShippingOptions = asyncHandler(
    async (req: Request, res: Response) => {
      const { addressId } = req.body;

      if (!addressId) {
        return ApiResponse.error(res, "addressId is required", 400);
      }

      console.log(`Fetching shipping options for addressId: ${addressId}`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      return ApiResponse.success(
        res,
        mockShippingOptions,
        "Shipping options fetched successfully"
      );
    }
  );
}

export default ShippingController;
