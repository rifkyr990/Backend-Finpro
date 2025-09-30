"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorMiddleware {
    static handle(err, req, res, next) {
        console.error(err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
}
exports.default = ErrorMiddleware;
//# sourceMappingURL=ErrorMiddleware.js.map