import { Router } from "express";
import ProductController from "../controllers/ProductController";
import { upload } from "../middlewares/UploadMiddleware";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/all", ProductController.getAllProduct); //arco
    this.router.get("/by-categories", ProductController.getProductbyCategories); //arco
    this.router.delete("/category", ProductController.deleteCategory); //arco
    this.router.patch("/category", ProductController.editCategory); //arco
    this.router.patch(
      "/change-status/:id",
      ProductController.changeProductStatus
    ); //arco
    this.router.post("/new-category", ProductController.createProductCategory); // arco
    this.router.get("/", ProductController.getAllProductByLocation); // arco
    this.router.delete("/", ProductController.deleteProduct); // arco
    this.router.post(
      "/new-product",
      upload.array("images", 4),
      ProductController.createNewProduct
    ); //arco
  }
}
export default new ProductRoutes().router;
