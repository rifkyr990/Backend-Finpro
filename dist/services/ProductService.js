"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma_1 = __importDefault(require("../config/prisma"));
class ProductService {
}
_a = ProductService;
ProductService.createNewProduct = async (productData, files) => {
    const { name, description, price, category } = productData;
    // find category id berdasarkan nama category dari body
    const categoryData = await prisma_1.default.productCategory.findUnique({
        where: { category: category },
    });
    if (!categoryData) {
        throw new Error("Category not found");
    }
    const uploadedImageUrls = await Promise.all(files.map(async (file) => {
        const uploaded = await new Promise((resolve, reject) => {
            cloudinary_1.default.uploader
                .upload_stream({
                folder: "product_images",
                resource_type: "image",
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            })
                .end(file.buffer);
        });
        return uploaded.secure_url;
    }));
    const newProduct = await prisma_1.default.product.create({
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
    const allStores = await prisma_1.default.store.findMany();
    const createStocksPromises = allStores.map((store) => prisma_1.default.productStocks.create({
        data: {
            product_id: newProduct.id,
            store_id: store.id,
            stock_quantity: 0,
        },
    }));
    await Promise.all(createStocksPromises);
    return newProduct;
};
ProductService.updateProductById = async (productId, productData, files) => {
    const { name, description, price, category } = productData;
    const existingProduct = await prisma_1.default.product.findUnique({
        where: { id: productId },
        include: { images: true, category: true },
    });
    if (!existingProduct) {
        throw new Error("Product not found");
    }
    // Cari category ID
    const categoryData = await prisma_1.default.productCategory.findUnique({
        where: { category },
    });
    if (!categoryData) {
        throw new Error("Category not found");
    }
    let uploadedImageUrls = [];
    // Jika ada file baru, upload ke Cloudinary
    if (files && files.length > 0) {
        uploadedImageUrls = await Promise.all(files.map(async (file) => {
            const uploaded = await new Promise((resolve, reject) => {
                cloudinary_1.default.uploader
                    .upload_stream({ folder: "product_images", resource_type: "image" }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                })
                    .end(file.buffer);
            });
            return uploaded.secure_url;
        }));
    }
    const dataToUpdate = {
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
    const updatedProduct = await prisma_1.default.product.update({
        where: { id: productId },
        data: dataToUpdate,
        include: { images: true, category: true },
    });
    return updatedProduct;
};
ProductService.getLandingProducts = async () => {
    const productData = await prisma_1.default.product.findMany({
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
ProductService.getAllProducts = async (query) => {
    const { page = "1", limit = "10", search = "", category, sort } = query;
    const currentPage = Math.max(parseInt(page, 10), 1);
    const perPage = Math.max(parseInt(limit, 10), 1);
    const skip = (currentPage - 1) * perPage;
    const whereClause = { is_deleted: false };
    if (search) {
        whereClause.name = { contains: search, mode: "insensitive" };
    }
    if (category && category !== "all") {
        whereClause.category = { category: { equals: category } };
    }
    let orderBy = { created_at: "desc" };
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
    const [totalProducts, products] = await prisma_1.default.$transaction([
        prisma_1.default.product.count({ where: whereClause }),
        prisma_1.default.product.findMany({
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
ProductService.getProductById = async (productId) => {
    return await prisma_1.default.product.findUnique({
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
ProductService.softDeleteProducts = async (productIds) => {
    return await prisma_1.default.product.updateMany({
        where: { id: { in: productIds } },
        data: { is_deleted: true, is_active: false },
    });
};
ProductService.changeProductStatus = async (productId, status) => {
    return await prisma_1.default.product.update({
        where: { id: productId },
        data: { is_active: status },
    });
};
ProductService.getAllProductByStoreId = async (storeId) => {
    return await prisma_1.default.productStocks.findMany({
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
exports.default = ProductService;
//# sourceMappingURL=ProductService.js.map