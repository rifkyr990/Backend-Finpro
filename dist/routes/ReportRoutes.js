"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_1 = __importDefault(require("../controllers/ReportController"));
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
class ReportRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/orders", (0, AuthMiddleware_1.authMiddleware)(), ReportController_1.default.getAllOrderData);
        this.router.get("/orders/by-store", (0, AuthMiddleware_1.authMiddleware)(), ReportController_1.default.getOrderDataByStore);
    }
}
exports.default = new ReportRoutes().router;
//# sourceMappingURL=ReportRoutes.js.map