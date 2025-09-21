import { Router } from "express";
import ReportController from "../controllers/ReportController";

class ReportRoutes {
  public router = Router();
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/orders", ReportController.getAllOrderData);
    this.router.get("/orders/by-store", ReportController.getOrderDataByStore);
  }
}

export default new ReportRoutes().router;
