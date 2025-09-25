import { Router } from "express";
import DiscountController from "../controllers/DiscountController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

class DiscountRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/verify", DiscountController.verifyDiscount);
    this.router.get("/all", DiscountController.getAllDiscount);
    this.router.patch(
      "/delete/:id",

      DiscountController.softDeleteDiscount
    );
    this.router.post("/new", DiscountController.createDiscount);
  }
}

export default new DiscountRoutes().router;
