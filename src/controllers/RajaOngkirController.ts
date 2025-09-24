import { Request, Response } from "express";
import axios from "axios";

export class RajaOngkirController {
    private BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination";
    private API_KEY = process.env.RAJAONGKIR_API_KEY_COST!;

    public getProvinces = async (req: Request, res: Response) => {
        try {
            const response = await axios.get(`${this.BASE_URL}/province`, {
                headers: { key: this.API_KEY },
            });

            const results = response.data.data.map((item: any) => ({
                province_id: String(item.id),
                province: item.name,
            }));

            res.json(results);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    };

    public getCities = async (req: Request, res: Response) => {
        try {
            const { provinceId } = req.params;
            const response = await axios.get(
                `${this.BASE_URL}/city/${provinceId}`,
                { headers: { key: this.API_KEY } }
            );

            const results = response.data.data.map((item: any) => ({
                city_id: String(item.id),
                city_name: item.name,
                type: item.type,
                postal_code: item.postal_code, 
            }));

            res.json(results);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    };

    public getDistricts = async (req: Request, res: Response) => {
        try {
            const { cityId } = req.params;
            const response = await axios.get(
                `${this.BASE_URL}/district/${cityId}`,
                { headers: { key: this.API_KEY } }
            );

            const results = response.data.data.map((item: any) => ({
                district_id: String(item.id),
                district_name: item.name,
                city_id: String(item.city_id),
                zip_code: String(item.zip_code),
            }));

            res.json(results);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    };

    public getSubdistricts = async (req: Request, res: Response) => {
        try {
            const { districtsId } = req.params;
            const response = await axios.get(
                `${this.BASE_URL}/sub-district/${districtsId}`,
                { headers: { key: this.API_KEY } }
            );

            const results = response.data.data.map((item: any) => ({
                subdistrict_id: String(item.id),
                subdistrict_name: item.name,
                city_id: String(item.city_id),
                zip_code: String(item.zip_code),
            }));

            res.json(results);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    };

    public getShippingCost = async (req: Request, res: Response) => {
        try {
            const origin = process.env.ORIGIN_SUBDISTRICT_ID;
            const { destination, weight, courier } = req.body;

            if (!destination || !weight || !courier) {
                return res.status(400).json({
                    message: "destination, weight, and courier are required",
                });
            }

            const response = await axios.post(
                "https://rajaongkir.komerce.id/api/v1/cost",
                {
                    origin,
                    destination,
                    weight,
                    courier,
                },
                {
                    headers: {
                        key: this.API_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );

            const results = response.data.data;
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new RajaOngkirController();