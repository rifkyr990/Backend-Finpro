import cloudinary from "../config/cloudinary";
import prisma from "../config/prisma";
import { ProductQueryParams } from "../types/product-query-params";

class ProductService {
  public static createNewProduct = async (
    productData: {
      name: string;
      description: string;
      price: string;
      category: string;
    },
    files: Express.Multer.File[]
  ) => {
    const { name, description, price, category } = productData;

    // find category id berdasarkan nama category dari body
    const categoryData = await prisma.productCategory.findUnique({
      where: { category: category },
    });

    if (!categoryData) {
      throw new Error("Category not found");
    }

    const uploadedImageUrls = await Promise.all(
      files.map(async (file) => {
        const uploaded = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "product_images",
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(file.buffer);
        });

        return uploaded.secure_url;
      })
    );

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category: {
          connect: { id: categoryData.id },
        },
        images: {
          create: uploadedImageUrls.map((url) => ({ image_url: url })),
        },
      },
    });

    const allStores = await prisma.store.findMany();

    const createStocksPromises = allStores.map((store: any) =>
      prisma.productStocks.create({
        data: {
          product_id: newProduct.id,
          store_id: store.id,
          stock_quantity: 0,
        },
      })
    );

    await Promise.all(createStocksPromises);
    return newProduct;
  };
  public static updateProductById = async (
    productId: number,
    productData: {
      name: string;
      description: string;
      price: string;
      category: string;
    },
    files: Express.Multer.File[]
  ) => {
    const { name, description, price, category } = productData;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, category: true },
    });
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Cari category ID
    const categoryData = await prisma.productCategory.findUnique({
      where: { category },
    });
    if (!categoryData) {
      throw new Error("Category not found");
    }

    let uploadedImageUrls: string[] = [];

    // Jika ada file baru, upload ke Cloudinary
    if (files && files.length > 0) {
      uploadedImageUrls = await Promise.all(
        files.map(async (file) => {
          const uploaded = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "product_images", resource_type: "image" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(file.buffer);
          });
          return uploaded.secure_url;
        })
      );
    }

    const dataToUpdate: any = {
      name,
      description,
      price: price.toString(), // jika di schema price = string
      category: { connect: { id: categoryData.id } },
    };
    if (uploadedImageUrls.length > 0) {
      dataToUpdate.images = {
        deleteMany: {},
        create: uploadedImageUrls.map((url) => ({ image_url: url })),
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
      include: { images: true, category: true },
    });
    return updatedProduct;
  };

  public static getLandingProducts = async () => {
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
    return productData;
  };
  public static getAllProducts = async (query: ProductQueryParams) => {
    const { page = "1", limit = "10", search = "", category, sort } = query;
    const currentPage = Math.max(parseInt(page, 10), 1);
    const perPage = Math.max(parseInt(limit, 10), 1);
    const skip = (currentPage - 1) * perPage;

    const whereClause: any = { is_deleted: false };
    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }
    if (category && category !== "all") {
      whereClause.category = { category: { equals: category } };
    }

    let orderBy: any = { created_at: "desc" };

    switch (sort) {
      case "highest-price":
        orderBy = { price: "desc" };
        break;
      case "lowest-price":
        orderBy = { price: "asc" };
        break;
      case "active-product":
        whereClause.is_active = true;
        break;
      case "inactive-product":
        whereClause.is_active = false;
        break;
    }

    const [totalProducts, products] = await prisma.$transaction([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          stocks: { select: { stock_quantity: true } },
          images: { take: 1 },
          category: true,
        },
        orderBy,
        skip,
        take: perPage,
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      price: p.price.toString(),
    }));

    return {
      data: formattedProducts,
      total: totalProducts,
      page: currentPage,
      totalPages: Math.ceil(totalProducts / perPage),
    };
  };
  public static getProductById = async (productId: number) => {
    return await prisma.product.findUnique({
      where: { id: productId },
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
  };
  public static softDeleteProducts = async (productIds: number[]) => {
    return await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { is_deleted: true, is_active: false },
    });
  };
  public static changeProductStatus = async (
    productId: number,
    status: boolean
  ) => {
    return await prisma.product.update({
      where: { id: productId },
      data: { is_active: status },
    });
  };
  public static getAllProductByStoreId = async (storeId: number) => {
    return await prisma.productStocks.findMany({
      where: {
        store_id: storeId,
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
  };
}

export default ProductService;
