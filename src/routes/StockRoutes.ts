import { Router } from "express";
import StockController from "../controllers/StockController";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/all", StockController.getProductStocks); // arco
    this.router.post(
      "/change-stock/store/:id",
      StockController.postChangeProductStock
    );
    this.router.get("/stock-history", StockController.getProductStockHistory);
<<<<<<< HEAD
    this.router.get(
      "/stock-history/summary",
      StockController.getProductStockHistorySummary
    );
=======
>>>>>>> 1631025a79f86e1801e69c0af7548550843ca348
  }
}
export default new ProductRoutes().router;
