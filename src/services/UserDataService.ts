import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { CustomerQueryParams } from "../types/user";

class UserDataService {
  public static getAllUsers = async () => {
    return await prisma.user.findMany({
      include: {
        addresses: true,
        store: true,
      },
    });
  };
  public static getUserById = async (user_id: string) => {
    return await prisma.user.findUnique({
      where: {
        id: user_id,
      },
      omit: {
        created_at: true,
        password: true,
        updated_at: true,
      },
    });
  };
  public static getAllCustomers = async (query: CustomerQueryParams) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = (query.search as string) || "";
    const status = query.status;
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      is_deleted: false,
      role: "CUSTOMER",
      OR: [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };

    if (status === "verified") {
      where.is_verified = true;
    } else if (status === "unverified") {
      where.is_verified = false;
    }

    const [customers, totalCustomers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { addresses: true },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCustomers / limit);

    return {
      data: customers,
      pagination: {
        total: totalCustomers,
        page,
        totalPages,
      },
    };
  };

  public static getAllStoreAdmin = async () => {
    return await prisma.user.findMany({
      where: { role: "STORE_ADMIN", store_id: null, is_deleted: false },
      include: {
        addresses: true,
      },
    });
  };

  public static softDeleteUserById = async (userId: string) => {
    const findAdmin = await prisma.user.findUnique({
      where: { id: userId!, role: "STORE_ADMIN" },
    });
    if (findAdmin) {
      await prisma.user.update({
        where: { id: userId! },
        data: { is_deleted: true, store_id: null, role: "CUSTOMER" },
      });
    } else {
      await prisma.user.update({
        where: { id: userId! },
        data: {
          is_deleted: true,
        },
      });
    }
  };

  public static AssignAdminById = async (userId: string, storeId: number) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        store_id: storeId,
        role: "STORE_ADMIN",
      },
    });
  };
}

export default UserDataService;
