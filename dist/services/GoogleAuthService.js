"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class GoogleAuthService {
    async loginWithGoogle(idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || "",
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("Google token tidak valid");
        }
        const { email, given_name, family_name, sub, picture } = payload;
        const existingSocialLogin = await prisma_1.default.socialLogin.findFirst({
            where: {
                provider: client_1.Provider.GOOGLE,
                provider_user_id: sub,
            },
            include: {
                user: true,
            },
        });
        if (existingSocialLogin) {
            const token = jsonwebtoken_1.default.sign({
                id: existingSocialLogin.user.id, email, role: existingSocialLogin.user.role
            }, process.env.JWT_SECRET);
            return { user: existingSocialLogin.user, token };
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        let user;
        if (existingUser) {
            await prisma_1.default.socialLogin.create({
                data: {
                    user_id: existingUser.id,
                    provider: client_1.Provider.GOOGLE,
                    provider_user_id: sub
                }
            });
            user = existingUser;
        }
        else {
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    first_name: given_name || "Google",
                    last_name: family_name || "User",
                    image_url: picture || null,
                    is_verified: true,
                    role: "CUSTOMER",
                },
            });
            await prisma_1.default.socialLogin.create({
                data: {
                    user_id: user.id,
                    provider: client_1.Provider.GOOGLE,
                    provider_user_id: sub,
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return { user, token };
    }
}
exports.default = new GoogleAuthService();
//# sourceMappingURL=GoogleAuthService.js.map