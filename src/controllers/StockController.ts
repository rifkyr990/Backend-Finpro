import { Request, Response } from "express";
import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import StockService from "../services/StockService";
import { asyncHandler } from "../utils/AsyncHandler";

class StockController {
  public static getProductStocks = asyncHandler(
    async (req: Request, res: Response) => {
      const productStocks = await StockService.getAllProductStocks();
      ApiResponse.success(
        res,
        productStocks,
        "Get Product Stocks Success!",
        200
      );
    }
  );

  public static postChangeProductStock = asyncHandler(
    async (req: Request, res: Response) => {
      const storeId = Number(req.params.id);
      const { product_id, updated_stock, min_stock, reason, type } = req.body;
      if (
        !product_id ||
        isNaN(storeId) ||
        !type ||
        updated_stock === undefined ||
        min_stock === undefined ||
        !reason
      ) {
        return ApiResponse.error(res, "Missing or invalid required data", 400);
      }

      const result = await StockService.changeProductStock(storeId, req.body);
      ApiResponse.success(res, result, "Change Product Stock Success", 200);
    }
  );

  public static getProductStockHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const history = await StockService.getAllStockHistory();
      ApiResponse.success(res, history, "Get All Stock History Success", 200);
    }
  );

  //  getProductStockHistory (untuk summary)
  public static getProductStockHistoryAllStoreSummary = asyncHandler(
    async (req: Request, res: Response) => {
      const { storeId, month, year } = req.query;
      // ambil bulan & tahun dari query
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      //
      // console.log(month, year);
      const whereClause: any = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (storeId && storeId !== "all") {
        whereClause.productStock = { store_id: Number(storeId) };
      }
      const stockHistory = await prisma.stockHistory.findMany({
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

      const totalLatestStock =
        stockHistory.length > 0
          ? stockHistory[stockHistory.length - 1]!.updated_stock
          : 0;

      const totalOutOfStock = stockHistory.filter(
        (s) => s.updated_stock <= s.min_stock
      ).length;

      const summary = {
        totalAddition,
        totalReduction,
        totalLatestStock,
        totalOutOfStock,
      };

      ApiResponse.success(
        res,
        { stockHistory, summary },
        "Get Product Stock History Success",
        200
      );
    }
  );

  public static getProductStockHistorySummary = asyncHandler(
    async (req: Request, res: Response) => {
      const { month, year } = req.query;

      if (!month || !year) {
        return ApiResponse.error(
          res,
          "Month and Year query parameters are required",
          400
        );
      }

      const result = await StockService.getStockHistoryWithSummary(req.query);
      ApiResponse.success(
        res,
        result,
        "Get Product Stock History and Summary Success",
        200
      );
    }
  );
}

export default StockController;
