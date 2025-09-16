// src/controllers/UserController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import UserService from "../services/UserService";
import prisma from "../config/prisma";

class UserController {
  public static getAllUsers = async (req: Request, res: Response) => {
    try {
      const usersData = await prisma.user.findMany({
        include: {
          addresses: true,
          store: true,
        },
      });
      return ApiResponse.success(res, usersData, "Get All Users Data Success");
    } catch (error) {
      ApiResponse.error(res, "Error Get All Users Data", 400);
    }
  }; // arco
  public static getAllCustomers = async (req: Request, res: Response) => {
    try {
      const customersData = await prisma.user.findMany({
        where: { role: "CUSTOMER", store_id: null },
        include: {
          addresses: true,
        },
      });
      return ApiResponse.success(
        res,
        customersData,
        "Get All Customers Data Success"
      );
    } catch (error) {
      ApiResponse.error(res, "Error get customers data", 400);
    }
  };

  public static getAllStoreAdmin = async (req: Request, res: Response) => {
    try {
      const customersData = await prisma.user.findMany({
        where: { role: "STORE_ADMIN", store_id: null },
        include: {
          addresses: true,
        },
      });
      return ApiResponse.success(
        res,
        customersData,
        "Get All Store Admin Data Success"
      );
    } catch (error) {
      ApiResponse.error(res, "Error get customers data", 400);
    }
  };

  // public static assignMultipleAdmins = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const { store_id, adminIds } = req.body;

  //     if (!store_id || !Array.isArray(adminIds) || adminIds.length === 0) {
  //       return ApiResponse.error(res, "store_id dan adminIds wajib diisi", 400);
  //     }

  //     // pastikan store ada
  //     const store = await prisma.store.findUnique({
  //       where: { id: store_id },
  //     });
  //     if (!store) {
  //       return ApiResponse.error(res, "Store tidak ditemukan", 404);
  //     }

  //     // update semua user sesuai adminIds
  //     const updatedAdmins = await prisma.user.updateMany({
  //       where: { id: { in: adminIds } },
  //       data: {
  //         store_id: store_id,
  //         role: "STORE_ADMIN",
  //       },
  //     });

  //     return ApiResponse.success(
  //       res,
  //       updatedAdmins,
  //       `Berhasil assign ${updatedAdmins.count} admin ke store`
  //     );
  //   }
  // );
  
  public static deleteUserById = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const deletedUser = await prisma.user.delete({ where: { id: userId! } });
      return ApiResponse.success(res, `Delete user id ${userId} success`);
    } catch (error) {
      ApiResponse.error(res, "Error delete data", 400);
    }
  };

  //arco
  public static assignAdminbyId = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const store_id = req.body.store_id;

      // Validasi input
      if (!userId || isNaN(store_id)) {
        return ApiResponse.error(res, "Invalid userId or storeId", 400);
      }

      const assignAdmin = await prisma.user.update({
        where: { id: userId },
        data: {
          store_id: store_id,
          role: "STORE_ADMIN",
        },
      });

      ApiResponse.success(res, assignAdmin, "Assign Admin Success", 201);
    } catch (error) {
      ApiResponse.error(res, "Assign Admin Failed", 400);
    }
  }; // arco

  public static revertAdminbyId = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { store_id, role } = req.body;

      if (!id) return ApiResponse.error(res, "Invalid id");

      const revertAdmin = await prisma.user.update({
        where: { id },
        data: {
          store_id: null,
          role: "CUSTOMER",
        },
      });
      ApiResponse.success(res, req.body, "Revert Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Revert to Customer Error", 400);
    }
  };

  public static updateProfilePicture = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) return ApiResponse.error(res, "Unauthorized", 401);
      if (!req.file) return ApiResponse.error(res, "File tidak ditemukan", 400);

      const user = await UserService.updateProfilePicture(
        req.user.id,
        req.file.buffer
      );
      return ApiResponse.success(
        res,
        user,
        "Profile picture berhasil diupdate"
      );
    }
  );

  public static getProfile = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const profile = await UserService.getProfile(userId);

      return ApiResponse.success(res, profile, "Profile berhasil diambil");
    }
  );

  public static updateProfile = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.user.id;
      const updated = await UserService.updateProfile(userId, req.body);

      return ApiResponse.success(res, updated, "Profile Berhasil diperbaharui");
    }
  );

  public static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return ApiResponse.error(res, "Password lama & baru wajib diisi dulu gaes", 400);
    } 

    await UserService.changePassword(userId, oldPassword, newPassword);
        
    return ApiResponse.success(res, null, "Password berhasil dirubah");
  });

  public static verifyNewEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    const user = await UserService.verifyNewEmail(token);

    return ApiResponse.success(res, user, "Email baru berhasil diverifikasi");
  });

}

export default UserController;
