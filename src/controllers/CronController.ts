import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import CronService from "../services/CronService";

class CronController {
  public static triggerCancelUnpaidOrders = asyncHandler(
    async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      console.log(
        "CRON JOB TRIGGERED: Starting cancellation of unpaid orders."
      );

      try {
        await CronService.runOrderCancellationJob();
        return ApiResponse.success(
          res,
          null,
          "Cron job executed successfully."
        );
      } catch (error: any) {
        console.error("CRON JOB FAILED:", error);
        return ApiResponse.error(res, "Cron job execution failed.", 500);
      }
    }
  );

  public static triggerAutoConfirmOrders = asyncHandler(
    async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      console.log(
        "CRON JOB TRIGGERED: Starting auto-confirmation of delivered orders."
      );
      await CronService.runOrderAutoConfirmationJob();

      return ApiResponse.success(res, null, "Auto-confirmation job executed.");
    }
  );
}

export default CronController;
