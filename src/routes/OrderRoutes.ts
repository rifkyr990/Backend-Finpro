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
    this.router.get("/all", OrderController.getAllOrderData);
    this.router.get(
      "/my-orders",
      authMiddleware(),
      OrderController.getMyOrders
    );
    this.router.get(
      "/all-for-admin",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"),
      OrderController.getAllAdminOrders
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

    this.router.get(
      "/admin/:orderId",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"),
      OrderController.getAdminOrderDetail
    );
     this.router.patch(
      "/admin/:orderId/confirm-payment",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"),
      OrderController.confirmPayment
    );
    this.router.patch(
      "/admin/:orderId/reject-payment",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"),
      OrderController.rejectPayment
    );
    this.router.patch(
      "/admin/:orderId/send-order",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"),
      OrderController.sendOrder
    );
    this.router.patch(
      "/admin/:orderId/cancel",
      authMiddleware(),
      authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"),
      OrderController.adminCancelOrder
    );
  }
}

export default new OrderRoutes().router;