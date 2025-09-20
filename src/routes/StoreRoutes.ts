import { Router } from "express";
import StoreController from "../controllers/StoreController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { authorizeRoles } from "../middlewares/AuthorizeRoles";

class StoreRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/all", authMiddleware(),authorizeRoles("SUPER_ADMIN"),StoreController.getAllStores); //get all stores - arco
    this.router.get("/store-admins",authMiddleware(),authorizeRoles("SUPER_ADMIN"), StoreController.getAllStoreAdmin); //get all stores - arco
    this.router.post("/",authMiddleware(),authorizeRoles("SUPER_ADMIN"), StoreController.createStore);
    this.router.post("/new-store-admin",authMiddleware(),authorizeRoles("SUPER_ADMIN"),StoreController.postNewAdmin);
    this.router.delete("/:id",authMiddleware(),authorizeRoles("SUPER_ADMIN"),  StoreController.deleteStoreById); // arco
    this.router.patch("/:id",authMiddleware(),authorizeRoles("SUPER_ADMIN"),  StoreController.patchStoreById); // arco
    this.router.patch("/relocate-admin/:id",authMiddleware(),authorizeRoles("SUPER_ADMIN"), StoreController.patchStoreAdminRelocation); //get all stores - arco
  }
}

export default new StoreRoutes().router;
