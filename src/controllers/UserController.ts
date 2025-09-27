// src/controllers/UserController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import UserDataService from "../services/UserDataService";
import UserService from "../services/UserService";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

class UserController {
  public static getAllUsers = asyncHandler(
    async (req: Request, res: Response) => {
      const usersData = await UserDataService.getAllUsers();
      return ApiResponse.success(res, usersData, "Get All Users Data Success");
    }
  );

  public static getUserById = asyncHandler(
    async (req: Request, res: Response) => {
      const user_id = req.params.id?.toString();
      if (!user_id) return ApiResponse.error(res, "Error", 400);
      const result = await UserDataService.getUserById(user_id);
      ApiResponse.success(res, result, "Get User By Id", 200);
    }
  );

  public static getAllCustomers = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await UserDataService.getAllCustomers(req.query);
      ApiResponse.success(res, result, "Get All Customers Data Success");
    }
  );

  public static getAllStoreAdmin = asyncHandler(
    async (req: Request, res: Response) => {
      const customersData = await UserDataService.getAllStoreAdmin();
      return ApiResponse.success(
        res,
        customersData,
        "Get All Store Admin Data Success"
      );
    }
  );

  public static softDeleteUserById = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.id;
      if (!userId) {
        return ApiResponse.error(res, "Error soft delete data", 400);
      }
      const result = await UserDataService.softDeleteUserById(userId);
      ApiResponse.success(res, result, "Soft Delete User Success", 200);
    }
  );

  public static assignAdminbyId = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.id;
      const storeId = req.body.store_id;
      // Validasi input
      if (!userId || isNaN(storeId)) {
        return ApiResponse.error(res, "Invalid userId or storeId", 400);
      }
      const result = await UserDataService.AssignAdminById(userId, storeId);
      ApiResponse.success(res, result, "Assign Admin Success", 201);
    }
  );

  public static revertAdminbyId = asyncHandler(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      if (!id) return ApiResponse.error(res, "Invalid id");
      const revertAdmin = await prisma.user.update({
        where: { id },
        data: {
          store_id: null,
          role: "CUSTOMER",
        },
      });
      ApiResponse.success(res, revertAdmin, "Revert Success", 200);
    }
  );

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

  public static updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const updated = await UserService.updateProfile(userId, req.body);

      return ApiResponse.success(res, updated, "Profile Berhasil diperbaharui");
    }
  );
  public static updateUser = async (req: Request, res: Response) => {
    try {
      const user_id = req.params.id?.toString();
      if (!user_id) return ApiResponse.error(res, "Eror", 400);
      const { first_name, last_name, email, password, phone, store_id } =
        req.body;

      const updateUser = await prisma.user.update({
        where: { id: user_id },
        data: {
          first_name,
          last_name,
          email,
          password,
          phone,
          store_id,
        },
      });
      ApiResponse.success(res, updateUser, "Update User Success!", 200);
    } catch (error) {
      ApiResponse.error(res, "Update User Error", 400);
      console.log(error);
    }
  };

  public static changePassword = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return ApiResponse.error(
          res,
          "Password lama & baru wajib diisi dulu gaes",
          400
        );
      }

      await UserService.changePassword(userId, oldPassword, newPassword);

      return ApiResponse.success(res, null, "Password berhasil dirubah");
    }
  );

  public static verifyNewEmail = asyncHandler(
    async (req: Request, res: Response) => {
      const { token } = req.body;
      const user = await UserService.verifyNewEmail(token);

      return ApiResponse.success(res, user, "Email baru berhasil diverifikasi");
    }
  );
}

export default UserController;
