import App from "./app";
import CronService from "./services/CronService";

const PORT = Number(process.env.PORT) || 5000;

const server = new App(PORT);
server.listen();

// Cron job hanya jalan kalau di lokal / VPS
CronService.startOrderCancellationJob();
CronService.startOrderAutoConfirmationJob();
