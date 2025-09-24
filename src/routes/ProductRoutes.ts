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
    this.router.get("/landing/all", ProductController.getLandingProduct);
    this.router.get("/all", ProductController.getAllProduct);

    this.router.get("/detail/:id", ProductController.getProductById);
    this.router.patch(
      "/update-product/:id",
      authMiddleware(),
      upload.array("images", 4),
      ProductController.updateProductById
    );
    this.router.get("/store/:id", ProductController.getAllProductByStoreId);
    this.router.get(
      "/by-categories",
      authMiddleware(),
      ProductController.getProductbyCategories
    );
    this.router.patch(
      "/category",
      authMiddleware(),
      ProductController.deleteCategory
    );
    this.router.patch(
      "/update-category",
      authMiddleware(),
      ProductController.editCategory
    );
    this.router.delete(
      "/category",
      authMiddleware(),
      ProductController.deleteCategory
    );
    this.router.patch(
      "/category",
      authMiddleware(),
      ProductController.editCategory
    );

    this.router.patch(
      "/change-status/:id",
      ProductController.changeProductStatus
    );
    this.router.post(
      "/new-category",
      authMiddleware(),
      ProductController.createProductCategory
    );
    this.router.get("/", ProductController.getAllProductByLocation);
    this.router.delete("/", authMiddleware(), ProductController.deleteProduct);
    this.router.patch(
      "/soft-delete",
      authMiddleware(),
      ProductController.softDeleteProduct
    );
    this.router.post(
      "/new-product",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN"),
      upload.array("images", 4),
      ProductController.createNewProduct
    );
  }
}
export default new ProductRoutes().router;
