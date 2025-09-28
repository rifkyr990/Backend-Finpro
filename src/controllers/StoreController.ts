import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import StoreService from "../services/StoreService";

class StoreController {
  private static handleSuccess(res: Response, data: any, message = "Success", code = 200) {
    ApiResponse.success(res, data, message, code);
  }

  private static handleError(res: Response, message = "Error", code = 400, error?: any) {
    if (error) console.error(error);
    ApiResponse.error(res, message, code);
  }

  public static getAllStores = async (req: Request, res: Response) => {
    try {
      const stores = await StoreService.getAllStores();
      this.handleSuccess(res, stores, "Get All Store Data Success!");
    } catch (error) {
      this.handleError(res, "Error get all stores data", 400, error);
    }
  };

  public static getAllStoreAdmin = async (req: Request, res: Response) => {
    try {
      const [withoutStore, withStore] = await Promise.all([
        StoreService.getStoreAdminsWithoutStore(),
        StoreService.getStoreAdminsWithStore(),
      ]);
      this.handleSuccess(res, { withStore, withoutStore }, "Get Store Admins Success");
    } catch (error) {
      this.handleError(res, "Get All Store Admin Failed", 400, error);
    }
  };

  public static postNewAdmin = async (req: Request, res: Response) => {
    try {
      let { first_name, last_name, email, password, store_id, phone } = req.body;
      email = email.trim().toLowerCase();

      const existingUser = await StoreService.checkUserExists(email);
      if (existingUser) return this.handleError(res, "There is an existing data", 400);

      const data = await StoreService.createStoreAdmin({ first_name, last_name, email, password, store_id, phone });
      this.handleSuccess(res, data, "Create New Store Admin Success");
    } catch (error) {
      this.handleError(res, "Create new store admin error", 400, error);
    }
  };

  public static softDeleteStoreById = async (req: Request, res: Response) => {
    try {
      const storeId = Number(req.params.id);
      await StoreService.softDeleteStore(storeId);
      this.handleSuccess(res, null, "Delete Data Success");
    } catch (error) {
      this.handleError(res, "Error delete store data by id", 400, error);
    }
  };

  public static createStore = async (req: Request, res: Response) => {
    try {
      const store = await StoreService.createStore(req.body.payload);
      this.handleSuccess(res, store, "Create Store Success!", 201);
    } catch (error) {
      this.handleError(res, "Create Store Error", 400, error);
    }
  };

  public static patchStoreById = async (req: Request, res: Response) => {
    try {
      const storeId = Number(req.params.id);
      const updatedStore = await StoreService.updateStore(storeId, req.body.payload);
      this.handleSuccess(res, updatedStore, "Update Store Details Success!");
    } catch (error) {
      this.handleError(res, "Update Store Error", 400, error);
    }
  };

  public static patchStoreAdminRelocation = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { store_id } = req.body;

      if (!id) return this.handleError(res, "Admin ID is required", 400);

      const relocatedAdmin = await StoreService.relocateStoreAdmin(id, store_id);
      this.handleSuccess(res, relocatedAdmin, "Relocate Store Admin Success");
    } catch (error) {
      this.handleError(res, "Error Relocate Store Admin", 400, error);
    }
  };
}

export default StoreController;
