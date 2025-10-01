declare class DiscountService {
    static getAllDiscount: () => Promise<{
        name: string;
        id: number;
        store_id: number;
        store: {
            name: string;
            id: number;
        };
        product_id: number;
        product: {
            name: string;
        };
        description: string;
        type: import(".prisma/client").$Enums.DiscountType;
        code: string;
        minPurch: import("@prisma/client/runtime/library").Decimal;
        minQty: number;
        freeQty: number;
        discAmount: import("@prisma/client/runtime/library").Decimal;
        start_date: Date;
        end_date: Date;
        creator: {
            first_name: string;
            last_name: string;
        };
        usage: {
            user_id: string;
        }[];
    }[]>;
    static softDeleteDiscount: (discount_id: number) => Promise<{
        name: string;
        id: number;
        store_id: number | null;
        is_deleted: boolean;
        product_id: number | null;
        description: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DiscountType;
        code: string;
        minPurch: import("@prisma/client/runtime/library").Decimal | null;
        minQty: number | null;
        freeQty: number | null;
        discAmount: import("@prisma/client/runtime/library").Decimal | null;
        valueType: import(".prisma/client").$Enums.ValueType | null;
        start_date: Date;
        end_date: Date;
        createdBy: string;
    }>;
    static createDiscount: (data: any) => Promise<{
        name: string;
        id: number;
        store_id: number | null;
        is_deleted: boolean;
        product_id: number | null;
        description: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DiscountType;
        code: string;
        minPurch: import("@prisma/client/runtime/library").Decimal | null;
        minQty: number | null;
        freeQty: number | null;
        discAmount: import("@prisma/client/runtime/library").Decimal | null;
        valueType: import(".prisma/client").$Enums.ValueType | null;
        start_date: Date;
        end_date: Date;
        createdBy: string;
    }>;
}
export default DiscountService;
//# sourceMappingURL=DiscountService.d.ts.map