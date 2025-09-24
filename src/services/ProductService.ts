// import prisma from "../config/prisma";
// import { ApiResponse } from "../utils/ApiResponse";

// class ProductService {
//   public static createNewProduct = async (
//     productData: {
//       name: string;
//       description: string;
//       price: string;
//       category: string;
//     },
//     files: Express.Multer.File[]
//   ) => {
//     const { name, description, price, category } = productData;

//     // find category id berdasarkan nama category dari body
//     const categoryData = await prisma.productCategory.findUnique({
//       where: { category: category },
//     });

//     if (!categoryData) return {
//         throw new Error ("Category not found")
//     }

//     for (const file of req.files as Express.Multer.File[]) {
//       const uploaded = await new Promise<any>((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             {
//               folder: "product_images",
//               resource_type: "image",
//             },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           )
//           .end(file.buffer);
//       });

//       uploadedImageUrls.push(uploaded.secure_url);

//       // Debugging
//       // console.log("Name:", name);
//       // console.log("Description:", description);
//       // console.log("Price:", price);
//       // console.log("Category:", category);
//       // console.log("All Cloudinary URLs:", uploadedImageUrls);
//     }
//     // Create BE Prisma
//     const newProduct = await prisma.product.create({
//       data: {
//         name,
//         description,
//         price,
//         category: {
//           connect: { id: categoryData.id },
//         },
//         images: {
//           create: uploadedImageUrls.map((url) => ({ image_url: url })),
//         },
//       },
//     });

//     // Ambil semua store
//     const allStores = await prisma.store.findMany();

//     // Loop semua store, buat product stock qty 0
//     const createStocksPromises = allStores.map((store) =>
//       prisma.productStocks.create({
//         data: {
//           product_id: newProduct.id,
//           store_id: store.id,
//           stock_quantity: 0,
//         },
//       })
//     );

//     await Promise.all(createStocksPromises);
//   };
// }

// export default ProductService;
