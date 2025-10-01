"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const AdminOrderController_1 = __importDefault(require("../controllers/AdminOrderController"));
const AuthorizeRoles_1 = require("../middlewares/AuthorizeRoles");
class AdminOrderRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.use((0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN", "STORE_ADMIN"));
        this.router.get("/", AdminOrderController_1.default.getAllAdminOrders);
        this.router.get("/summary", AdminOrderController_1.default.getOrderSummary);
        this.router.get("/:orderId", AdminOrderController_1.default.getAdminOrderDetail);
        this.router.patch("/:orderId/confirm-payment", AdminOrderController_1.default.confirmPayment);
        this.router.patch("/:orderId/reject-payment", AdminOrderController_1.default.rejectPayment);
        this.router.patch("/:orderId/send-order", AdminOrderController_1.default.sendOrder);
        this.router.patch("/:orderId/cancel", AdminOrderController_1.default.adminCancelOrder);
        this.router.patch("/:orderId/mark-refunded", AdminOrderController_1.default.markAsRefunded);
    }
}
exports.default = new AdminOrderRoutes().router;
//# sourceMappingURL=AdminOrderRoutes.js.map