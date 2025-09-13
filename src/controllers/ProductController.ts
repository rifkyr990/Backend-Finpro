import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../config/prisma";
import { getDistance } from "../utils/nearestStoreHaversine";

class ProductController {
  public static getAllProduct = async (req: Request, res: Response) => {
    try {
      const productData = await prisma.product.findMany({
        include: {
          stocks: {
            select: {
              store: true,
              stock_quantity: true,
            },
          },
          images: true,
          category: true,
        },
      });
      console.log(productData);
      // ApiResponse.success(res,res)
      ApiResponse.success(res, productData, "Get All Product Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get All Product Error", 400);
    }
  };
  public static getAllProductByLocation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { province, city, lat, long } = req.query as {
        province: string;
        city: string;
        lat: string;
        long: string;
      };

      // console.log(
      //   `province: ${province}, city: ${city}, lat:${lat}, long:${long}`
      // );
      // if city exist, check both province and city
      let result = await prisma.product.findMany({
        where: {
          stocks: {
            some: {
              store: { province, ...(city ? { city } : {}) },
            },
          },
        },
        include: {
          category: true,
          images: true,
          stocks: {
            where: {
              store: { province, ...(city ? { city } : {}) },
            },
            select: {
              stock_quantity: true,
              store: true,
            },
          },
        },
      });

      // if city not exist, check user province
      if (city && result.length === 0) {
        result = await prisma.product.findMany({
          where: {
            stocks: {
              some: {
                store: {
                  province,
                },
              },
            },
          },
          include: {
            category: true,
            images: true,
            stocks: {
              where: {
                store: { province },
              },
              select: { stock_quantity: true, store: true },
            },
          },
        });
      }
      // if lat n long exist, check nearest store
      if (lat && long) {
        const userLat = parseFloat(lat);
        const userLong = parseFloat(long);
        result = result.map((prd) => {
          const nearestStock = prd.stocks
            .map((s) => ({
              ...s,
              distance: getDistance(
                userLat,
                userLong,
                s.store.latitude!,
                s.store.longitude!
              ),
            }))
            .sort((a, b) => a.distance! - b.distance!)[0];
          return {
            ...prd,
            stocks: nearestStock ? [nearestStock] : [],
          };
        });
      }

      console.log(result);
      ApiResponse.success(res, result, "Get Product by Province Success", 200);
    } catch (error) {
      ApiResponse.error(res, "Get Product by Province Error", 400);
    }
  };
  public static getProductById = async (req: Request, res: Response) => {};
}

export default ProductController;
