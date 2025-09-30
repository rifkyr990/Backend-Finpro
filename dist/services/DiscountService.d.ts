declare class DiscountService {
    static getAllDiscount: () => Promise<{
        name: string;
        id: number;
        store_id: number | null;
        store: {
            name: string;
            id: number;
        } | null;
        product_id: number | null;
        product: {
            name: string;
        } | null;
        description: string | null;
        type: import(".prisma/client").$Enums.DiscountType;
        code: string;
        minPurch: import("@prisma/client/runtime/library").Decimal | null;
        minQty: number | null;
        freeQty: number | null;
        discAmount: import("@prisma/client/runtime/library").Decimal | null;
        start_date: Date;
        end_date: Date;
        creator: {
            first_name: string;
            last_name: string;
        };
        usage: {
            user_id: string | null;
        }[];
    }[]>;
    static softDeleteDiscount: (discount_id: number) => Promise<{
        name: string;
        id: number;
        store_id: number | null;
        is_deleted: boolean;
        product_id: number | null;
        description: string | null;
        type: import(".prisma/client").$Enums.DiscountType;
        code: string;
        minPurch: import("@prisma/client/runtime/library").Decimal | null;
        minQty: number | null;
        freeQty: number | null;
        discAmount: import("@prisma/client/runtime/library").Decimal | null;
        valueType: import(".prisma/client").$Enums.ValueType | null;
        start_date: Date;
        end_date: Date;
        createdAt: Date;
        createdBy: string;
    }>;
    static createDiscount: (data: any) => Promise<{
        name: string;
        id: number;
        store_id: number | null;
        is_deleted: boolean;
        product_id: number | null;
        description: string | null;
        type: import(".prisma/client").$Enums.DiscountType;
        code: string;
        minPurch: import("@prisma/client/runtime/library").Decimal | null;
        minQty: number | null;
        freeQty: number | null;
        discAmount: import("@prisma/client/runtime/library").Decimal | null;
        valueType: import(".prisma/client").$Enums.ValueType | null;
        start_date: Date;
        end_date: Date;
        createdAt: Date;
        createdBy: string;
    }>;
}
export default DiscountService;
//# sourceMappingURL=DiscountService.d.ts.map