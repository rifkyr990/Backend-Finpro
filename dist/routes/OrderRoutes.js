"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const OrderController_1 = __importDefault(require("../controllers/OrderController"));
const UploadMiddleware_1 = require("../middlewares/UploadMiddleware");
class OrderRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/my-orders", (0, AuthMiddleware_1.authMiddleware)(), OrderController_1.default.getMyOrders);
        this.router.post("/", (0, AuthMiddleware_1.authMiddleware)(), OrderController_1.default.createOrder);
        this.router.get("/:orderId", (0, AuthMiddleware_1.authMiddleware)(), OrderController_1.default.getOrderById);
        this.router.post("/:orderId/upload-proof", (0, AuthMiddleware_1.authMiddleware)(), UploadMiddleware_1.upload.single("paymentProof"), OrderController_1.default.uploadPaymentProof);
        this.router.patch("/:orderId/cancel", (0, AuthMiddleware_1.authMiddleware)(), OrderController_1.default.cancelOrder);
        this.router.patch("/:orderId/confirm-receipt", (0, AuthMiddleware_1.authMiddleware)(), OrderController_1.default.confirmReceipt);
        this.router.post("/:orderId/repay", (0, AuthMiddleware_1.authMiddleware)(), OrderController_1.default.repayOrder);
    }
}
exports.default = new OrderRoutes().router;
//# sourceMappingURL=OrderRoutes.js.map