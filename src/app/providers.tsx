'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

let browserQueryClient: QueryClient | undefined = undefined;

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

const getQueryClient = (): QueryClient => {
  if (typeof window === 'undefined') {
    // 서버 환경에서는 매 요청마다 새로운 QueryClient를 생성합니다.
    return new QueryClient(queryClientOptions);
  } else {
    // 브라우저 환경에서는 기존 QueryClient를 재사용하거나 새로 생성합니다.
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient(queryClientOptions);
    }
    return browserQueryClient;
  }
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 React Query Devtools 활성화 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};
