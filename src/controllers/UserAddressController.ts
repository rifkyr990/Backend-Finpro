import { Request, Response } from "express";
import UserAddressService from "../services/UserAddressService";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

class UserAddressController {
    public static getAddress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const address = await UserAddressService.getAddress(userId);

        return ApiResponse.success(res, address, "Daftar Alamat berhasil diambil");
    });

    public static createAddress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const address = await UserAddressService.createAddress(userId, req.body);

        return ApiResponse.success(res, address, "Alamat berhasil ditambahkan");
    });

    public static updateAddress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { id } = req.params;
        const address = await UserAddressService.updateAddress(
            userId, Number(id), req.body
        );

        return ApiResponse.success(res, address, "Alamat berhasil diperbarui");
    });

    public static setPrimaryAddress = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const addressId = Number(req.params.id);

        const updated = await UserAddressService.setPrimaryAddress(userId, addressId);

        return ApiResponse.success(res, updated, "Berhasil diatur menjadi alamat utama");
    })

    public static deleteAddress = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { id } = req.params;

        await UserAddressService.deleteAddress(userId, Number(id));
        return ApiResponse.success(res, null, "Alamat berhasil dihapus");
    })
}

export default UserAddressController;