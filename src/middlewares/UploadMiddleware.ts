// src/middlewares/upload.ts
import multer from "multer";

const storage = multer.memoryStorage();

function fileFilter(req: any, file: Express.Multer.File, cb: any) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Format file tidak didukung"), false);
    }
    cb(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 }, // max 1MB
});
