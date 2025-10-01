import prisma from "../config/prisma";

class CategoryService {
  public static getProductByCategory = async () => {
    // 1. Ambil semua kategori aktif
    const categories = await prisma.productCategory.findMany({
      where: { is_deleted: false },
      orderBy: { category: "asc" },
    });

    // 2. Ambil semua produk aktif
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      include: {
        category: true,
        images: { take: 1 }, // Ambil 1 gambar untuk thumbnail
      },
    });

    // 3. Gabungkan data
    return categories.map((cat) => {
      const matchedProducts = products.filter(
        (product) => product.category?.category === cat.category
      );
      return {
        category: cat.category,
        products: matchedProducts,
      };
    });
  }; // dibagian landing
  public static deleteCategory = async (categoryName: string) => {
    if (categoryName.toLowerCase() === "others") {
      throw new Error("Kategori 'others' tidak dapat dihapus.");
    }

    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        category: { equals: categoryName, mode: "insensitive" },
        is_deleted: false,
      },
    });

    if (!existingCategory) {
      throw new Error("Kategori tidak ditemukan.");
    }

    // Cari atau buat kategori fallback "others"
    let fallbackCategory = await prisma.productCategory.findFirst({
      where: { category: "others" },
    });
    if (!fallbackCategory) {
      fallbackCategory = await prisma.productCategory.create({
        data: { category: "others" },
      });
    }

    // Gunakan transaksi untuk memastikan kedua operasi berhasil
    return await prisma.$transaction([
      // 1. Update produk ke kategori "others"
      prisma.product.updateMany({
        where: { category_id: existingCategory.id },
        data: { category_id: fallbackCategory.id },
      }),
      // 2. Soft delete kategori asli
      prisma.productCategory.update({
        where: { id: existingCategory.id },
        data: { is_deleted: true },
      }),
    ]);
  }; //soft delete category

  public static editCategory = async (oldCat: string, newCat: string) => {
    const sanitizedOldCat = oldCat.trim();
    const sanitizedNewCat = newCat.trim();

    if (sanitizedNewCat.toLowerCase() === sanitizedOldCat.toLowerCase()) {
      throw new Error("Nama kategori baru tidak boleh sama dengan nama lama.");
    }

    // Cek apakah nama kategori baru sudah ada
    const newCatExists = await prisma.productCategory.findFirst({
      where: {
        category: { equals: sanitizedNewCat, mode: "insensitive" },
        is_deleted: false,
      },
    });
    if (newCatExists) {
      throw new Error("Nama kategori baru sudah digunakan.");
    }

    // Cari kategori lama berdasarkan namanya
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        category: { equals: sanitizedOldCat, mode: "insensitive" },
        is_deleted: false,
      },
    });
    if (!existingCategory) {
      throw new Error("Kategori yang ingin diubah tidak ditemukan.");
    }

    // Update nama kategori berdasarkan ID
    return await prisma.productCategory.update({
      where: { id: existingCategory.id },
      data: { category: sanitizedNewCat },
    });
  };
}

export default CategoryService;
