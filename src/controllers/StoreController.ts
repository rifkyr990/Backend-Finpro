import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../config/prisma";
import { request } from "http";
import { hashPassword } from "../utils/bcrypt";
import StoreService from "../services/StoreService";
import { asyncHandler } from "../utils/AsyncHandler";

class StoreController {
  public static getAllStores = asyncHandler(
    async (req: Request, res: Response) => {
      const storesData = await StoreService.getAllStores();
      ApiResponse.success(res, storesData, "Get All Store Data Success!");
    }
  );

  public static getAllStoreAdmin = asyncHandler(
    async (req: Request, res: Response) => {
      const storeAdminWoStore = await StoreService.storeAdminWithoutStore();
      const storeAdminWithStore = await StoreService.storeAdminWithStore();

      const storeAdminData = {
        withStore: storeAdminWithStore,
        withoutStore: storeAdminWoStore,
      };
      ApiResponse.success(res, storeAdminData, "Get Store Admins Success", 200);
    }
  );

  public static postNewAdmin = asyncHandler(
    async (req: Request, res: Response) => {
      const newAdminData = req.body;
      const result = await StoreService.postNewAdmin(newAdminData);
      ApiResponse.success(res, result, "Create New Store Admin Success", 200);
    }
  );

  public static softDeleteStoreById = asyncHandler(
    async (req: Request, res: Response) => {
      const storeId = Number(req.params.id);
      const result = await StoreService.softDeleteStoreById(storeId);
      ApiResponse.success(res, result, "Delete Data Success", 200);
    }
  );

  // di dalam StoreController
  public static createStore = async (req: Request, res: Response) => {
    try {
      const {
        name,
        address,
        city,
        city_id,
        province,
        province_id,
        latitude,
        longitude,
        is_active,
        adminIds,
      } = req.body.payload;

      // 1. Buat store baru
      const newStore = await prisma.store.create({
        data: {
          name,
          address,
          city,
          city_id,
          province,
          province_id,
          latitude,
          longitude,
          is_active,
          // admins: {
          //   connect: adminIds.map(id => ({ id })),
          // }
        },
      });

      // 2. Update admin agar terhubung ke store & ubah role ke STORE_ADMIN
      if (adminIds && adminIds.length > 0) {
        await prisma.user.updateMany({
          where: {
            id: { in: adminIds },
          },
          data: {
            role: "STORE_ADMIN",
            store_id: newStore.id,
          },
        });
      }

      // 3. Ambil data lengkap store + admins
      const storeWithAdmins = await prisma.store.findUnique({
        where: { id: newStore.id },
        include: {
          admins: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              role: true,
            },
          },
        },
      });

      return ApiResponse.success(
        res,
        storeWithAdmins,
        "Create Store Success!",
        201
      );
    } catch (error) {
      console.error(error);
      return ApiResponse.error(res, "Create Store Error", 400);
    }
  };

  public static patchStoreById = async (req: Request, res: Response) => {
    try {
      const storeId = Number(req.params.id);
      const {
        name,
        address,
        city,
        city_id,
        province,
        province_id,
        latitude,
        longitude,
        is_active,
      } = req.body.payload;

      const cityName = city.trim().toUpperCase();
      const provinceName = province.trim().toUpperCase();

      const updateStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          name,
          address,
          city: cityName,
          city_id,
          province: provinceName,
          province_id,
          latitude,
          longitude,
          is_active,
        },
      });

      ApiResponse.success(
        res,
        updateStore,
        "Update Store Details Success!",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Update Store Error", 400);
    }
  };

  public static patchStoreAdminRelocation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;
      const store_id = req.body.store_id;

      if (!id) return;

      const relocatedAdmin = await prisma.user.update({
        where: { id },
        data: { store_id: store_id },
      });
      ApiResponse.success(
        res,
        relocatedAdmin,
        "Relocate Store Admin Success",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Error Relocate Store Admin", 400);
    }
  };
}

export default StoreController;
