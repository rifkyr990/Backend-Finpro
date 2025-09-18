// src/app.ts
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoutes from "./routes/AuthRoutes";
import UserRoutes from "./routes/UserRoutes";
import UserAddressRoutes from "./routes/UserAddressRoutes";
import RajaOngkirRoutes from "./routes/RajaOngkirRoutes";
import { ApiResponse } from "./utils/ApiResponse";
import CartRoutes from "./routes/CartRoutes";
import StoreRoutes from "./routes/StoreRoutes";
import ProductRoutes from "./routes/ProductRoutes";
import StockRoutes from "./routes/StockRoutes";
<<<<<<< HEAD
import DiscountRoutes from "./routes/DiscountRoutes";
=======
>>>>>>> 1631025a79f86e1801e69c0af7548550843ca348

dotenv.config();

class App {
    private app: Application;
    private port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandler();
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

<<<<<<< HEAD
  private initializeRoutes() {
    this.app.use("/api/auth", AuthRoutes);
    this.app.use("/api/cart", CartRoutes);
    // arco-start
    this.app.use("/api/user", UserRoutes);
    this.app.use("/api/store", StoreRoutes);
    this.app.use("/api/product", ProductRoutes);
    this.app.use("/api/stock", StockRoutes);
    this.app.use("/api/discount", DiscountRoutes);
    // arco-end
    this.app.get("/", (req, res) => {
      return ApiResponse.success(res, null, "API is running 🚀");
    });
  }
=======
    private initializeRoutes() {
        this.app.use("/api/auth", AuthRoutes);
        this.app.use("/api/user", UserRoutes);
        this.app.use("/api/cart", CartRoutes);
        this.app.use("/api/user", UserRoutes);
        this.app.use("/api/store", StoreRoutes);
        this.app.use("/api/product", ProductRoutes);
        this.app.use("/api/address", UserAddressRoutes);
        this.app.use("/api/rajaongkir", RajaOngkirRoutes)
        this.app.get("/", (req, res) => {
            return ApiResponse.success(res, null, "API is running 🚀");
        });
    }
>>>>>>> 1631025a79f86e1801e69c0af7548550843ca348

    private initializeErrorHandler() {
        this.app.use(
            (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
                console.error("Error Middleware:", err);
                return ApiResponse.error(res, err.message || "Internal Server Error", 500);
            }
        );
    }

    public listen() {
        this.app.listen(this.port, () => {
        console.log(`🚀 Server running on http://localhost:${this.port}`);
        });
    }
}

export default App;
