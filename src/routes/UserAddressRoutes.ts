import { Router } from "express";
import UserAddressController from "../controllers/UserAddressController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

class UserAddressRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", authMiddleware(), UserAddressController.getAddress);
        this.router.post("/", authMiddleware(), UserAddressController.createAddress);
        this.router.put("/:id", authMiddleware(), UserAddressController.updateAddress);
        this.router.patch("/:id/primary", authMiddleware(), UserAddressController.setPrimaryAddress);
        this.router.delete("/:id", authMiddleware(), UserAddressController.deleteAddress);
    }
}

export default new UserAddressRoutes().router;