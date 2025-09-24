import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { getDistance } from "../utils/nearestStoreHaversine";
import ProductService from "../services/ProductService";
import { asyncHandler } from "../utils/AsyncHandler";
import { AuthRequest } from "../middlewares/AuthMiddleware";

class ProductController {
  // untuk landing page
  public static getLandingProduct = async (req: Request, res: Response) => {
    try {
      const productData = await prisma.product.findMany({
        where: {
          is_deleted: false,
          is_active: true,
        },
        include: {
          stocks: {
            select: {
              store: true,
              stock_quantity: true,
            },
          },
          images: true,
          category: true,
        },
      });
      ApiResponse.success(
        res,
        productData,
        "Get All Landing Product Success",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Get All Landing Product Error", 400);
    }
  };

  // untuk product list di dashboard
  public static getAllProduct = async (req: Request, res: Response) => {
    const whereClause: any = {
      is_deleted: false,
    };
    try {
      const productData = await prisma.product.findMany({
        where: {
          is_deleted: false,
        },
        include: {
          stocks: {
            select: {
              store: true,
              stock_quantity: true,
            },
          },
          images: true,
          category: true,
        },
      });
      const formattedProducts = productData.map((p) => ({
        ...p,
        price: p.price.toString(),
      }));
      ApiResponse.success(
        res,
        formattedProducts,
        "Get All Product Success",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Get All Product Error", 400);
    }
  };

  // khusus untuk product details by Id
  public static getProductById = async (req: Request, res: Response) => {
    try {
      const product_id = Number(req.params.id);
      const result = await prisma.product.findUnique({
        where: { id: product_id },
        include: {
          images: true,
          category: true,
          stocks: {
            select: {
              stock_quantity: true,
              store: true,
            },
          },
        },
      });
      ApiResponse.success(res, result, "Get Product By ID Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get Product By Id Error", 400);
    }
  };
  public static getAllProductByLocation = async (
    req: Request,
    res: Response
  ) => {
    try {
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
              store: { province, ...(city ? { city } : {}) },
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
      ApiResponse.success(res, result, "Get Product by Province Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get Product by Province Error", 400);
    }
  };
  public static getAllProductByStoreId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const store_id = Number(req.params.id);
      const result = await prisma.productStocks.findMany({
        where: {
          store_id: store_id,
        },
        select: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      ApiResponse.success(res, result, "Get Product by Store Id Success", 200);
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Get Products by Store Id Error");
    }
  };

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

  public static getProductbyCategories = async (
    req: Request,
    res: Response
  ) => {
    try {
      // Ambil semua kategori dari tabel productCategory
      const categories = await prisma.productCategory.findMany({
        where: {
          is_deleted: false,
        },
        orderBy: {
          category: "asc",
        },
      });

      // Ambil semua produk dengan kategori yang tidak soft-delete
      const products = await prisma.product.findMany({
        where: {
          is_active: true,
          is_deleted: false,
        },
        include: {
          category: true,
        },
      });

      // Map kategori + filter produk yang sesuai
      const result = categories.map((cat) => {
        const matchedProducts = products.filter(
          (product) => product.category?.category === cat.category
        );

        return {
          category: cat.category,
          products: matchedProducts,
        };
      });

      ApiResponse.success(res, result, "Get Categories Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get Product Category Error", 400);
    }
  };
  public static deleteCategory = async (req: Request, res: Response) => {
    try {
      const categoryName = req.body.cleanData;
      console.log(categoryName);
      if (categoryName === "others") {
        return ApiResponse.error(
          res,
          "Kategori Others tidak dapat dihapus",
          400
        );
      }
      if (!categoryName)
        return ApiResponse.error(res, "Category Name is required", 400);
      // Ambil semua kategori yang belum dihapus
      const categories = await prisma.productCategory.findMany({
        where: { is_deleted: false },
      });

      // Cari kategori yang cocok (case-insensitive)
      const existingCategory = categories.find(
        (cat) => cat.category.trim().toLowerCase() === categoryName
      );
      if (!existingCategory)
        return ApiResponse.error(res, "Category not found", 404);

      let fallbackCategory = await prisma.productCategory.findFirst({
        where: { category: "others" },
      });

      if (!fallbackCategory) {
        fallbackCategory = await prisma.productCategory.create({
          data: { category: "others" },
        });
      }

      // transaction alurnya : soft delete categorynya, lalu oper kategori produknya ke "others" category
      const result = await prisma.$transaction([
        // soft delete dulu
        prisma.productCategory.update({
          where: { id: existingCategory.id },
          data: { is_deleted: true },
        }),
        // oper sisa product ke "Others" category
        prisma.product.updateMany({
          where: { category_id: existingCategory.id },
          data: { category_id: fallbackCategory.id },
        }),
      ]);
      return ApiResponse.success(
        res,
        result,
        "Kategori berhasil soft-delete",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Delete category error", 400);
    }
  };
  public static editCategory = async (req: Request, res: Response) => {
    try {
      let { newCat, oldCat } = req.body.data;

      // Sanitize
      newCat = newCat?.trim();
      oldCat = oldCat?.trim();

      if (!newCat || !oldCat) {
        return ApiResponse.error(
          res,
          "Both old and new category names are required",
          400
        );
      }

      if (newCat.toLowerCase() === oldCat.toLowerCase()) {
        return ApiResponse.error(res, "There is an existing data", 400);
      }

      // Cari data berdasarkan oldCat
      const existingCategory = await prisma.productCategory.findFirst({
        where: {
          category: {
            equals: oldCat,
            mode: "insensitive",
          },
          is_deleted: false,
        },
      });

      if (!existingCategory || existingCategory.is_deleted) {
        return ApiResponse.error(
          res,
          "Category not found or already deleted",
          404
        );
      }

      // Optional: cek kalau newCat sudah ada → duplikat
      const newCatExists = await prisma.productCategory.findUnique({
        where: { category: newCat },
      });

      if (newCatExists) {
        return ApiResponse.error(res, "New category already exists", 400);
      }

      // Update by ID, bukan by category
      const updatedCategory = await prisma.productCategory.update({
        where: { id: existingCategory.id },
        data: { category: newCat },
      });
      ApiResponse.success(res, updatedCategory, "Update Category Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Edit Category Error", 400);
      console.log(error);
    }
  };

  public static changeProductStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const productId = Number(req.params.id);
      const status = req.body.is_active.newStatus;
      const updateStatus = await prisma.product.update({
        where: { id: productId },
        data: {
          is_active: status,
        },
      });
      ApiResponse.success(res, updateStatus, "Update Status Success", 200);
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
      const softDeletePrd = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { is_deleted: true, is_active: false },
      });
      ApiResponse.success(res, softDeletePrd, "Soft Delete Success", 200);
    }
  );
}

export default ProductController;
