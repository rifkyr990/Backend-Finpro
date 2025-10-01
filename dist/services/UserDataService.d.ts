import { CustomerQueryParams } from "../types/user";
declare class UserDataService {
    static getAllUsers: () => Promise<({
        addresses: {
            name: string;
            id: number;
            phone: string;
            user_id: string;
            province: string;
            province_id: string | null;
            city: string;
            city_id: string | null;
            latitude: number | null;
            longitude: number | null;
            label: string;
            district: string;
            district_id: string | null;
            subdistrict: string | null;
            subdistrict_id: string | null;
            postal_code: string;
            street: string;
            detail: string | null;
            is_primary: boolean;
        }[];
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
        } | null;
    } & {
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
    })[]>;
    static getUserById: (user_id: string) => Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        is_verified: boolean;
        image_url: string | null;
        image_id: string | null;
        store_id: number | null;
        is_deleted: boolean;
    } | null>;
    static getAllCustomers: (query: CustomerQueryParams) => Promise<{
        data: ({
            addresses: {
                name: string;
                id: number;
                phone: string;
                user_id: string;
                province: string;
                province_id: string | null;
                city: string;
                city_id: string | null;
                latitude: number | null;
                longitude: number | null;
                label: string;
                district: string;
                district_id: string | null;
                subdistrict: string | null;
                subdistrict_id: string | null;
                postal_code: string;
                street: string;
                detail: string | null;
                is_primary: boolean;
            }[];
        } & {
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
        })[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
        };
    }>;
    static getAllStoreAdmin: () => Promise<({
        addresses: {
            name: string;
            id: number;
            phone: string;
            user_id: string;
            province: string;
            province_id: string | null;
            city: string;
            city_id: string | null;
            latitude: number | null;
            longitude: number | null;
            label: string;
            district: string;
            district_id: string | null;
            subdistrict: string | null;
            subdistrict_id: string | null;
            postal_code: string;
            street: string;
            detail: string | null;
            is_primary: boolean;
        }[];
    } & {
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
    })[]>;
    static softDeleteUserById: (userId: string) => Promise<void>;
    static AssignAdminById: (userId: string, storeId: number) => Promise<{
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
export default UserDataService;
//# sourceMappingURL=UserDataService.d.ts.map