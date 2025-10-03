"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncHandler_1 = require("../utils/AsyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const UserService_1 = __importDefault(require("../services/UserService"));
const prisma_1 = __importDefault(require("../config/prisma"));
class UserController {
}
_a = UserController;
UserController.getAllUsers = async (req, res) => {
    try {
        const usersData = await prisma_1.default.user.findMany({
            include: {
                addresses: true,
                store: true,
            },
        });
        return ApiResponse_1.ApiResponse.success(res, usersData, "Get All Users Data Success");
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Error Get All Users Data", 400);
    }
<<<<<<< HEAD
}; // arco
=======
};
>>>>>>> origin/temporary-3
UserController.getUserById = async (req, res) => {
    try {
        const user_id = req.params.id?.toString();
        if (!user_id)
            return ApiResponse_1.ApiResponse.error(res, "Error", 400);
        const result = await prisma_1.default.user.findMany({
            where: { id: user_id },
            omit: {
                created_at: true,
                password: true,
                updated_at: true,
            },
        });
        console.log(result);
        ApiResponse_1.ApiResponse.success(res, result, "Get User By Id", 200);
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Get User By ID Error", 400);
    }
};
UserController.getAllCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const status = req.query.status;
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
            where.is_verified === true;
        }
        else if (status === "unverified") {
            where.is_verified === false;
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
        return ApiResponse_1.ApiResponse.success(res, {
            data: customers,
            pagination: { total: totalCustomers },
            page,
            totalPages,
        }, "Get All Customers Data Success");
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Error get customers data", 400);
    }
};
UserController.getAllStoreAdmin = async (req, res) => {
    try {
        const customersData = await prisma_1.default.user.findMany({
            where: { role: "STORE_ADMIN", store_id: null, is_deleted: false },
            include: {
                addresses: true,
            },
        });
        return ApiResponse_1.ApiResponse.success(res, customersData, "Get All Store Admin Data Success");
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Error get customers data", 400);
    }
};
UserController.softDeleteUserById = async (req, res) => {
    try {
        //using soft delete methods
        const userId = req.params.id;
        // cari data user id apakah ada di admin
        // kalo ada, maka update store id menjadi null, dan data usernya menjadi is_deleted true
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
        return ApiResponse_1.ApiResponse.success(res, `Soft Delete user id ${userId} success`);
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Error delete data", 400);
    }
};
//arco
UserController.assignAdminbyId = async (req, res) => {
    try {
        const userId = req.params.id;
        const store_id = req.body.store_id;
        // Validasi input
        if (!userId || isNaN(store_id)) {
            return ApiResponse_1.ApiResponse.error(res, "Invalid userId or storeId", 400);
        }
        const assignAdmin = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                store_id: store_id,
                role: "STORE_ADMIN",
            },
        });
        ApiResponse_1.ApiResponse.success(res, assignAdmin, "Assign Admin Success", 201);
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Assign Admin Failed", 400);
    }
}; // arco
UserController.revertAdminbyId = async (req, res) => {
    try {
        const id = req.params.id;
        const { store_id, role } = req.body;
        if (!id)
            return ApiResponse_1.ApiResponse.error(res, "Invalid id");
        const revertAdmin = await prisma_1.default.user.update({
            where: { id },
            data: {
                store_id: null,
                role: "CUSTOMER",
            },
        });
        ApiResponse_1.ApiResponse.success(res, req.body, "Revert Success", 200);
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Revert to Customer Error", 400);
    }
};
UserController.updateProfilePicture = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        return ApiResponse_1.ApiResponse.error(res, "Unauthorized", 401);
    if (!req.file)
        return ApiResponse_1.ApiResponse.error(res, "File tidak ditemukan", 400);
    const user = await UserService_1.default.updateProfilePicture(req.user.id, req.file.buffer);
    return ApiResponse_1.ApiResponse.success(res, user, "Profile picture berhasil diupdate");
});
UserController.getProfile = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const profile = await UserService_1.default.getProfile(userId);
    return ApiResponse_1.ApiResponse.success(res, profile, "Profile berhasil diambil");
});
UserController.updateProfile = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const updated = await UserService_1.default.updateProfile(userId, req.body);
    return ApiResponse_1.ApiResponse.success(res, updated, "Profile Berhasil diperbaharui");
});
UserController.updateUser = async (req, res) => {
    try {
        const user_id = req.params.id?.toString();
        if (!user_id)
            return ApiResponse_1.ApiResponse.error(res, "Eror", 400);
        const { first_name, last_name, email, password, phone, store_id } = req.body;
        const updateUser = await prisma_1.default.user.update({
            where: { id: user_id },
            data: {
                first_name,
                last_name,
                email,
                password,
                phone,
                store_id,
            },
        });
        ApiResponse_1.ApiResponse.success(res, updateUser, "Update User Success!", 200);
    }
    catch (error) {
        ApiResponse_1.ApiResponse.error(res, "Update User Error", 400);
        console.log(error);
    }
};
UserController.changePassword = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return ApiResponse_1.ApiResponse.error(res, "Password lama & baru wajib diisi dulu", 400);
    }
    await UserService_1.default.changePassword(userId, oldPassword, newPassword);
    return ApiResponse_1.ApiResponse.success(res, null, "Password berhasil dirubah");
});
UserController.verifyNewEmail = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    const user = await UserService_1.default.verifyNewEmail(token);
    return ApiResponse_1.ApiResponse.success(res, user, "Email baru berhasil diverifikasi");
});
exports.default = UserController;
//# sourceMappingURL=UserController.js.map