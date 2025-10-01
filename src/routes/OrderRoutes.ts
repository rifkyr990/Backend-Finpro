import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import OrderController from "../controllers/OrderController";
import { upload } from "../middlewares/UploadMiddleware";
import { authorizeRoles } from "../middlewares/AuthorizeRoles";

class OrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/my-orders",
      authMiddleware(),
      OrderController.getMyOrders
    );
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
    this.router.patch(
      "/:orderId/cancel",
      authMiddleware(),
      OrderController.cancelOrder
    );
    this.router.patch(
      "/:orderId/confirm-receipt",
      authMiddleware(),
      OrderController.confirmReceipt
    );
    this.router.post(
      "/:orderId/repay",
      authMiddleware(),
      OrderController.repayOrder
    );
  }
}

export default new OrderRoutes().router;
