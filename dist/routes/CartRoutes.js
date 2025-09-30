"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CartController_1 = __importDefault(require("../controllers/CartController"));
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
class CartRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", (0, AuthMiddleware_1.authMiddleware)(), CartController_1.default.getCart);
        this.router.put("/", (0, AuthMiddleware_1.authMiddleware)(), CartController_1.default.updateCart);
    }
}
exports.default = new CartRoutes().router;
//# sourceMappingURL=CartRoutes.js.map