import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fe-project-albaform.vercel.app';
const TEAM_ID = process.env.NEXT_PUBLIC_TEAM_ID || '15-3';

const baseURL = `${API_URL}${TEAM_ID}/`;

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들을 저장하는 배열
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 토큰 갱신 함수
const refreshToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await axios.post(`${baseURL}auth/refresh`, {
    refreshToken,
  });

  return response.data;
};

// 공통 요청 인터셉터
const createRequestInterceptor = () => async (config: any) => {
  try {
    const session = (await getSession()) as any;
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  } catch (error) {
    console.error('세션 가져오기 실패:', error);
  }
  return config;
};

// 공통 응답 인터셉터
const createResponseInterceptor = (instance: AxiosInstance) => ({
  onFulfilled: (response: AxiosResponse) => {
    return response;
  },
  onRejected: async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401 에러가 아니거나 이미 재시도된 요청이면 그대로 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 이미 토큰 갱신 중이면 대기열에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const session = (await getSession()) as any;
      if (!session?.refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      const refreshedTokens = await refreshToken(session.refreshToken);

      // 세션 업데이트 (NextAuth JWT 콜백에서 처리됨)
      // 여기서는 단순히 대기 중인 요청들만 처리
      processQueue(null, refreshedTokens.accessToken);

      // 현재 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${refreshedTokens.accessToken}`;
      return instance(originalRequest);
    } catch (refreshError) {
      console.error('❌ 토큰 갱신 실패:', refreshError);

      // 토큰 갱신 실패 시 대기 중인 요청들 모두 실패 처리
      processQueue(refreshError, null);

      // 로그아웃 처리
      await signOut({ redirect: false });

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
});

export const axiosInstance = axios.create({
  baseURL,
});

// 공통 인터셉터 적용
axiosInstance.interceptors.request.use(createRequestInterceptor());
axiosInstance.interceptors.response.use(
  createResponseInterceptor(axiosInstance).onFulfilled,
  createResponseInterceptor(axiosInstance).onRejected
);
