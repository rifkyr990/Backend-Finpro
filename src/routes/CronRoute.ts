import { Router } from "express";
import CronController from "../controllers/CronController";

const router = Router();

router.post("/cancel-unpaid-orders", CronController.triggerCancelUnpaidOrders);

router.post("/auto-confirm-orders", CronController.triggerAutoConfirmOrders);

export default router;
