import { Router } from "express";
import CartController from "../controllers/CartController";

const router = Router();

class CartRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", CartController.getCart);
    this.router.put("/", CartController.updateCart);
  }
}

export default new CartRoutes().router;
