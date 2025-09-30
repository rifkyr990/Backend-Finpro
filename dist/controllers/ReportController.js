"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = require("../utils/ApiResponse");
const prisma_1 = __importDefault(require("../config/prisma"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
class ReportController {
}
_a = ReportController;
ReportController.getAllOrderData = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { month, year, storeId } = req.query;
    // ambil data bulan dan tahun dari query
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    const orderItems = await prisma_1.default.orderItem.groupBy({
        by: ["product_id"],
        where: {
            order: {
                orderStatus: {
                    status: "SHIPPED",
                },
            },
            created_at: {
                gte: startDate,
                lte: endDate,
            },
            ...(storeId && storeId !== "all"
                ? { product: { stocks: { some: { store_id: Number(storeId) } } } }
                : {}),
        },
        _sum: {
            quantity: true,
            price_at_purchase: true, // jumlahkan harga
        },
        _avg: {
            price_at_purchase: true, // rata-rata harga
        },
        _min: {
            price_at_purchase: true, // harga terendah
        },
        _max: {
            price_at_purchase: true, // harga tertinggi
        },
    });
    const productIds = orderItems.map((o) => o.product_id);
    const products = await prisma_1.default.product.findMany({
        where: {
            id: { in: productIds },
        },
        select: {
            id: true,
            name: true,
            category: { select: { category: true } },
        },
    });
    // merger
    const finalResult = orderItems.map((o) => {
        const p = products.find((p) => p.id === o.product_id);
        return {
            productId: p?.id,
            product: p?.name ?? "Unknown",
            category: p?.category?.category ?? "Uncategorized",
            quantity: o._sum.quantity ?? 0,
            totalSales: (o._sum.quantity ?? 0) * Number(o._avg.price_at_purchase ?? 0),
            avgPrice: o._avg.price_at_purchase,
            minPrice: o._min.price_at_purchase,
            maxPrice: o._max.price_at_purchase,
        };
    });
    ApiResponse_1.ApiResponse.success(res, finalResult, "Get All Order Data Success", 200);
});
ReportController.getOrderDataByStore = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { month, year, storeId } = req.query;
    if (!storeId) {
        return ApiResponse_1.ApiResponse.error(res, "storeId harus diisi", 400);
    }
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    const orderItems = await prisma_1.default.orderItem.groupBy({
        by: ["product_id"],
        where: {
            order: {
                orderStatus: {
                    status: "SHIPPED",
                },
            },
            created_at: { gte: startDate, lte: endDate },
            store_id: Number(storeId),
        },
        _sum: {
            quantity: true,
            price_at_purchase: true,
        },
        _avg: {
            price_at_purchase: true,
        },
        _min: {
            price_at_purchase: true,
        },
        _max: {
            price_at_purchase: true,
        },
    });
    const productIds = orderItems.map((o) => o.product_id);
    const products = await prisma_1.default.product.findMany({
        where: { id: { in: productIds } },
        select: {
            id: true,
            name: true,
            category: { select: { category: true } },
        },
    });
    const finalResult = orderItems.map((o) => {
        const p = products.find((p) => p.id === o.product_id);
        return {
            productId: p?.id,
            product: p?.name ?? "Unknown",
            category: p?.category?.category ?? "Uncategorized",
            quantity: o._sum.quantity ?? 0,
            totalSales: (o._sum.quantity ?? 0) * Number(o._avg.price_at_purchase ?? 0),
            avgPrice: o._avg.price_at_purchase,
            minPrice: o._min.price_at_purchase,
            maxPrice: o._max.price_at_purchase,
        };
    });
    ApiResponse_1.ApiResponse.success(res, finalResult, "Get Order Data By Store Success", 200);
});
exports.default = ReportController;
//# sourceMappingURL=ReportController.js.map