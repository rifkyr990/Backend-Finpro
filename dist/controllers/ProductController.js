"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const ApiResponse_1 = require("../utils/ApiResponse");
const nearestStoreHaversine_1 = require("../utils/nearestStoreHaversine");
const ProductService_1 = __importDefault(require("../services/ProductService"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const CategoryService_1 = __importDefault(require("../services/CategoryService"));
class ProductController {
}
_a = ProductController;
// untuk landing page
ProductController.getLandingProduct = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const productData = await ProductService_1.default.getLandingProducts();
    ApiResponse_1.ApiResponse.success(res, productData, "Get All Landing Product Success", 200);
});
// untuk product list di dashboard
ProductController.getAllProduct = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query;
    const result = await ProductService_1.default.getAllProducts(query);
    ApiResponse_1.ApiResponse.success(res, result, "Get All Product Success", 200);
});
// khusus untuk product details by Id
ProductController.getProductById = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const product_id = Number(req.params.id);
    const result = await ProductService_1.default.getProductById(product_id);
    if (!result) {
        return ApiResponse_1.ApiResponse.error(res, "Product Not Found", 404);
    }
    ApiResponse_1.ApiResponse.success(res, result, "Get Product By ID Success", 200);
});
ProductController.getAllProductByLocation = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { province, city, lat, long } = req.query;
    // if city exist, check both province and city
    let result = await prisma_1.default.product.findMany({
        where: {
            is_active: true,
            is_deleted: false,
            stocks: {
                some: {
                    store: {
                        is_active: true,
                        is_deleted: false,
                        province,
                        ...(city ? { city } : {}),
                    },
                },
            },
        },
        include: {
            category: true,
            images: true,
            stocks: {
                where: {
                    store: { province, ...(city ? { city } : {}) },
                },
                select: {
                    stock_quantity: true,
                    store: {
                        select: {
                            admins: {
                                select: {
                                    phone: true,
                                },
                            },
                            address: true,
                            city: true,
                            is_active: true,
                            latitude: true,
                            longitude: true,
                            name: true,
                            province: true,
                        },
                    },
                },
            },
        },
    });
    // if city not exist, check user province
    if (city && result.length === 0) {
        result = await prisma_1.default.product.findMany({
            where: {
                is_active: true,
                is_deleted: false,
                stocks: {
                    some: {
                        store: {
                            is_active: true,
                            is_deleted: false,
                            province,
                        },
                    },
                },
            },
            include: {
                category: true,
                images: true,
                stocks: {
                    where: {
                        store: { province },
                    },
                    select: {
                        stock_quantity: true,
                        store: {
                            select: {
                                admins: {
                                    select: {
                                        phone: true,
                                    },
                                },
                                address: true,
                                city: true,
                                is_active: true,
                                latitude: true,
                                longitude: true,
                                name: true,
                                province: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // if lat n long exist, check nearest store
    if (lat && long) {
        const userLat = parseFloat(lat);
        const userLong = parseFloat(long);
        result = result.map((prd) => {
            const nearestStock = prd.stocks
                .map((s) => ({
                ...s,
                distance: (0, nearestStoreHaversine_1.getDistance)(userLat, userLong, s.store.latitude, s.store.longitude),
            }))
                .sort((a, b) => a.distance - b.distance)[0];
            return {
                ...prd,
                stocks: nearestStock ? [nearestStock] : [],
            };
        });
    }
    const formattedResult = result.map((p) => ({
        ...p,
        price: p.price.toString(),
    }));
    // console.log(result);
    console.log(result);
    ApiResponse_1.ApiResponse.success(res, result, "Get Product by Province Success", 200);
});
ProductController.getAllProductByStoreId = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const storeId = Number(req.params.id);
    if (isNaN(storeId)) {
        return ApiResponse_1.ApiResponse.error(res, "Invalid Store ID", 400);
    }
    const result = await ProductService_1.default.getAllProductByStoreId(storeId);
    ApiResponse_1.ApiResponse.success(res, result, "Get Product by Store Id Success", 200);
});
ProductController.updateProductById = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const productId = Number(req.params.id);
    const { name, description, price, category } = req.body;
    const files = req.files;
    if (!name || !description || !price || !category)
        return ApiResponse_1.ApiResponse.error(res, "Semua field wajib diisi", 400);
    const updatedProduct = await ProductService_1.default.updateProductById(productId, { name, description, price, category }, files);
    ApiResponse_1.ApiResponse.success(res, updatedProduct, "Update Product Success", 200);
});
ProductController.getProductbyCategories = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await CategoryService_1.default.getProductByCategory();
    ApiResponse_1.ApiResponse.success(res, result, "Get Categories Success", 200);
});
ProductController.deleteCategory = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const categoryName = req.body.cleanData;
    if (!categoryName) {
        return ApiResponse_1.ApiResponse.error(res, "Category Name is required", 400);
    }
    const result = await CategoryService_1.default.deleteCategory(categoryName);
    ApiResponse_1.ApiResponse.success(res, result, "Category Successfully Deleted", 200);
});
ProductController.editCategory = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { newCat, oldCat } = req.body.data;
    if (!newCat || !oldCat) {
        return ApiResponse_1.ApiResponse.error(res, "Both old and new category names are required", 400);
    }
    const updatedCategory = await CategoryService_1.default.editCategory(oldCat, newCat);
    ApiResponse_1.ApiResponse.success(res, updatedCategory, "Update Category Success", 200);
});
ProductController.changeProductStatus = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const productId = Number(req.params.id);
    const status = req.body.is_active.newStatus;
    if (typeof status !== "boolean") {
        return ApiResponse_1.ApiResponse.error(res, "Invalid status value", 400);
    }
    const result = await ProductService_1.default.changeProductStatus(productId, status);
    ApiResponse_1.ApiResponse.success(res, result, "Update Status Success", 200);
});
ProductController.createProductCategory = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const newCategory = req.body.newCat;
    if (!newCategory)
        return ApiResponse_1.ApiResponse.error(res, "Input new category is required");
    const createCategory = await prisma_1.default.productCategory.create({
        data: {
            category: newCategory,
        },
    });
    ApiResponse_1.ApiResponse.success(res, createCategory, "Create new category success!", 200);
});
ProductController.createNewProduct = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, price, category } = req.body;
    const files = req.files;
    if (!name || !description || !price || !category)
        return ApiResponse_1.ApiResponse.error(res, "Semua field wajib diisi", 400);
    // make sure ada file gambarnya
    if (!req.files || !(req.files instanceof Array))
        return ApiResponse_1.ApiResponse.error(res, "Gambar tidak ada", 400);
    const newProduct = await ProductService_1.default.createNewProduct({ name, description, price, category }, files);
    ApiResponse_1.ApiResponse.success(res, newProduct, "Create New Product Success", 200);
});
ProductController.softDeleteProduct = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const ids = req.body.data;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return ApiResponse_1.ApiResponse.error(res, "Product IDs are required", 400);
    }
    const result = await ProductService_1.default.softDeleteProducts(ids);
    ApiResponse_1.ApiResponse.success(res, result, "Soft Delete Success", 200);
});
exports.default = ProductController;
//# sourceMappingURL=ProductController.js.map