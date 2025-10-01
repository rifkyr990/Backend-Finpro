"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const UploadMiddleware_1 = require("../middlewares/UploadMiddleware");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/register", AuthController_1.default.register);
        this.router.post("/login", AuthController_1.default.login);
        this.router.post("/verify-email", AuthController_1.default.verifyEmail);
        this.router.post("/request-reset", AuthController_1.default.requestResetPassword);
        this.router.post("/resend-verification", AuthController_1.default.resendVerification);
        this.router.post("/resent-regist", AuthController_1.default.resendRegistVerification);
        this.router.post("/reset-password", AuthController_1.default.resetPassword);
        this.router.post("/google-login", AuthController_1.default.loginWithGoogle);
        this.router.post("/upload-profie", UploadMiddleware_1.upload.single("profile_picture"), AuthController_1.default.resendVerification);
        // 🔐 Protected route: hanya CUSTOMER dan TENANT yang boleh akses
        // this.router.get("/profile",authMiddleware(),authorizeRoles("CUSTOMER", "TENANT"),AuthController.getProfile);
    }
}
exports.default = new AuthRoutes().router;
//# sourceMappingURL=AuthRoutes.js.map