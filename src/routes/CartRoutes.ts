import { Router } from "express";
import CartController from "../controllers/CartController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const router = Router();

class CartRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", authMiddleware(), CartController.getCart);
    this.router.put("/", authMiddleware(), CartController.updateCart);
  }
}

export default new CartRoutes().router;