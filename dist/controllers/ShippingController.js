"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const ShippingService_1 = __importDefault(require("../services/ShippingService"));
class ShippingController {
}
_a = ShippingController;
ShippingController.getShippingOptions = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { addressId, storeId } = req.body;
    if (!addressId || !storeId) {
        return ApiResponse_1.ApiResponse.error(res, "addressId and storeId are required", 400);
    }
    const validation = await ShippingService_1.default.validateDistance(addressId, storeId);
    if (!validation.success) {
        return ApiResponse_1.ApiResponse.error(res, validation.message, 400);
    }
    const originCityId = await ShippingService_1.default.getCityIdFromStore(storeId);
    const destinationCityId = await ShippingService_1.default.getCityIdFromAddress(addressId);
    if (!originCityId || !destinationCityId) {
        return ApiResponse_1.ApiResponse.error(res, "City ID not found", 404);
    }
    try {
        const options = await ShippingService_1.default.getShippingOptions(originCityId, destinationCityId);
        return ApiResponse_1.ApiResponse.success(res, options, "Shipping options fetched successfully");
    }
    catch {
        return ApiResponse_1.ApiResponse.error(res, "Failed to fetch shipping options", 500);
    }
});
exports.default = ShippingController;
//# sourceMappingURL=ShippingController.js.map