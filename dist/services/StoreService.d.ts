declare class StoreService {
    static getAllStores(): Promise<({
        admins: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            phone: string | null;
            password: string | null;
            role: import(".prisma/client").$Enums.Role;
            is_verified: boolean;
            image_url: string | null;
            image_id: string | null;
            store_id: number | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
        }[];
    } & {
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
    })[]>;
    static getStoreAdminsWithoutStore(): Promise<{
        id: string;
        first_name: string;
        last_name: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    static getStoreAdminsWithStore(): Promise<{
        name: string;
        id: number;
        admins: {
            id: string;
            first_name: string;
            last_name: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
    }[]>;
    static checkUserExists(email: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        is_verified: boolean;
        image_url: string | null;
        image_id: string | null;
        store_id: number | null;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
    }>;
    static createStoreAdmin(data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        store_id?: number | null;
        phone: string;
    }): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        is_verified: boolean;
        image_url: string | null;
        image_id: string | null;
        store_id: number | null;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
    }>;
    static softDeleteStore(storeId: number): Promise<{
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
    }>;
    static createStore(payload: any): Promise<{
        admins: {
            id: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
    } & {
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
    }>;
    static updateStore(storeId: number, payload: any): Promise<{
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
    }>;
    static relocateStoreAdmin(adminId: string, store_id: number | null): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        password: string | null;
        role: import(".prisma/client").$Enums.Role;
        is_verified: boolean;
        image_url: string | null;
        image_id: string | null;
        store_id: number | null;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
    }>;
}
export default StoreService;
//# sourceMappingURL=StoreService.d.ts.map