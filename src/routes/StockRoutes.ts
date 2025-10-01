import { Router } from "express";
import StockController from "../controllers/StockController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/all", authMiddleware(), StockController.getProductStocks); // arco
    this.router.post(
      "/change-stock/store/:id",
      authMiddleware(),
      StockController.postChangeProductStock
    );
    this.router.get(
      "/stock-history",
      authMiddleware(),
      StockController.getProductStockHistory
    );
    this.router.get(
      "/stock-history/summary-all-store",
      authMiddleware(),
      StockController.getProductStockHistoryAllStoreSummary
    );
    this.router.get(
      "/stock-history/summary",
      authMiddleware(),
      StockController.getProductStockHistorySummary
    );
  }
}
export default new ProductRoutes().router;
