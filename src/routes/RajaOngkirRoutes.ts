import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import RajaOngkirController from "../controllers/RajaOngkirController";

class RajaOngkirRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/provinces",RajaOngkirController.getProvinces);
        this.router.get("/cities/:provinceId",RajaOngkirController.getCities);
        this.router.get("/districts/:cityId",RajaOngkirController.getDistricts);
        this.router.get("/subdistricts/:districtsId",RajaOngkirController.getSubdistricts);
    }
}

export default new RajaOngkirRoutes().router;
