import { Router } from "express";
import ProductController from "../controllers/ProductController";
import { upload } from "../middlewares/UploadMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { authorizeRoles } from "../middlewares/AuthorizeRoles";

class ProductRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/landing/all", ProductController.getLandingProduct); // arco
    this.router.get("/all", ProductController.getAllProduct); //arco

    this.router.get("/detail/:id", ProductController.getProductById); // arco
    this.router.patch(
      "/update-product/:id",
      upload.array("images", 4),
      ProductController.updateProductById
    ); //arco
    this.router.get("/store/:id", ProductController.getAllProductByStoreId); // arco
    this.router.get("/by-categories", ProductController.getProductbyCategories); //arco
    this.router.patch("/category", ProductController.deleteCategory); //arco
    this.router.patch("/update-category", ProductController.editCategory); //arco
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
    this.router.patch("/soft-delete", ProductController.softDeleteProduct); // arco
    this.router.post(
      "/new-product",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN"),
      upload.array("images", 4),
      ProductController.createNewProduct
    ); //arco
  }
}
export default new ProductRoutes().router;
