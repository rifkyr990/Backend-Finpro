import { ProductQueryParams } from "../types/product-query-params";
declare class ProductService {
    static createNewProduct: (productData: {
        name: string;
        description: string;
        price: string;
        category: string;
    }, files: Express.Multer.File[]) => Promise<{
        name: string;
        id: number;
        created_at: Date;
        is_deleted: boolean;
        is_active: boolean;
        category_id: number;
        description: string | null;
        price: string;
    }>;
    static updateProductById: (productId: number, productData: {
        name: string;
        description: string;
        price: string;
        category: string;
    }, files: Express.Multer.File[]) => Promise<{
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
    }>;
    static getLandingProducts: () => Promise<({
        stocks: {
            store: {
                name: string;
                id: number;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                address: string | null;
                province: string | null;
                province_id: string | null;
                city: string | null;
                city_id: string | null;
                latitude: number | null;
                longitude: number | null;
                is_active: boolean;
                is_main_store: boolean;
            };
            stock_quantity: number;
        }[];
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
    })[]>;
    static getAllProducts: (query: ProductQueryParams) => Promise<{
        data: {
            price: string;
            stocks: {
                stock_quantity: number;
            }[];
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
            name: string;
            id: number;
            created_at: Date;
            is_deleted: boolean;
            is_active: boolean;
            category_id: number;
            description: string | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    static getProductById: (productId: number) => Promise<({
        stocks: {
            store: {
                name: string;
                id: number;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                address: string | null;
                province: string | null;
                province_id: string | null;
                city: string | null;
                city_id: string | null;
                latitude: number | null;
                longitude: number | null;
                is_active: boolean;
                is_main_store: boolean;
            };
            stock_quantity: number;
        }[];
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
    }) | null>;
    static softDeleteProducts: (productIds: number[]) => Promise<import(".prisma/client").Prisma.BatchPayload>;
    static changeProductStatus: (productId: number, status: boolean) => Promise<{
        name: string;
        id: number;
        created_at: Date;
        is_deleted: boolean;
        is_active: boolean;
        category_id: number;
        description: string | null;
        price: string;
    }>;
    static getAllProductByStoreId: (storeId: number) => Promise<{
        product: {
            name: string;
            id: number;
        };
    }[]>;
}
export default ProductService;
//# sourceMappingURL=ProductService.d.ts.map