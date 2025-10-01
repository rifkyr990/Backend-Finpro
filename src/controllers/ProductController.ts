import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { getDistance } from "../utils/nearestStoreHaversine";
import ProductService from "../services/ProductService";
import { asyncHandler } from "../utils/AsyncHandler";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import { ProductQueryParams } from "../types/product-query-params";
import CategoryService from "../services/CategoryService";

class ProductController {
  // untuk landing page
  public static getLandingProduct = asyncHandler(
    async (req: Request, res: Response) => {
      const productData = await ProductService.getLandingProducts();
      ApiResponse.success(
        res,
        productData,
        "Get All Landing Product Success",
        200
      );
    }
  );

  // untuk product list di dashboard
  public static getAllProduct = asyncHandler(
    async (req: Request, res: Response) => {
      const query = req.query as ProductQueryParams;
      const result = await ProductService.getAllProducts(query);
      ApiResponse.success(res, result, "Get All Product Success", 200);
    }
  );

  // khusus untuk product details by Id
  public static getProductById = asyncHandler(
    async (req: Request, res: Response) => {
      const product_id = Number(req.params.id);
      const result = await ProductService.getProductById(product_id);
      if (!result) {
        return ApiResponse.error(res, "Product Not Found", 404);
      }
      ApiResponse.success(res, result, "Get Product By ID Success", 200);
    }
  );

  public static getAllProductByLocation = asyncHandler(
    async (req: Request, res: Response) => {
      const { province, city, lat, long } = req.query as {
        province: string;
        city: string;
        lat: string;
        long: string;
      };

      // if city exist, check both province and city
      let result = await prisma.product.findMany({
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
        result = await prisma.product.findMany({
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
              distance: getDistance(
                userLat,
                userLong,
                s.store.latitude!,
                s.store.longitude!
              ),
            }))
            .sort((a, b) => a.distance! - b.distance!)[0];
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
      ApiResponse.success(res, result, "Get Product by Province Success", 200);
    }
  );

  public static getAllProductByStoreId = asyncHandler(
    async (req: Request, res: Response) => {
      const storeId = Number(req.params.id);
      if (isNaN(storeId)) {
        return ApiResponse.error(res, "Invalid Store ID", 400);
      }

      const result = await ProductService.getAllProductByStoreId(storeId);
      ApiResponse.success(res, result, "Get Product by Store Id Success", 200);
    }
  );
  public static updateProductById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const productId = Number(req.params.id);
      const { name, description, price, category } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!name || !description || !price || !category)
        return ApiResponse.error(res, "Semua field wajib diisi", 400);

      const updatedProduct = await ProductService.updateProductById(
        productId,
        { name, description, price, category },
        files
      );

      ApiResponse.success(res, updatedProduct, "Update Product Success", 200);
    }
  );

  public static getProductbyCategories = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await CategoryService.getProductByCategory();
      ApiResponse.success(res, result, "Get Categories Success", 200);
    }
  );
  public static deleteCategory = asyncHandler(
    async (req: Request, res: Response) => {
      const categoryName = req.body.cleanData;
      if (!categoryName) {
        return ApiResponse.error(res, "Category Name is required", 400);
      }
      const result = await CategoryService.deleteCategory(categoryName);
      ApiResponse.success(res, result, "Category Successfully Deleted", 200);
    }
  );

  public static editCategory = asyncHandler(
    async (req: Request, res: Response) => {
      const { newCat, oldCat } = req.body.data;
      if (!newCat || !oldCat) {
        return ApiResponse.error(
          res,
          "Both old and new category names are required",
          400
        );
      }

      const updatedCategory = await CategoryService.editCategory(
        oldCat,
        newCat
      );
      ApiResponse.success(res, updatedCategory, "Update Category Success", 200);
    }
  );

  public static changeProductStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const productId = Number(req.params.id);
      const status = req.body.is_active.newStatus;
      if (typeof status !== "boolean") {
        return ApiResponse.error(res, "Invalid status value", 400);
      }

      const result = await ProductService.changeProductStatus(
        productId,
        status
      );
      ApiResponse.success(res, result, "Update Status Success", 200);
    }
  );

  public static createProductCategory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const newCategory = req.body.newCat;
      if (!newCategory)
        return ApiResponse.error(res, "Input new category is required");

      const createCategory = await prisma.productCategory.create({
        data: {
          category: newCategory,
        },
      });
      ApiResponse.success(
        res,
        createCategory,
        "Create new category success!",
        200
      );
    }
  );

  public static createNewProduct = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { name, description, price, category } = req.body;
      const files = req.files as Express.Multer.File[];
      if (!name || !description || !price || !category)
        return ApiResponse.error(res, "Semua field wajib diisi", 400);

      // make sure ada file gambarnya
      if (!req.files || !(req.files instanceof Array))
        return ApiResponse.error(res, "Gambar tidak ada", 400);

      const newProduct = await ProductService.createNewProduct(
        { name, description, price, category },
        files
      );
      ApiResponse.success(res, newProduct, "Create New Product Success", 200);
    }
  );

  public static softDeleteProduct = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const ids: number[] = req.body.data;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return ApiResponse.error(res, "Product IDs are required", 400);
      }

      const result = await ProductService.softDeleteProducts(ids);
      ApiResponse.success(res, result, "Soft Delete Success", 200);
    }
  );
}

export default ProductController;
