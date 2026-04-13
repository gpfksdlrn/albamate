import type { User as CustomUser } from '@/features/auth';

declare module 'next-auth' {
  interface Session {
    user: CustomUser;
    accessToken?: string;
    refreshToken?: string;
    error?: 'RefreshAccessTokenError';
    isOAuthRegistering?: boolean;
    oauthToken?: string;
  }

  interface User {
    id: number;
    email: string;
    name: string | null;
    role: 'APPLICANT' | 'OWNER';
    location: string | null;
    phoneNumber: string | null;
    storePhoneNumber: string | null;
    storeName: string | null;
    imageUrl: string | null;
    nickname: string | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT
    extends Omit<import('next-auth').User, 'id' | 'accessTokenExpires'> {
    id: string; // User의 number 타입을 string으로 오버라이드
    accessTokenExpires: number; // User의 optional 타입을 required로 오버라이드
    error?: 'RefreshAccessTokenError';
    isOAuthRegistering?: boolean;
    oauthToken?: string;
    oauthProvider?: string;
  }
}
