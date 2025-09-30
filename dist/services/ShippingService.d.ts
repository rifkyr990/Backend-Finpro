declare class ShippingService {
    static getCityIdFromAddress(addressId: number): Promise<string | null>;
    static getCityIdFromStore(storeId: number): Promise<string | null>;
    static getShippingOptions(originCityId: string, destinationCityId: string): Promise<any[]>;
    private static fetchCourierOption;
    static validateDistance(addressId: number, storeId: number): Promise<{
        success: boolean;
        message?: string;
    }>;
}
export default ShippingService;
//# sourceMappingURL=ShippingService.d.ts.map