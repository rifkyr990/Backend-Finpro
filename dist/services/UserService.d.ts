declare class UserService {
    updateProfilePicture(userId: string, fileBuffer: Buffer): Promise<{
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
    getProfile(userId: string): Promise<({
        profile: {
            id: number;
            user_id: string;
            bio: string | null;
            date_of_birth: Date | null;
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
    }) | null>;
    private buildProfileUpdateData;
    updateProfile(userId: string, data: any): Promise<{
        profile: {
            id: number;
            user_id: string;
            bio: string | null;
            date_of_birth: Date | null;
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
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
    verifyNewEmail(token: string): Promise<{
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
    private markTokenAsUsed;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=UserService.d.ts.map