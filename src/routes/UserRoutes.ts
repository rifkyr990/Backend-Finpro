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
        this.router.get("/profile", authMiddleware(), UserController.getProfile);
        this.router.put("/profile", authMiddleware(), UserController.updateProfile);
        this.router.post("/resend-verification",authMiddleware(), UserController.resendVerification);
        this.router.put("/change-password", authMiddleware(), UserController.changePassword);
        this.router.put("/profile-picture", authMiddleware(),upload.single("image"), UserController.updateProfilePicture);
    }
}

export default new UserRoutes().router;