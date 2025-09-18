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
  }
}
export default new ProductRoutes().router;
