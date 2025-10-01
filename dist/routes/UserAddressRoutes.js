"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserAddressController_1 = __importDefault(require("../controllers/UserAddressController"));
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const AuthorizeRoles_1 = require("../middlewares/AuthorizeRoles");
class UserAddressRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserAddressController_1.default.getAddress);
        this.router.post("/", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserAddressController_1.default.createAddress);
        this.router.put("/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserAddressController_1.default.updateAddress);
        this.router.patch("/:id/primary", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserAddressController_1.default.setPrimaryAddress);
        this.router.delete("/:id", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("CUSTOMER"), UserAddressController_1.default.deleteAddress);
    }
}
exports.default = new UserAddressRoutes().router;
//# sourceMappingURL=UserAddressRoutes.js.map