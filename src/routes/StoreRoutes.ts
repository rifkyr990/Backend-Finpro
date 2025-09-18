import { Router } from "express";
import StoreController from "../controllers/StoreController";

class StoreRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/all", StoreController.getAllStores); //get all stores - arco
    this.router.get("/store-admins", StoreController.getAllStoreAdmin); //get all stores - arco
    this.router.delete("/:id", StoreController.deleteStoreById); // arco
    this.router.post("/new-store-admin", StoreController.postNewAdmin); //arco
    this.router.patch("/:id", StoreController.patchStoreById); // arco
    this.router.patch(
      "/relocate-admin/:id",
      StoreController.patchStoreAdminRelocation
    ); //get all stores - arco
  }
}

export default new StoreRoutes().router;
