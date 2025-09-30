import { Request, Response } from "express";
declare class ProductController {
    static getLandingProduct: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getAllProduct: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProductById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getAllProductByLocation: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getAllProductByStoreId: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static updateProductById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static getProductbyCategories: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static deleteCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static editCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static changeProductStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createProductCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static createNewProduct: (req: Request, res: Response, next: import("express").NextFunction) => void;
    static softDeleteProduct: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export default ProductController;
//# sourceMappingURL=ProductController.d.ts.map