import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../config/prisma";
import { request } from "http";
import { hashPassword } from "../utils/bcrypt";

class StoreController {
  // get all stores data - arco start
  public static getAllStores = async (req: Request, res: Response) => {
    try {
      const storesData = await prisma.store.findMany({
        include: {
          admins: true,
        },
      });
      ApiResponse.success(res, storesData, "Get All Store Data Success!");
    } catch (error) {
      ApiResponse.error(res, "Error get all stores data", 400);
    }
  }; //arco

  public static getAllStoreAdmin = async (req: Request, res: Response) => {
    try {
      // Store admin yang tidak punya store
      const storeAdminWoStore = await prisma.user.findMany({
        where: {
          store_id: null,
          role: "STORE_ADMIN",
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          role: true,
          phone: true,
        },
      });

      // Store admin yang punya store
      const storeAdminWithStore = await prisma.store.findMany({
        select: {
          name: true,
          id: true,
          admins: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              role: true,
              phone: true,
            },
          },
        },
      });

      const storeAdminData = {
        withStore: storeAdminWithStore,
        withoutStore: storeAdminWoStore,
      };
      ApiResponse.success(res, storeAdminData, "Get Store Admins Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get All Store Admin Failed", 400);
    }
  }; // arco

  public static postNewAdmin = async (req: Request, res: Response) => {
    try {
      let { first_name, last_name, email, password, store_id, phone } =
        req.body;

      email = email.trim().toLowerCase();
      // checking for existing data
      const checkData = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (checkData) {
        throw new Error("There is an existing data");
      }

      const hashedPassword = await hashPassword(password);
      const data = await prisma.user.create({
        data: {
          first_name,
          last_name,
          password: hashedPassword,
          email,
          store_id: store_id ?? null,
          phone,
          is_verified: true,
          role: "STORE_ADMIN",
          image_url: "https://iili.io/KRwBd91.png",
        },
      });
      ApiResponse.success(res, data, "Create New Store Admin Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Create new store admin error");
      console.log(error);
    }
  }; //arco

  public static deleteStoreById = async (req: Request, res: Response) => {
    try {
      const storeId = Number(req.params.id);
      const result = await prisma.$transaction(async (tx) => {
        // revert admin to customer
        await tx.user.updateMany({
          where: {
            store_id: storeId,
            role: "STORE_ADMIN",
          },
          data: {
            role: "CUSTOMER",
          },
        });
        // delete store id
        await tx.store.delete({
          where: { id: storeId },
        });
      });
      ApiResponse.success(res, result, "Delete Data Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Error delete store data by id", 400);
    }
  }; // arco

  // di dalam StoreController
  public static createStore = async (req: Request, res: Response) => {
    try {
      const {
        name,
        address,
        city,
        province,
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
          province,
          latitude,
          longitude,
          is_active,
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
      const { name, address, city, province, latitude, longitude, is_active } =
        req.body.payload;
      const updateStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          name,
          address,
          city,
          province,
          latitude,
          longitude,
          is_active,
        },
      });
      // console.log(req.body.payload);
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
