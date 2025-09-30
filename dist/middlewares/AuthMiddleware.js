"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }
            next();
        }
        catch (err) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    };
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map