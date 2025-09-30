"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StoreController_1 = __importDefault(require("../controllers/StoreController"));
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const AuthorizeRoles_1 = require("../middlewares/AuthorizeRoles");
class StoreRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/all", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.getAllStores);
        this.router.get("/store-admins", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.getAllStoreAdmin);
        this.router.post("/", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.createStore);
        this.router.post("/new-store-admin", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.postNewAdmin);
        this.router.patch("/soft-delete/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.softDeleteStoreById);
        this.router.patch("/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.patchStoreById);
        this.router.patch("/relocate-admin/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), StoreController_1.default.patchStoreAdminRelocation);
    }
}
exports.default = new StoreRoutes().router;
//# sourceMappingURL=StoreRoutes.js.map