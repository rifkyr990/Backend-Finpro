declare class RajaOngkirService {
    static getProvinces(): Promise<any>;
    static getCities(provinceId: string): Promise<any>;
    static getDistricts(cityId: string): Promise<any>;
    static getSubdistricts(districtId: string): Promise<any>;
    static getShippingCost(destination: string, weight: number, courier: string): Promise<any>;
}
export default RajaOngkirService;
//# sourceMappingURL=RajaOngkirService.d.ts.map