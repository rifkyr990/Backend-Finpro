"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = require("../utils/ApiResponse");
const StoreService_1 = __importDefault(require("../services/StoreService"));
class StoreController {
    static handleSuccess(res, data, message = "Success", code = 200) {
        ApiResponse_1.ApiResponse.success(res, data, message, code);
    }
    static handleError(res, message = "Error", code = 400, error) {
        if (error)
            console.error(error);
        ApiResponse_1.ApiResponse.error(res, message, code);
    }
}
_a = StoreController;
StoreController.getAllStores = async (req, res) => {
    try {
        const stores = await StoreService_1.default.getAllStores();
        _a.handleSuccess(res, stores, "Get All Store Data Success!");
    }
    catch (error) {
        _a.handleError(res, "Error get all stores data", 400, error);
    }
};
StoreController.getAllStoreAdmin = async (req, res) => {
    try {
        const [withoutStore, withStore] = await Promise.all([
            StoreService_1.default.getStoreAdminsWithoutStore(),
            StoreService_1.default.getStoreAdminsWithStore(),
        ]);
        _a.handleSuccess(res, { withStore, withoutStore }, "Get Store Admins Success");
    }
    catch (error) {
        _a.handleError(res, "Get All Store Admin Failed", 400, error);
    }
};
StoreController.postNewAdmin = async (req, res) => {
    try {
        let { first_name, last_name, email, password, store_id, phone } = req.body;
        email = email.trim().toLowerCase();
        const existingUser = await StoreService_1.default.checkUserExists(email);
        if (existingUser)
            return _a.handleError(res, "There is an existing data", 400);
        const data = await StoreService_1.default.createStoreAdmin({ first_name, last_name, email, password, store_id, phone });
        _a.handleSuccess(res, data, "Create New Store Admin Success");
    }
    catch (error) {
        _a.handleError(res, "Create new store admin error", 400, error);
    }
};
StoreController.softDeleteStoreById = async (req, res) => {
    try {
        const storeId = Number(req.params.id);
        await StoreService_1.default.softDeleteStore(storeId);
        _a.handleSuccess(res, null, "Delete Data Success");
    }
    catch (error) {
        _a.handleError(res, "Error delete store data by id", 400, error);
    }
};
StoreController.createStore = async (req, res) => {
    try {
        const store = await StoreService_1.default.createStore(req.body.payload);
        _a.handleSuccess(res, store, "Create Store Success!", 201);
    }
    catch (error) {
        _a.handleError(res, "Create Store Error", 400, error);
    }
};
StoreController.patchStoreById = async (req, res) => {
    try {
        const storeId = Number(req.params.id);
        const updatedStore = await StoreService_1.default.updateStore(storeId, req.body.payload);
        _a.handleSuccess(res, updatedStore, "Update Store Details Success!");
    }
    catch (error) {
        _a.handleError(res, "Update Store Error", 400, error);
    }
};
StoreController.patchStoreAdminRelocation = async (req, res) => {
    try {
        const id = req.params.id;
        const { store_id } = req.body;
        if (!id)
            return _a.handleError(res, "Admin ID is required", 400);
        const relocatedAdmin = await StoreService_1.default.relocateStoreAdmin(id, store_id);
        _a.handleSuccess(res, relocatedAdmin, "Relocate Store Admin Success");
    }
    catch (error) {
        _a.handleError(res, "Error Relocate Store Admin", 400, error);
    }
};
exports.default = StoreController;
//# sourceMappingURL=StoreController.js.map