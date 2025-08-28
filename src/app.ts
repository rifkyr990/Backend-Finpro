import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import ErrorMiddleware from "./middlewares/ErrorMiddleware";
import UserRoutes from "./routes/UserRoutes";

dotenv.config();

class App {
    public app: Application;
    public port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private initializeRoutes() {
        this.app.get("/", (req, res) => {
            res.send("🚀 Server is running!");
        });
        this.app.use("/api/users", UserRoutes);
    }

    private initializeErrorHandling() {
        this.app.use(ErrorMiddleware.handle);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server running on http://localhost:${this.port}`)
        });
    }
}

export default App;