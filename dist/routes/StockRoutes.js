"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StockController_1 = __importDefault(require("../controllers/StockController"));
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
class ProductRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/all", (0, AuthMiddleware_1.authMiddleware)(), StockController_1.default.getProductStocks); // arco
        this.router.post("/change-stock/store/:id", (0, AuthMiddleware_1.authMiddleware)(), StockController_1.default.postChangeProductStock);
        this.router.get("/stock-history", (0, AuthMiddleware_1.authMiddleware)(), StockController_1.default.getProductStockHistory);
        this.router.get("/stock-history/summary-all-store", (0, AuthMiddleware_1.authMiddleware)(), StockController_1.default.getProductStockHistoryAllStoreSummary);
        this.router.get("/stock-history/summary", (0, AuthMiddleware_1.authMiddleware)(), StockController_1.default.getProductStockHistorySummary);
    }
}
exports.default = new ProductRoutes().router;
//# sourceMappingURL=StockRoutes.js.map