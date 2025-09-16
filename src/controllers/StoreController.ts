import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../config/prisma";

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
  };
  // arco -end

  public static getAllStoreAdmin = async (req: Request, res: Response) => {
    try {
      const storeAdminData = await prisma.store.findMany({
        select: {
          name: true,
          id: true,
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
      ApiResponse.success(res, storeAdminData, "Get Store Admins Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get All Store Admin Failed", 400);
    }
  }; // arco

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
