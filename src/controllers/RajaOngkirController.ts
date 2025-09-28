import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import RajaOngkirService from "../services/RajaOngkirService";

class RajaOngkirController {
  public getProvinces = asyncHandler(async (req: Request, res: Response) => {
    const data = await RajaOngkirService.getProvinces();
    return res.json(data);
  });

  public getCities = asyncHandler(async (req: Request, res: Response) => {
    const { provinceId } = req.params;

    if (!provinceId) {
      return res.status(400).json({ message: "provinceId is required" });
    }

    const data = await RajaOngkirService.getCities(provinceId);
    return res.json(data);
  });


  public getDistricts = asyncHandler(async (req: Request, res: Response) => {
    const { cityId } = req.params;

    if (!cityId) {
      return res.status(400).json({ message: "provinceId is required" });
    }

    const data = await RajaOngkirService.getDistricts(cityId);
    return res.json(data);
  });

  public getSubdistricts = asyncHandler(async (req: Request, res: Response) => {
    const { districtsId } = req.params;

    if (!districtsId) {
      return res.status(400).json({ message: "provinceId is required" });
    }

    const data = await RajaOngkirService.getSubdistricts(districtsId);
    return res.json(data);
  });

  public getShippingCost = asyncHandler(async (req: Request, res: Response) => {
    const { destination, weight, courier } = req.body;

    if (!destination || !weight || !courier) {
      return res.status(400).json({ message: "destination, weight, and courier are required" });
    }

    const data = await RajaOngkirService.getShippingCost(destination, weight, courier);
    return res.json(data);
  });
}

export default new RajaOngkirController();
