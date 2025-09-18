import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../config/prisma";
import { connect } from "http2";
import { create } from "domain";

class StockController {
  public static getProductStocks = async (req: Request, res: Response) => {
    try {
      const productStocks = await prisma.productStocks.findMany({
        select: {
          id: true,
          stock_quantity: true,
          min_stock: true,
          updated_at: true,
          created_at: true,
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              is_active: true,
            },
          },
        },
      });
      console.log(productStocks);
      ApiResponse.success(
        res,
        productStocks,
        "Get Product Stocks Success!",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Get Product Stocks Error", 400);
    }
  };

  public static postChangeProductStock = async (
    req: Request,
    res: Response
  ) => {
    try {
      const store_id = req.params.id;
      const { product_id, type, updated_stock, prev_qty, min_stock, reason } =
        req.body;
      // console.log(`Store id : ${store_id}, Product id : ${product_id}`);

      if (
        !product_id ||
        !store_id ||
        !type ||
        updated_stock === undefined ||
        min_stock === undefined ||
        !reason
      ) {
        return ApiResponse.error(res, "Missing data", 400);
      }
      // const difference = quantity -

      const changeStock = await prisma.$transaction(async (tx) => {
        // update stok produk
        const updateStock = await tx.productStocks.update({
          where: {
            store_id_product_id: {
              store_id: Number(store_id),
              product_id: Number(product_id),
            },
          },
          data: {
            stock_quantity: updated_stock,
            min_stock: min_stock,
          },
        });
        // tentukan selisih antara prev qty dan updated stock qty
        const diff = updated_stock - prev_qty;
        // buat stock historynya
        const createStockHistory = await tx.stockHistory.create({
          data: {
            type,
            quantity: diff,
            prev_stock: prev_qty,
            updated_stock: updated_stock,
            min_stock,
            reason,
            order_id: 123456,
            productStockId: updateStock.id,
            user_id: "01c9874c-8985-40f1-8bde-b0d93aae9c1e", //dummy user sementara
          },
        });
        return { updateStock, createStockHistory };
      });
      ApiResponse.success(
        res,
        changeStock,
        "Change Product Stock Success",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Change Product Stock Error", 400);
      console.log(error);
    }
  };
  public static deleteProductStockbyId = async (
    req: Request,
    res: Response
  ) => {
    try {
    } catch (error) {
      ApiResponse.error(res, "Delete Stock Product");
    }
  };
  public static getProductStockHistory = async (
    req: Request,
    res: Response
  ) => {
    try {
      const getStockHistory = await prisma.stockHistory.findMany({
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
      // console.log(getStockHistory);
      ApiResponse.success(
        res,
        getStockHistory,
        "Get Product Stock History Success",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Get Product Stock History Error", 400);
    }
  };
}

export default StockController;
