"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RajaOngkirController_1 = __importDefault(require("../controllers/RajaOngkirController"));
class RajaOngkirRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/provinces", RajaOngkirController_1.default.getProvinces);
        this.router.get("/cities/:provinceId", RajaOngkirController_1.default.getCities);
        this.router.get("/districts/:cityId", RajaOngkirController_1.default.getDistricts);
        this.router.get("/subdistricts/:districtsId", RajaOngkirController_1.default.getSubdistricts);
        this.router.post("/cost", RajaOngkirController_1.default.getShippingCost);
    }
}
exports.default = new RajaOngkirRoutes().router;
//# sourceMappingURL=RajaOngkirRoutes.js.map