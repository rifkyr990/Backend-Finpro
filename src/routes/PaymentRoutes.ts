import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import PaymentController from "../controllers/PaymentController";

class PaymentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/create-transaction",
      authMiddleware(),
      PaymentController.createTransaction
    );
  }
}

export default new PaymentRoutes().router;
