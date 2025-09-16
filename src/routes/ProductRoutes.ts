import { Router } from "express";
import ProductController from "../controllers/ProductController";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/all", ProductController.getAllProduct); //arco
    this.router.get("/", ProductController.getAllProductByLocation); // arco
  }
}
export default new ProductRoutes().router;
