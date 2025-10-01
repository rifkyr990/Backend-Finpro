"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const UserAddressService_1 = __importDefault(require("../services/UserAddressService"));
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
class UserAddressController {
}
_a = UserAddressController;
UserAddressController.getAddress = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const address = await UserAddressService_1.default.getAddress(userId);
    return ApiResponse_1.ApiResponse.success(res, address, "Daftar Alamat berhasil diambil");
});
UserAddressController.createAddress = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const address = await UserAddressService_1.default.createAddress(userId, req.body);
    return ApiResponse_1.ApiResponse.success(res, address, "Alamat berhasil ditambahkan");
});
UserAddressController.updateAddress = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const address = await UserAddressService_1.default.updateAddress(userId, Number(id), req.body);
    return ApiResponse_1.ApiResponse.success(res, address, "Alamat berhasil diperbarui");
});
UserAddressController.setPrimaryAddress = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const addressId = Number(req.params.id);
    const updated = await UserAddressService_1.default.setPrimaryAddress(userId, addressId);
    return ApiResponse_1.ApiResponse.success(res, updated, "Berhasil diatur menjadi alamat utama");
});
UserAddressController.deleteAddress = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await UserAddressService_1.default.deleteAddress(userId, Number(id));
    return ApiResponse_1.ApiResponse.success(res, null, "Alamat berhasil dihapus");
});
exports.default = UserAddressController;
//# sourceMappingURL=UserAddressController.js.map