"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const CronService_1 = __importDefault(require("./services/CronService"));
const PORT = Number(process.env.PORT) || 5000;
const server = new app_1.default(PORT);
server.listen();
CronService_1.default.startOrderCancellationJob();
CronService_1.default.startOrderAutoConfirmationJob();
//# sourceMappingURL=server.js.map