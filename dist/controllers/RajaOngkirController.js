"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncHandler_1 = require("../utils/AsyncHandler");
const RajaOngkirService_1 = __importDefault(require("../services/RajaOngkirService"));
class RajaOngkirController {
    constructor() {
        this.getProvinces = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
            const data = await RajaOngkirService_1.default.getProvinces();
            return res.json(data);
        });
        this.getCities = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
            const { provinceId } = req.params;
            if (!provinceId) {
                return res.status(400).json({ message: "provinceId is required" });
            }
            const data = await RajaOngkirService_1.default.getCities(provinceId);
            return res.json(data);
        });
        this.getDistricts = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
            const { cityId } = req.params;
            if (!cityId) {
                return res.status(400).json({ message: "provinceId is required" });
            }
            const data = await RajaOngkirService_1.default.getDistricts(cityId);
            return res.json(data);
        });
        this.getSubdistricts = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
            const { districtsId } = req.params;
            if (!districtsId) {
                return res.status(400).json({ message: "provinceId is required" });
            }
            const data = await RajaOngkirService_1.default.getSubdistricts(districtsId);
            return res.json(data);
        });
        this.getShippingCost = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
            const { destination, weight, courier } = req.body;
            if (!destination || !weight || !courier) {
                return res.status(400).json({ message: "destination, weight, and courier are required" });
            }
            const data = await RajaOngkirService_1.default.getShippingCost(destination, weight, courier);
            return res.json(data);
        });
    }
}
exports.default = new RajaOngkirController();
//# sourceMappingURL=RajaOngkirController.js.map