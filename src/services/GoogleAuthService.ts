import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { Provider } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleAuthService {
    public async loginWithGoogle(idToken: string) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || "",
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("Google token tidak valid");
        }

        const { email, given_name, family_name, sub, picture } = payload;
        
        const existingSocialLogin = await prisma.socialLogin.findFirst({
            where: {
                provider: Provider.GOOGLE,
                provider_user_id: sub,
            },
            include: {
                user: true,
            },
        });

        if (existingSocialLogin) {
            const token = jwt.sign({
                id: existingSocialLogin.user.id, email, role: existingSocialLogin.user.role
            }, process.env.JWT_SECRET!);

            return { user: existingSocialLogin.user, token };
        }

        const existingUser = await prisma.user.findUnique({ where: { email }});
        let user;

        if (existingUser) {
            await prisma.socialLogin.create({
                data: {
                    user_id: existingUser.id,
                    provider: Provider.GOOGLE,
                    provider_user_id: sub
                }
            });
            user = existingUser;
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    first_name: given_name || "Google",
                    last_name: family_name || "User",
                    image_url: picture || null,
                    is_verified: true,
                    role: "CUSTOMER",
                },
            });

            await prisma.socialLogin.create({
                data: {
                    user_id: user.id,
                    provider: Provider.GOOGLE,
                    provider_user_id: sub,
                },
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return { user, token };
    }
}

export default new GoogleAuthService();