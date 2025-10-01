declare class AuthService {
    register(first_name: string, last_name: string, email: string): Promise<{
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
    }>;
    verifyEmailAndSetPassword(token: string, password: string): Promise<boolean>;
    private _sendVerificationEmail;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    resendRegistVerification(email: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            store: {
                name: string;
            };
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
        };
        token: string;
    }>;
    requestPasswordReset(email: string): Promise<void>;
    resetPasswordWithToken(token: string, newPassword: string): Promise<boolean>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=AuthService.d.ts.map