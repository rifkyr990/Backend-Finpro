declare class GoogleAuthService {
    loginWithGoogle(idToken: string): Promise<{
        user: {
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
        };
        token: string;
    }>;
}
declare const _default: GoogleAuthService;
export default _default;
//# sourceMappingURL=GoogleAuthService.d.ts.map