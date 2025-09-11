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
      if (storeId) {
        const deletedStoreId = await prisma.store.delete({
          where: { id: storeId! },
        });
        ApiResponse.success(res, `Delete store id ${storeId} success`);
      }
    } catch (error) {
      ApiResponse.error(res, "Error delete store data by id", 400);
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
