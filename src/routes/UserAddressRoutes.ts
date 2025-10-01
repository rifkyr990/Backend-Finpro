import { Router } from "express";
import UserAddressController from "../controllers/UserAddressController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { authorizeRoles } from "../middlewares/AuthorizeRoles";

class UserAddressRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", authMiddleware(),authorizeRoles("CUSTOMER"),UserAddressController.getAddress);
        this.router.post("/", authMiddleware(),authorizeRoles("CUSTOMER"), UserAddressController.createAddress);
        this.router.put("/:id", authMiddleware(),authorizeRoles("CUSTOMER"), UserAddressController.updateAddress);
        this.router.patch("/:id/primary", authMiddleware(),authorizeRoles("CUSTOMER"),UserAddressController.setPrimaryAddress);
        this.router.delete("/:id", authMiddleware(),authorizeRoles("CUSTOMER"),UserAddressController.deleteAddress);
    }
}

export default new UserAddressRoutes().router;