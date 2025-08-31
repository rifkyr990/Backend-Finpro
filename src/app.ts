// src/app.ts
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoutes from "./routes/AuthRoutes";
import UserRoutes from "./routes/UserRoutes";
import { ApiResponse } from "./utils/ApiResponse";

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

    private initializeRoutes() {
        this.app.use("/api/auth", AuthRoutes);
        this.app.use("/api/user", UserRoutes);
        this.app.get("/", (req, res) => {
            return ApiResponse.success(res, null, "API is running 🚀");
        });
    }

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
