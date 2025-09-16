import { Router } from "express";
import UserController from "../controllers/UserController";
import { upload } from "../middlewares/UploadMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";

class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/all", UserController.getAllUsers); // arco
    this.router.get("/customers", UserController.getAllCustomers); // arco
    this.router.get("/store-admin", UserController.getAllStoreAdmin); // arco
    this.router.delete("/:id", UserController.deleteUserById); // arco
    this.router.patch("/new-admin/:id", UserController.assignAdminbyId); // arco
    this.router.patch("/revert-admin/:id", UserController.revertAdminbyId); // arco
    // this.router.post("/assign-admins",UserController.assignMultipleAdmins);
    this.router.get("/profile", authMiddleware(), UserController.getProfile);
    this.router.put("/profile", authMiddleware(), UserController.updateProfile);
    this.router.post("/verify-new-email", UserController.verifyNewEmail);
    this.router.put("/change-password",authMiddleware(),UserController.changePassword);
    this.router.put(
      "/profile-picture",
      authMiddleware(),
      upload.single("image"),
      UserController.updateProfilePicture
    );
  }
}

export default new UserRoutes().router;
