"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = generateReferralCode;
function generateReferralCode(first_name) {
    return (first_name.replace(/\s/g, "").slice(0, 4) +
        Math.random().toString(36).substring(2, 6).toUpperCase());
}
//# sourceMappingURL=genRefferalCode.js.map