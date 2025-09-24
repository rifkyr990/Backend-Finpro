import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../config/prisma";

class ReportController {
  public static getAllOrderData = async (req: Request, res: Response) => {
    try {
      const { month, year, storeId } = req.query;
      // ambil data bulan dan tahun dari query
      console.log(req.query);
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

      const orderItems = await prisma.orderItem.groupBy({
        by: ["product_id"],
        where: {
          order: {
            orderStatus: {
              status: "PAID",
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
      const products = await prisma.product.findMany({
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
          totalSales:
            (o._sum.quantity ?? 0) * Number(o._avg.price_at_purchase ?? 0),
          avgPrice: o._avg.price_at_purchase,
          minPrice: o._min.price_at_purchase,
          maxPrice: o._max.price_at_purchase,
        };
      });

      ApiResponse.success(res, finalResult, "Get All Order Data Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get All Order Data Error", 400);
    }
  };
  public static getOrderDataByStore = async (req: Request, res: Response) => {
    try {
      const { month, year, storeId } = req.query;

      if (!storeId) {
        return ApiResponse.error(res, "storeId harus diisi", 400);
      }

      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

      const orderItems = await prisma.orderItem.groupBy({
        by: ["product_id"],
        where: {
          order: {
            orderStatus: {
              status: "PAID",
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
      const products = await prisma.product.findMany({
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
          totalSales:
            (o._sum.quantity ?? 0) * Number(o._avg.price_at_purchase ?? 0),
          avgPrice: o._avg.price_at_purchase,
          minPrice: o._min.price_at_purchase,
          maxPrice: o._max.price_at_purchase,
        };
      });

      ApiResponse.success(
        res,
        finalResult,
        "Get Order Data By Store Success",
        200
      );
    } catch (error) {
      console.error(error);
      ApiResponse.error(res, "Get Order Data By Store Error", 400);
    }
  };
}

export default ReportController;
