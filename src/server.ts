import App from "./app";
import CronService from "./services/CronService";

const PORT = Number(process.env.PORT) || 5000;

const server = new App(PORT);
server.listen();

CronService.startOrderCancellationJob();