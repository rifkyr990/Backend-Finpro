import { Router } from "express";
import UserController from "../controllers/UserController";
import { upload } from "../middlewares/UploadMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { authorizeRoles } from "../middlewares/AuthorizeRoles";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/all", UserController.getAllUsers); // arco
    this.router.get("/customers", UserController.getAllCustomers); // arco
    this.router.delete("/:id", UserController.deleteUserById); // arco
    this.router.patch("/update-user/:id", UserController.updateUser); // arco
    this.router.get("/:id", UserController.getUserById); // arco
    this.router.patch("/new-admin/:id", UserController.assignAdminbyId); // arco
    this.router.patch("/revert-admin/:id", UserController.revertAdminbyId); // arco

    // AFTER AUTH MIDDLEWARE
    // this.router.get("/all",authMiddleware(),authorizeRoles("SUPER_ADMIN"), UserController.getAllUsers);
    // this.router.get("/customers",authMiddleware(),authorizeRoles("SUPER_ADMIN"), UserController.getAllCustomers);
    // this.router.get("/store-admin",authMiddleware(),authorizeRoles("SUPER_ADMIN"), UserController.getAllStoreAdmin);
    // this.router.delete("/:id",authMiddleware(),authorizeRoles("SUPER_ADMIN"), UserController.deleteUserById);
    // this.router.patch("/new-admin/:id",authMiddleware(),authorizeRoles("SUPER_ADMIN"),UserController.assignAdminbyId);
    // this.router.patch("/revert-admin/:id",authMiddleware(),authorizeRoles("SUPER_ADMIN"), UserController.revertAdminbyId);
    // // this.router.post("/assign-admins",UserController.assignMultipleAdmins);
    // this.router.get("/profile", authMiddleware(), UserController.getProfile);
    // this.router.put("/profile", authMiddleware(), UserController.updateProfile);
    // this.router.post("/verify-new-email",authMiddleware(),UserController.verifyNewEmail);
    // this.router.put("/change-password",authMiddleware(),authorizeRoles("CUSTOMER"),UserController.changePassword);
    // this.router.put("/profile-picture",authMiddleware(),upload.single("image"),UserController.updateProfilePicture);
  }
}

export default new UserRoutes().router;
