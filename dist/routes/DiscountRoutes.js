"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DiscountController_1 = __importDefault(require("../controllers/DiscountController"));
class DiscountRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/verify", DiscountController_1.default.verifyDiscount);
        this.router.get("/all", DiscountController_1.default.getAllDiscount);
        this.router.patch("/delete/:id", DiscountController_1.default.softDeleteDiscount);
        this.router.post("/new", DiscountController_1.default.createDiscount);
    }
}
exports.default = new DiscountRoutes().router;
//# sourceMappingURL=DiscountRoutes.js.map