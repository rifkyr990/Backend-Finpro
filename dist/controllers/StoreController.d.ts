import { Request, Response } from "express";
declare class StoreController {
    private static handleSuccess;
    private static handleError;
    static getAllStores: (req: Request, res: Response) => Promise<void>;
    static getAllStoreAdmin: (req: Request, res: Response) => Promise<void>;
    static postNewAdmin: (req: Request, res: Response) => Promise<void>;
    static softDeleteStoreById: (req: Request, res: Response) => Promise<void>;
    static createStore: (req: Request, res: Response) => Promise<void>;
    static patchStoreById: (req: Request, res: Response) => Promise<void>;
    static patchStoreAdminRelocation: (req: Request, res: Response) => Promise<void>;
}
export default StoreController;
//# sourceMappingURL=StoreController.d.ts.map