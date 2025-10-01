import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import AdminOrderController from "../controllers/AdminOrderController";
import { authorizeRoles } from "../middlewares/AuthorizeRoles";

class AdminOrderRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware(), authorizeRoles("SUPER_ADMIN", "STORE_ADMIN"));

    this.router.get("/", AdminOrderController.getAllAdminOrders);
    this.router.get("/summary", AdminOrderController.getOrderSummary);
    this.router.get("/:orderId", AdminOrderController.getAdminOrderDetail);
    this.router.patch("/:orderId/confirm-payment", AdminOrderController.confirmPayment);
    this.router.patch("/:orderId/reject-payment", AdminOrderController.rejectPayment);
    this.router.patch("/:orderId/send-order", AdminOrderController.sendOrder);
    this.router.patch("/:orderId/cancel", AdminOrderController.adminCancelOrder);
    this.router.patch("/:orderId/mark-refunded", AdminOrderController.markAsRefunded);
  }
}

export default new AdminOrderRoutes().router;