// src/controllers/UserController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import UserService from "../services/UserService";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

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
  public static getUserById = async (req: Request, res: Response) => {
    try {
      const user_id = req.params.id?.toString();
      if (!user_id) return ApiResponse.error(res, "Error", 400);
      const result = await prisma.user.findMany({
        where: { id: user_id },
        omit: {
          created_at: true,
          password: true,
          updated_at: true,
        },
      });
      console.log(result);
      ApiResponse.success(res, result, "Get User By Id", 200);
    } catch (error) {
      ApiResponse.error(res, "Get User By ID Error", 400);
    }
  };

  public static getAllCustomers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const status = req.query.status as string;

      const skip = (page - 1) * limit;
      const where: Prisma.UserWhereInput = {
        is_deleted: false,
        role: "CUSTOMER",
        OR: [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
      if (status === "verified") {
        where.is_verified === true;
      } else if (status === "unverified") {
        where.is_verified === false;
      }
      const [customers, totalCustomers] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: { addresses: true },
        }),
        prisma.user.count({ where }),
      ]);
      const totalPages = Math.ceil(totalCustomers / limit);

      return ApiResponse.success(
        res,
        {
          data: customers,
          pagination: { total: totalCustomers },
          page,
          totalPages,
        },
        "Get All Customers Data Success"
      );
    } catch (error) {
      ApiResponse.error(res, "Error get customers data", 400);
    }
  };

  public static getAllStoreAdmin = async (req: Request, res: Response) => {
    try {
      const customersData = await prisma.user.findMany({
        where: { role: "STORE_ADMIN", store_id: null, is_deleted: false },
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

  public static softDeleteUserById = async (req: Request, res: Response) => {
    try {
      //using soft delete methods
      const userId = req.params.id;
      // cari data user id apakah ada di admin
      // kalo ada, maka update store id menjadi null, dan data usernya menjadi is_deleted true

      const findAdmin = await prisma.user.findUnique({
        where: { id: userId!, role: "STORE_ADMIN" },
      });
      if (findAdmin) {
        await prisma.user.update({
          where: { id: userId! },
          data: { is_deleted: true, store_id: null, role: "CUSTOMER" },
        });
      } else {
        await prisma.user.update({
          where: { id: userId! },
          data: {
            is_deleted: true,
          },
        });
      }

      return ApiResponse.success(res, `Soft Delete user id ${userId} success`);
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
        return ApiResponse.error(res, "Password lama & baru wajib diisi dulu", 400);
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
