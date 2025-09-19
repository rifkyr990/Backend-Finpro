import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";

class DiscountController {
  public static getAllDiscount = async (req: Request, res: Response) => {
    try {
      const data = await prisma.discount.findMany({
        where: {
          is_deleted: false,
        },
        select: {
          id: true,
          name: true,
          product_id: true,
          store_id: true,
          code: true,
          description: true,
          type: true,
          minPurch: true,
          minQty: true,
          freeQty: true,
          discAmount: true,
          start_date: true,
          end_date: true,
          product: {
            select: {
              name: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          usage: {
            where: {
              status: "APPLIED",
            },
            select: {
              user_id: true,
            },
          },
        },
      });
      ApiResponse.success(res, data, "Get All Discount Success");
    } catch (error) {
      ApiResponse.error(res, "Get All Discount Error", 400);
    }
  }; //arco
  // soft-delete discount
  public static softDeleteDiscount = async (req: Request, res: Response) => {
    try {
      const discount_id = Number(req.params.id);
      const softDeleteDiscount = await prisma.discount.update({
        where: {
          id: discount_id,
        },
        data: { is_deleted: true },
      });
      ApiResponse.success(
        res,
        softDeleteDiscount,
        "Soft Delete Discount Success",
        200
      );
    } catch (error) {
      ApiResponse.error(res, "Soft Delete Discount Error", 400);
    }
  };
  public static createDiscount = async (req: Request, res: Response) => {
    try {
      const {
        name,
        product_id,
        store_id,
        code,
        description,
        type,
        minPurch,
        minQty,
        discAmount,
        valueType,
        start_date,
        end_date,
      } = req.body.data;

      const createDiscount = await prisma.discount.create({
        data: {
          name,
          product_id,
          store_id,
          code,
          description,
          type,
          minPurch,
          minQty,
          discAmount,
          valueType,
          start_date,
          end_date,
        },
      });
      ApiResponse.success(res, createDiscount, "Create Discount Success!", 200);
    } catch (error) {
      ApiResponse.error(res, "Create Discount Error", 400);
      console.log(error);
    }
  };
}

export default DiscountController;
