"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
function validatePassword(password) {
    if (password.length < 8) {
        return "Password minimal 8 karakter";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password harus mengandung huruf besar";
    }
    if (!/[a-z]/.test(password)) {
        return "Password harus mengandung huruf kecil";
    }
    if (!/[0-9]/.test(password)) {
        return "Password harus mengandung angka";
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
        return "Password harus mengandung simbol";
    }
    return null; // ✅ valid
}
//# sourceMappingURL=validatePassword.js.map