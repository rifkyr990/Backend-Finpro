"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const PaymentController_1 = __importDefault(require("../controllers/PaymentController"));
class PaymentRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/create-transaction", (0, AuthMiddleware_1.authMiddleware)(), PaymentController_1.default.createTransaction);
        this.router.post("/midtrans-notification", PaymentController_1.default.handleMidtransNotification);
    }
}
exports.default = new PaymentRoutes().router;
//# sourceMappingURL=PaymentRoutes.js.map