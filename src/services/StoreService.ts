import prisma from "../config/prisma";
import { RegisterStoreAdmin } from "../types/user";
import { hashPassword } from "../utils/bcrypt";

class StoreService {
  public static getAllStores = async () => {
    return await prisma.store.findMany({
      where: {
        is_deleted: false,
      },
      include: {
        admins: {
          where: {
            is_deleted: false,
          },
        },
      },
    });
  };
  public static storeAdminWithoutStore = async () => {
    return await prisma.user.findMany({
      where: {
        store_id: null,
        role: "STORE_ADMIN",
        is_deleted: false,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        role: true,
        phone: true,
      },
    });
  };
  public static storeAdminWithStore = async () => {
    return await prisma.store.findMany({
      select: {
        name: true,
        id: true,
        admins: {
          where: {
            is_deleted: false,
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
            phone: true,
          },
        },
      },
    });
  };
  public static postNewAdmin = async (data: RegisterStoreAdmin) => {
    let { first_name, last_name, email, password, store_id, phone } = data;

    email = email.trim().toLowerCase();
    // checking for existing data
    const checkData = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (checkData) {
      throw new Error("There is an existing data");
    }
    const hashedPassword = await hashPassword(password);
    return await prisma.user.create({
      data: {
        first_name,
        last_name,
        password: hashedPassword,
        email,
        store_id: store_id ?? null,
        phone,
        is_verified: true,
        role: "STORE_ADMIN",
        image_url: "https://iili.io/KRwBd91.png", //default icon
      },
    });
  };

  public static softDeleteStoreById = async (storeId: number) => {
    await prisma.$transaction(async (tx) => {
      // revert admin to customer
      await tx.user.updateMany({
        where: {
          store_id: storeId,
          role: "STORE_ADMIN",
        },
        data: {
          store_id: null,
        },
      });
      // soft delete store id
      await tx.store.update({
        where: { id: storeId },
        data: {
          is_deleted: true,
        },
      });
    });
  };
}

export default StoreService;
