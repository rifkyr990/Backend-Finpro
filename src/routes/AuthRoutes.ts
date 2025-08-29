import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { authorizeRoles } from "../middlewares/AuthorizeRoles"; // ✅ Import middleware RBAC

class AuthRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/register", AuthController.register);
        this.router.post("/login", AuthController.login);
        this.router.post("/verify-email", AuthController.verifyEmail);
        this.router.post("/request-reset", AuthController.requestResetPassword);
        this.router.post("/reset-password", AuthController.resetPassword);


        // 🔐 Protected route: hanya CUSTOMER dan TENANT yang boleh akses
        this.router.get("/profile",authMiddleware(),authorizeRoles("CUSTOMER", "TENANT"),AuthController.getProfile);
    }
}

export default new AuthRoutes().router;
