import prisma from "../config/prisma";
import { DiscountData } from "../types/discount";

class DiscountService {
  public static getAllDiscount = async () => {
    return await prisma.discount.findMany({
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
  };

  public static softDeleteDiscount = async (discount_id: number) => {
    return await prisma.discount.update({
      where: {
        id: discount_id,
      },
      data: { is_deleted: true },
    });
  };
  public static createDiscount = async (data: any) => {
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
    } = data;

    return await prisma.discount.create({
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
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        createdBy: user_id,
      },
    });
  };
}

export default DiscountService;
