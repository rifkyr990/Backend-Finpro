import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

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
          creator: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
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
        user_id,
      } = req.body.data;

      const findCreator = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
        select: {
          first_name: true,
          last_name: true,
        },
      });
      const fullNameCreator = `${findCreator?.first_name} ${findCreator?.last_name}`;

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
          createdBy: user_id,
        },
      });
      ApiResponse.success(res, createDiscount, "Create Discount Success!", 200);
    } catch (error) {
      ApiResponse.error(res, "Create Discount Error", 400);
      console.log(error);
    }
  };

  public static verifyDiscount = async (req: Request, res: Response) => {
    try {
      const { code, subtotal, items } = req.body;

      if (!code || subtotal === undefined || !items) {
        return ApiResponse.error(
          res,
          "Code, subtotal, and cart items are required",
          400
        );
      }

      const discount = await prisma.discount.findFirst({
        where: {
          code: {
            equals: code,
            mode: "insensitive",
          },
          is_deleted: false,
          start_date: { lte: new Date() },
          end_date: { gte: new Date() },
        },
      });

      if (!discount) {
        return ApiResponse.error(
          res,
          "Promo code not found or has expired",
          404
        );
      }

      if (discount.type === "MIN_PURCHASE" && discount.minPurch) {
        if (new Prisma.Decimal(subtotal).lt(discount.minPurch)) {
          return ApiResponse.error(
            res,
            `Minimum purchase of Rp ${Number(discount.minPurch).toLocaleString(
              "id-ID"
            )} is required.`,
            400
          );
        }
      }

      let discountValue = 0;
      let frontendPromoType: "percentage" | "fixed" | "free_shipping" = "fixed";

      if (discount.type === "FREE_ONGKIR") {
        frontendPromoType = "free_shipping";
        discountValue = 0;
      } else if (discount.type === "B1G1") {
        frontendPromoType = "fixed";
        if (
          discount.product_id &&
          discount.minQty &&
          discount.freeQty &&
          items.length > 0
        ) {
          const product = await prisma.product.findUnique({
            where: { id: discount.product_id },
          });
          const targetItem = items.find(
            (item: any) => item.productId === discount.product_id
          );

          if (product && targetItem && targetItem.quantity >= discount.minQty) {
            const timesToApply = Math.floor(
              targetItem.quantity / discount.minQty
            );
            const freeItemsCount = timesToApply * discount.freeQty;
            discountValue = Number(product.price) * freeItemsCount;
          }
        }
      } else if (discount.discAmount) {
        if (discount.valueType === "PERCENTAGE") {
          frontendPromoType = "percentage";
          discountValue = Number(discount.discAmount);
        } else {
          discountValue = Number(discount.discAmount);
        }
      }

      const responsePayload = {
        code: discount.code,
        description: discount.description || "",
        type: frontendPromoType,
        value: discountValue,
      };

      ApiResponse.success(
        res,
        responsePayload,
        "Promo code applied successfully"
      );
    } catch (error) {
      console.log(error);
      ApiResponse.error(res, "Error verifying promo code", 500);
    }
  };
}

export default DiscountController;
