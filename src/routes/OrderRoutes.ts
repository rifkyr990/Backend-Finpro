import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import OrderController from "../controllers/OrderController";

class OrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", authMiddleware(), OrderController.createOrder);
  }
}

export default new OrderRoutes().router;
