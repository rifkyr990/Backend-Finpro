import cloudinary from "../config/cloudinary";
import prisma from "../config/prisma";

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

    const createStocksPromises = allStores.map((store:any) =>
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
}

export default ProductService;
