import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import ShippingController from "../controllers/ShippingController";

class ShippingRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/options",
      authMiddleware(),
      ShippingController.getShippingOptions
    );
  }
}

export default new ShippingRoutes().router;