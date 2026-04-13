import {
  CredentialsSignin,
  type NextAuthConfig,
  Session,
  User,
} from 'next-auth';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (
        credentials: Record<string, unknown>,
        req
      ): Promise<User | null> => {
        const {
          email,
          password,
          userType: credentialsUserType,
        } = credentials as {
          email: string;
          password: string;
          userType: string | null;
        };

        if (!email || !password) {
          return null;
        }

        // 사용자 타입 결정: credentials에서 전달받은 값 우선, 없으면 URL에서 확인
        let userType: string | null = credentialsUserType;

        // credentials에서 사용자 타입이 없으면 URL에서 확인
        if (!userType && req.url) {
          try {
            const url = new URL(req.url);
            userType = url.searchParams.get('type');
          } catch (error) {
            console.error('URL 파싱 오류:', error);
          }
        }

        // req.headers에서 referer 확인
        if (!userType && req.headers) {
          const referer = (req.headers as any).referer;
          if (referer) {
            try {
              const refererUrl = new URL(referer);
              userType = refererUrl.searchParams.get('type');
            } catch (error) {
              console.error('Referer URL 파싱 오류:', error);
            }
          }
        }

        // 로그인 처리
        try {
          // 환경 변수에서 API URL 가져오기
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL ||
            'https://fe-project-albaform.vercel.app';
          const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID || '15-3';
          const baseURL = `${API_URL}${TEAM_ID}/`;

          const response = await fetch(`${baseURL}auth/sign-in`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!response.ok) {
            console.error(
              'Auth API error:',
              response.status,
              response.statusText
            );
            return null;
          }

          const data = await response.json();

          if (userType) {
            const expectedRole = userType === 'owner' ? 'OWNER' : 'APPLICANT';

            if (data.user.role !== expectedRole) {
              console.error('사용자 타입 불일치:', {
                expected: expectedRole,
                actual: data.user.role,
                userType,
              });
              // NextAuth v5 커스텀 에러로 던져야 error 코드가 querystring에 노출됩니다.
              throw new CredentialsSignin('USER_TYPE_MISMATCH');
            }
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            nickname: data.user.nickname,
            role: data.user.role,
            phoneNumber: data.user.phoneNumber,
            location: data.user.location,
            storeName: data.user.storeName,
            storePhoneNumber: data.user.storePhoneNumber,
            imageUrl: data.user.imageUrl,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error('로그인 중 오류 발생:', error);

          // CredentialsSignin 에러는 그대로 전달하여 클라이언트에서 처리할 수 있도록 함
          if (error instanceof CredentialsSignin) {
            throw error;
          }

          // 기타 에러는 null 반환하여 일반적인 인증 실패로 처리
          return null;
        }
      },
    }),
    // 카카오 OAuth 회원가입 완료 후 세션 생성용 provider
    Credentials({
      id: 'kakao-register',
      credentials: {
        accessToken: { type: 'text' },
        refreshToken: { type: 'text' },
        userDataJson: { type: 'text' },
      },
      authorize: async (credentials): Promise<User | null> => {
        if (!credentials?.accessToken || !credentials?.userDataJson)
          return null;
        const userData = JSON.parse(credentials.userDataJson as string);
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          nickname: userData.nickname,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          location: userData.location,
          storeName: userData.storeName,
          storePhoneNumber: userData.storePhoneNumber,
          imageUrl: userData.imageUrl,
          accessToken: credentials.accessToken as string,
          refreshToken: credentials.refreshToken as string,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24시간
  },
  callbacks: {
    async jwt({ token, user }) {
      // 초기 로그인 시 사용자 정보 저장
      if (user) {
        token.location = user.location;
        token.phoneNumber = user.phoneNumber;
        token.storePhoneNumber = user.storePhoneNumber;
        token.storeName = user.storeName;
        token.imageUrl = user.imageUrl;
        token.nickname = user.nickname;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.id = user.id.toString();
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 1시간 후 만료

        return token;
      }

      // 토큰이 만료되었는지 확인
      const now = Date.now();
      const expiresAt = token.accessTokenExpires as number;

      if (now < expiresAt) {
        return token;
      }

      // 토큰이 만료되었으면 갱신 시도
      const refreshedToken = await refreshAccessToken(token);

      // 갱신 실패 시 에러 토큰 반환
      if (refreshedToken.error) {
        console.error('❌ 토큰 갱신 실패, 로그아웃 처리 필요');
        return refreshedToken;
      }

      return refreshedToken;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        // 필수 필드들이 존재하는지 확인하고 안전하게 할당
        if (token.id) session.user.id = parseInt(token.id);
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
        if (token.role) session.user.role = token.role;
        if (token.location) session.user.location = token.location;
        if (token.phoneNumber) session.user.phoneNumber = token.phoneNumber;
        if (token.storePhoneNumber)
          session.user.storePhoneNumber = token.storePhoneNumber;
        if (token.storeName) session.user.storeName = token.storeName;
        if (token.imageUrl !== undefined)
          session.user.imageUrl = token.imageUrl;
        if (token.nickname) session.user.nickname = token.nickname;
        if (token.accessToken) session.accessToken = token.accessToken;

        // 토큰 갱신 에러가 있으면 세션에도 전달
        if (token.error) {
          session.error = token.error;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // 회원가입 완료 후 /albalist로 리다이렉트
      if (url.startsWith('/signin') || url.startsWith('/signup')) {
        return `${baseUrl}/albalist`;
      }

      // 기본 리다이렉트 로직
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/signin',
  },
} satisfies NextAuthConfig;

/**
 * 액세스 토큰 갱신 함수
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // 환경 변수에서 API URL 가져오기
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://fe-project-albaform.vercel.app';
    const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID || '15-3';
    const baseURL = `${API_URL}${TEAM_ID}/`;

    const response = await fetch(`${baseURL}auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('토큰 갱신 실패');
    }

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // 새로운 refreshToken이 없으면 기존 것 유지
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1시간 후 만료
    };
  } catch (error) {
    console.error('토큰 갱신 중 오류 발생:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
