"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const UserAddressRoutes_1 = __importDefault(require("./routes/UserAddressRoutes"));
const RajaOngkirRoutes_1 = __importDefault(require("./routes/RajaOngkirRoutes"));
const ApiResponse_1 = require("./utils/ApiResponse");
const CartRoutes_1 = __importDefault(require("./routes/CartRoutes"));
const OrderRoutes_1 = __importDefault(require("./routes/OrderRoutes"));
const AdminOrderRoutes_1 = __importDefault(require("./routes/AdminOrderRoutes"));
const ShippingRoutes_1 = __importDefault(require("./routes/ShippingRoutes"));
const StoreRoutes_1 = __importDefault(require("./routes/StoreRoutes"));
const ProductRoutes_1 = __importDefault(require("./routes/ProductRoutes"));
const StockRoutes_1 = __importDefault(require("./routes/StockRoutes"));
const DiscountRoutes_1 = __importDefault(require("./routes/DiscountRoutes"));
const PaymentRoutes_1 = __importDefault(require("./routes/PaymentRoutes"));
const ReportRoutes_1 = __importDefault(require("./routes/ReportRoutes"));
dotenv_1.default.config();
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandler();
    }
    initializeMiddlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    initializeRoutes() {
        this.app.use("/api/auth", AuthRoutes_1.default);
        this.app.use("/api/user", UserRoutes_1.default);
        this.app.use("/api/cart", CartRoutes_1.default);
        this.app.use("/api/store", StoreRoutes_1.default);
        this.app.use("/api/stock", StockRoutes_1.default);
        this.app.use("/api/product", ProductRoutes_1.default);
        this.app.use("/api/discount", DiscountRoutes_1.default);
        this.app.use("/api/address", UserAddressRoutes_1.default);
        this.app.use("/api/rajaongkir", RajaOngkirRoutes_1.default);
        this.app.use("/api/orders", OrderRoutes_1.default);
        this.app.use("/api/admin/orders", AdminOrderRoutes_1.default);
        this.app.use("/api/shipping", ShippingRoutes_1.default);
        this.app.use("/api/payment", PaymentRoutes_1.default);
        this.app.use("/api/report", ReportRoutes_1.default);
        this.app.get("/", (req, res) => {
            return ApiResponse_1.ApiResponse.success(res, null, "API is running 🚀");
        });
    }
    initializeErrorHandler() {
        this.app.use((err, req, res, next) => {
            console.error("Error Middleware:", err);
            return ApiResponse_1.ApiResponse.error(res, err.message || "Internal Server Error", 500);
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server running on http://localhost:${this.port}`);
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map