"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
class UserDataService {
}
_a = UserDataService;
UserDataService.getAllUsers = async () => {
    return await prisma_1.default.user.findMany({
        include: {
            addresses: true,
            store: true,
        },
    });
};
UserDataService.getUserById = async (user_id) => {
    return await prisma_1.default.user.findUnique({
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
UserDataService.getAllCustomers = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || "";
    const status = query.status;
    const skip = (page - 1) * limit;
    const where = {
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
    }
    else if (status === "unverified") {
        where.is_verified = false;
    }
    const [customers, totalCustomers] = await prisma_1.default.$transaction([
        prisma_1.default.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { created_at: "desc" },
            include: { addresses: true },
        }),
        prisma_1.default.user.count({ where }),
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
UserDataService.getAllStoreAdmin = async () => {
    return await prisma_1.default.user.findMany({
        where: { role: "STORE_ADMIN", store_id: null, is_deleted: false },
        include: {
            addresses: true,
        },
    });
};
UserDataService.softDeleteUserById = async (userId) => {
    const findAdmin = await prisma_1.default.user.findUnique({
        where: { id: userId, role: "STORE_ADMIN" },
    });
    if (findAdmin) {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { is_deleted: true, store_id: null, role: "CUSTOMER" },
        });
    }
    else {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                is_deleted: true,
            },
        });
    }
};
UserDataService.AssignAdminById = async (userId, storeId) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            store_id: storeId,
            role: "STORE_ADMIN",
        },
    });
};
exports.default = UserDataService;
//# sourceMappingURL=UserDataService.js.map