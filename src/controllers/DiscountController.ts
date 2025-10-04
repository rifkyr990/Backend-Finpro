import prisma from "../config/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import DiscountService from "../services/DiscountService";
import { asyncHandler } from "../utils/AsyncHandler";

class DiscountController {
  public static getAllDiscount = asyncHandler(
    async (req: Request, res: Response) => {
      const data = await DiscountService.getAllDiscount();
      ApiResponse.success(res, data, "Get All Discount Success");
    }
  );

  // soft-delete discount
  public static softDeleteDiscount = asyncHandler(
    async (req: Request, res: Response) => {
      const discount_id = Number(req.params.id);
      const softDeleteDiscount = await DiscountService.softDeleteDiscount(
        discount_id
      );
      ApiResponse.success(
        res,
        softDeleteDiscount,
        "Soft Delete Discount Success",
        200
      );
    }
  );
  public static createDiscount = asyncHandler(
    async (req: Request, res: Response) => {
      const discountData = req.body.data;

      if (!discountData) {
        return ApiResponse.error(res, "Required all fields", 400);
      }
      const createDiscount = await DiscountService.createDiscount(discountData);
      ApiResponse.success(res, createDiscount, "Create Discount Success!", 200);
    }
  );

  public static verifyDiscount = asyncHandler(
    async (req: Request, res: Response) => {
      const { code, subtotal, items, storeId } = req.body;

      if (!code || subtotal === undefined || !items || !storeId) {
        return ApiResponse.error(
          res,
          "Code, subtotal, items, and storeId are required",
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
          OR: [{ store_id: null }, { store_id: storeId }],
        },
      });

      if (!discount) {
        return ApiResponse.error(
          res,
          "Promo code not found or has expired",
          404
        );
      }

      // Check if product-specific discount is valid for the cart items
      if (
        (discount.type === "MANUAL" || discount.type === "B1G1") &&
        discount.product_id
      ) {
        const requiredItem = items.find(
          (item: any) => item.productId === discount.product_id
        );
        if (!requiredItem) {
          return ApiResponse.error(
            res,
            "Required product for this promo is not in your cart.",
            400
          );
        }
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
      let frontendPromoType: "percentage" | "fixed" | "free_shipping" | "b1g1" =
        "fixed";

      if (discount.type === "FREE_ONGKIR") {
        frontendPromoType = "free_shipping";
        discountValue = 0;
      } else if (discount.type === "B1G1") {
        frontendPromoType = "b1g1";
        discountValue = 0; // B1G1 is not a monetary discount, it's about quantity
      } else if (
        discount.discAmount &&
        (discount.type === "MANUAL" || discount.type === "MIN_PURCHASE")
      ) {
        if (discount.valueType === "PERCENTAGE") {
          frontendPromoType = "percentage";
          discountValue = Number(discount.discAmount);
        } else {
          frontendPromoType = "fixed";
          discountValue = Number(discount.discAmount);
        }
      }

      const responsePayload = {
        code: discount.code,
        description: discount.description || "",
        type: frontendPromoType,
        value: discountValue,
        productId: discount.product_id,
      };

      ApiResponse.success(
        res,
        responsePayload,
        "Promo code applied successfully"
      );
    }
  );
}

export default DiscountController;
