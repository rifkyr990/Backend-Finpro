"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
class DiscountService {
}
_a = DiscountService;
DiscountService.getAllDiscount = async () => {
    return await prisma_1.default.discount.findMany({
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
DiscountService.softDeleteDiscount = async (discount_id) => {
    return await prisma_1.default.discount.update({
        where: {
            id: discount_id,
        },
        data: { is_deleted: true },
    });
};
DiscountService.createDiscount = async (data) => {
    const { name, product_id, store_id, code, description, type, minPurch, minQty, discAmount, valueType, start_date, end_date, user_id, } = data;
    return await prisma_1.default.discount.create({
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
exports.default = DiscountService;
//# sourceMappingURL=DiscountService.js.map