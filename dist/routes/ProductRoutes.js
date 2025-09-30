"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = __importDefault(require("../controllers/ProductController"));
const UploadMiddleware_1 = require("../middlewares/UploadMiddleware");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const AuthorizeRoles_1 = require("../middlewares/AuthorizeRoles");
class ProductRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/landing/all", ProductController_1.default.getLandingProduct);
        this.router.get("/all", ProductController_1.default.getAllProduct);
        this.router.get("/detail/:id", ProductController_1.default.getProductById);
        this.router.patch("/update-product/:id", (0, AuthMiddleware_1.authMiddleware)(), UploadMiddleware_1.upload.array("images", 4), ProductController_1.default.updateProductById);
        this.router.get("/store/:id", ProductController_1.default.getAllProductByStoreId);
        this.router.get("/by-categories", (0, AuthMiddleware_1.authMiddleware)(), ProductController_1.default.getProductbyCategories);
        this.router.patch("/category", (0, AuthMiddleware_1.authMiddleware)(), ProductController_1.default.deleteCategory);
        this.router.patch("/update-category", (0, AuthMiddleware_1.authMiddleware)(), ProductController_1.default.editCategory);
        this.router.patch("/category", (0, AuthMiddleware_1.authMiddleware)(), ProductController_1.default.editCategory);
        this.router.patch("/change-status/:id", ProductController_1.default.changeProductStatus);
        this.router.post("/new-category", (0, AuthMiddleware_1.authMiddleware)(), ProductController_1.default.createProductCategory);
        this.router.get("/", ProductController_1.default.getAllProductByLocation);
        this.router.patch("/soft-delete", (0, AuthMiddleware_1.authMiddleware)(), ProductController_1.default.softDeleteProduct);
        this.router.post("/new-product", (0, AuthMiddleware_1.authMiddleware)(), (0, AuthorizeRoles_1.authorizeRoles)("SUPER_ADMIN"), UploadMiddleware_1.upload.array("images", 4), ProductController_1.default.createNewProduct);
    }
}
exports.default = new ProductRoutes().router;
//# sourceMappingURL=ProductRoutes.js.map