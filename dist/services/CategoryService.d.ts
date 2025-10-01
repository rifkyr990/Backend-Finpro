declare class CategoryService {
    static getProductByCategory: () => Promise<{
        category: string;
        products: ({
            images: {
                id: number;
                image_url: string;
                created_at: Date;
                product_id: number;
            }[];
            category: {
                id: number;
                is_deleted: boolean;
                category: string;
            };
        } & {
            name: string;
            id: number;
            created_at: Date;
            is_deleted: boolean;
            is_active: boolean;
            category_id: number;
            description: string | null;
            price: string;
        })[];
    }[]>;
    static deleteCategory: (categoryName: string) => Promise<[import(".prisma/client").Prisma.BatchPayload, {
        id: number;
        is_deleted: boolean;
        category: string;
    }]>;
    static editCategory: (oldCat: string, newCat: string) => Promise<{
        id: number;
        is_deleted: boolean;
        category: string;
    }>;
}
export default CategoryService;
//# sourceMappingURL=CategoryService.d.ts.map