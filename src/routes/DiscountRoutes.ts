import { Router } from "express";
import DiscountController from "../controllers/DiscountController";

class DiscountRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/verify", DiscountController.verifyDiscount);
    this.router.get("/all", DiscountController.getAllDiscount); // arco
    this.router.patch("/delete/:id", DiscountController.softDeleteDiscount); //arco
    this.router.post("/new", DiscountController.createDiscount); //arco
  }
}

export default new DiscountRoutes().router;
