import { Router } from "express";
import ReportController from "../controllers/ReportController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

class ReportRoutes {
  public router = Router();
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      "/orders",
      authMiddleware(),
      ReportController.getAllOrderData
    );
    this.router.get(
      "/orders/by-store",
      authMiddleware(),
      ReportController.getOrderDataByStore
    );
  }
}

export default new ReportRoutes().router;
