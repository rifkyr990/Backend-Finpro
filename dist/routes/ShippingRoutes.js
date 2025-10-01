"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const ShippingController_1 = __importDefault(require("../controllers/ShippingController"));
class ShippingRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/options", (0, AuthMiddleware_1.authMiddleware)(), ShippingController_1.default.getShippingOptions);
    }
}
exports.default = new ShippingRoutes().router;
//# sourceMappingURL=ShippingRoutes.js.map