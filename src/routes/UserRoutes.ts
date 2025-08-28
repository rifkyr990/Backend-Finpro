import { Router } from "express";
import UserController from "../controllers/UserController";
import { upload } from "../middlewares/UploadMiddleware";

class UserRoutes {
    public router: Router;
    private userController: UserController;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.get("/", this.userController.getUsers);
        this.router.post("/", this.userController.createUser);
        this.router.put("/:id/profile-picture", upload.single("file"), this.userController.updateProfilePicture);
    }
}

export default new UserRoutes().router;