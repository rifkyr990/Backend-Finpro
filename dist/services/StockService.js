"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
class StockService {
}
_a = StockService;
StockService.getAllProductStocks = async () => {
    return await prisma_1.default.productStocks.findMany({
        select: {
            id: true,
            stock_quantity: true,
            min_stock: true,
            updated_at: true,
            created_at: true,
            store: { select: { id: true, name: true } },
            product: { select: { id: true, name: true, is_active: true } },
        },
    });
};
StockService.changeProductStock = async (storeId, data) => {
    const { user_id, product_id, type, updated_stock, prev_qty, min_stock, reason, } = data;
    return await prisma_1.default.$transaction(async (tx) => {
        const updatedStockRecord = await tx.productStocks.update({
            where: {
                store_id_product_id: { store_id: storeId, product_id: product_id },
            },
            data: {
                stock_quantity: updated_stock,
                min_stock: min_stock,
            },
        });
        const user = await tx.user.findUnique({
            where: { id: user_id },
            select: { first_name: true, last_name: true },
        });
        const userName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
        const stockHistoryRecord = await tx.stockHistory.create({
            data: {
                type,
                quantity: Math.abs(updated_stock - prev_qty),
                prev_stock: prev_qty,
                updated_stock: updated_stock,
                min_stock,
                reason,
                productStockId: updatedStockRecord.id,
                user_id: user_id,
                created_by_name: userName,
            },
        });
        return { updatedStockRecord, stockHistoryRecord };
    });
};
StockService.getAllStockHistory = async () => {
    return await prisma_1.default.stockHistory.findMany({
        select: {
            type: true,
            quantity: true,
            prev_stock: true,
            updated_stock: true,
            min_stock: true,
            reason: true,
            created_at: true,
            created_by: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            productStock: {
                select: {
                    store: {
                        select: {
                            name: true,
                        },
                    },
                    product: {
                        select: { name: true },
                    },
                },
            },
        },
    });
};
StockService.getStockHistoryWithSummary = async (query) => {
    const { storeId, month, year } = query;
    // Filter berdasarkan bulan dan tahun
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    const whereClause = {
        created_at: { gte: startDate, lte: endDate },
    };
    // Filter berdasarkan toko jika ada
    if (storeId && storeId !== "all") {
        whereClause.productStock = { store_id: Number(storeId) };
    }
    const stockHistory = await prisma_1.default.stockHistory.findMany({
        where: whereClause,
        select: {
            type: true,
            quantity: true,
            prev_stock: true,
            updated_stock: true,
            min_stock: true,
            reason: true,
            created_at: true,
            created_by_name: true,
            productStock: {
                select: {
                    store: { select: { name: true } },
                    product: { select: { name: true } },
                },
            },
        },
        orderBy: { created_at: "desc" },
    });
    const totalAddition = stockHistory
        .filter((s) => s.type === "IN")
        .reduce((acc, s) => acc + s.quantity, 0);
    const totalReduction = stockHistory
        .filter((s) => s.type === "OUT")
        .reduce((acc, s) => acc + s.quantity, 0);
    const outOfStockItems = new Set();
    stockHistory.forEach((s) => {
        if (s.updated_stock <= s.min_stock) {
            outOfStockItems.add(s.productStock.product.name);
        }
    });
    const summary = {
        totalAddition,
        totalReduction,
        totalOutOfStock: outOfStockItems.size,
    };
    return { stockHistory, summary };
};
exports.default = StockService;
//# sourceMappingURL=StockService.js.map