import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { Provider } from '@prisma/client';

interface FacebookVerifyResponse {
  data: {
    is_valid: boolean;
    user_id: string;
  };
}

interface FacebookProfile {
  email?: string;
  name?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

class FacebookAuthService {
  public static async loginWithFacebook(accessToken: string, userID: string) {
    const appToken = `${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
    const verifyUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appToken}`;

    const verifyRes = await fetch(verifyUrl);
    const verifyJson = await verifyRes.json() as FacebookVerifyResponse;

    if (!verifyJson.data?.is_valid || verifyJson.data?.user_id !== userID) {
        throw new Error('Token Facebook tidak valid');
    }

    const profileUrl = `https://graph.facebook.com/${userID}?fields=id,name,email,picture&access_token=${accessToken}`;
    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json() as FacebookProfile;

    const { email, name, picture } = profile;

    if (!email) {
        throw new Error('Email tidak tersedia dari Facebook. Pastikan scope email diset.');
    }

    const [first_nameRaw, ...lastParts] = (name || 'Facebook user').split(' ');
    const first_name = first_nameRaw || 'Facebook';
    const last_name = lastParts.join(' ') || '';

    // Cek apakah sudah pernah login dengan akun Facebook ini
    const existingSocial = await prisma.socialLogin.findFirst({
        where: { provider: Provider.FACEBOOK, provider_user_id: userID },
        include: { user: true },
    });

    const safeEmail = email ?? `fb_${userID}@facebook.com`;
    let user = existingSocial?.user;

    // Jika belum pernah login dengan Facebook
    if (!user) {
      // Cek apakah ada user dengan email yang sama
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        user = existingUser;
      } else {
        // Buat user baru
        user = await prisma.user.create({
          data: {
            email: safeEmail,
            first_name,
            last_name,
            is_verified: true,
            role: 'CUSTOMER',
            image_url: picture?.data?.url || null,
          },
        });
      }

      // Simpan social login
      await prisma.socialLogin.create({
        data: {
          user_id: user.id,
          provider: Provider.FACEBOOK,
          provider_user_id: userID,
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}

export default FacebookAuthService;
