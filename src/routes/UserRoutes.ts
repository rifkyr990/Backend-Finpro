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
        this.router.post("/upload-profile", authMiddleware(),upload.single("image"), UserController.uploadProfilePicture);
        this.router.put("/update-profile", authMiddleware(),upload.single("image"), UserController.updateProfilePicture);
        this.router.delete("/delete-profile-picture", authMiddleware(), UserController.deleteProfilePicture);
    }
}

export default new UserRoutes().router;