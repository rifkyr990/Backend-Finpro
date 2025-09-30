"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = __importDefault(require("../controllers/UserController"));
const UploadMiddleware_1 = require("../middlewares/UploadMiddleware");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const AuthorizeRoles_1 = require("../middlewares/AuthorizeRoles");
class UserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/all", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UserController_1.default.getAllUsers);
        this.router.get("/customers", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UserController_1.default.getAllCustomers);
        this.router.get("/store-admin", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UserController_1.default.getAllStoreAdmin);
        this.router.patch("/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UserController_1.default.softDeleteUserById);
        this.router.patch("/new-admin/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UserController_1.default.assignAdminbyId);
        this.router.patch("/revert-admin/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UserController_1.default.revertAdminbyId);
        // this.router.post("/assign-admins",UserController.assignMultipleAdmins);
        this.router.get("/profile", (0, AuthMiddleware_1.authMiddleware)(), UserController_1.default.getProfile);
        this.router.put("/profile", (0, AuthMiddleware_1.authMiddleware)(), UserController_1.default.updateProfile);
        this.router.post("/verify-new-email", UserController_1.default.verifyNewEmail);
        this.router.put("/change-password", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserController_1.default.changePassword);
        this.router.put("/profile-picture", (0, AuthMiddleware_1.authMiddleware)(), UploadMiddleware_1.upload.single("image"), UserController_1.default.updateProfilePicture);
        this.router.patch("/update-user/:id", UserController_1.default.updateUser);
        this.router.get("/:id", UserController_1.default.getUserById);
        this.router.get("/profile", (0, AuthMiddleware_1.authMiddleware)(), UserController_1.default.getProfile);
        this.router.put("/profile", (0, AuthMiddleware_1.authMiddleware)(), UserController_1.default.updateProfile);
        this.router.post("/verify-new-email", (0, AuthMiddleware_1.authMiddleware)(), UserController_1.default.verifyNewEmail);
        this.router.put("/change-password", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserController_1.default.changePassword);
        this.router.put("/profile-picture", (0, AuthMiddleware_1.authMiddleware)(), UploadMiddleware_1.upload.single("image"), UserController_1.default.updateProfilePicture);
    }
}
exports.default = new UserRoutes().router;
//# sourceMappingURL=UserRoutes.js.map