"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const ApiResponse_1 = require("../utils/ApiResponse");
const StockService_1 = __importDefault(require("../services/StockService"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
class StockController {
}
_a = StockController;
StockController.getProductStocks = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const productStocks = await StockService_1.default.getAllProductStocks();
    ApiResponse_1.ApiResponse.success(res, productStocks, "Get Product Stocks Success!", 200);
});
StockController.postChangeProductStock = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const storeId = Number(req.params.id);
    const { product_id, updated_stock, min_stock, reason, type } = req.body;
    if (!product_id ||
        isNaN(storeId) ||
        !type ||
        updated_stock === undefined ||
        min_stock === undefined ||
        !reason) {
        return ApiResponse_1.ApiResponse.error(res, "Missing or invalid required data", 400);
    }
    const result = await StockService_1.default.changeProductStock(storeId, req.body);
    ApiResponse_1.ApiResponse.success(res, result, "Change Product Stock Success", 200);
});
StockController.getProductStockHistory = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const history = await StockService_1.default.getAllStockHistory();
    ApiResponse_1.ApiResponse.success(res, history, "Get All Stock History Success", 200);
});
//  getProductStockHistory (untuk summary)
StockController.getProductStockHistoryAllStoreSummary = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { storeId, month, year } = req.query;
    // ambil bulan & tahun dari query
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    //
    // console.log(month, year);
    const whereClause = {
        created_at: {
            gte: startDate,
            lte: endDate,
        },
    };
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
    // summary dihitung tergantung ada/tidak storeId
    const totalAddition = stockHistory
        .filter((s) => s.type === "IN")
        .reduce((acc, s) => acc + s.quantity, 0);
    const totalReduction = stockHistory
        .filter((s) => s.type === "OUT")
        .reduce((acc, s) => acc + s.quantity, 0);
    const totalLatestStock = stockHistory.length > 0
        ? stockHistory[stockHistory.length - 1].updated_stock
        : 0;
    const totalOutOfStock = stockHistory.filter((s) => s.updated_stock <= s.min_stock).length;
    const summary = {
        totalAddition,
        totalReduction,
        totalLatestStock,
        totalOutOfStock,
    };
    ApiResponse_1.ApiResponse.success(res, { stockHistory, summary }, "Get Product Stock History Success", 200);
});
StockController.getProductStockHistorySummary = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { month, year } = req.query;
    if (!month || !year) {
        return ApiResponse_1.ApiResponse.error(res, "Month and Year query parameters are required", 400);
    }
    const result = await StockService_1.default.getStockHistoryWithSummary(req.query);
    ApiResponse_1.ApiResponse.success(res, result, "Get Product Stock History and Summary Success", 200);
});
exports.default = StockController;
//# sourceMappingURL=StockController.js.map