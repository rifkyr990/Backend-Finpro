export interface RegisterStoreAdmin {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    store_id: number;
    phone: string;
}
export interface CustomerQueryParams {
    page?: string;
    limit?: string;
    search?: string;
    status?: "verified" | "unverified" | string;
}
//# sourceMappingURL=user.d.ts.map