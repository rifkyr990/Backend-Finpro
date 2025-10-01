"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// src/middlewares/upload.ts
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
function fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Format file tidak didukung"), false);
    }
    cb(null, true);
}
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 }, // max 1MB
});
//# sourceMappingURL=UploadMiddleware.js.map