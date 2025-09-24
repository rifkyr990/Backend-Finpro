import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import OrderController from "../controllers/OrderController";
import { upload } from "../middlewares/UploadMiddleware";

class OrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", authMiddleware(), OrderController.createOrder);
    this.router.get(
      "/:orderId",
      authMiddleware(),
      OrderController.getOrderById
    );
    this.router.post(
      "/:orderId/upload-proof",
      authMiddleware(),
      upload.single("paymentProof"),
      OrderController.uploadPaymentProof
    );
  }
}

export default new OrderRoutes().router;