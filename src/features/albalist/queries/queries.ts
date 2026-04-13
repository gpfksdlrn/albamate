import { useQuery } from '@tanstack/react-query';

import type { AlbaItem } from '@/shared/types/alba';

import useAlbaListApi from '../api/albaListApi';

export interface AlbaQueryParams {
  limit?: number;
  cursor?: number;
  orderBy?: 'mostRecent' | 'highestWage' | 'mostApplied' | 'mostScrapped';
  keyword?: string;
  isPublic?: boolean;
  isRecruiting?: boolean;
}

// 쿼리 키 팩토리
export const albaKeys = {
  all: ['alba'] as const,
  lists: () => [...albaKeys.all, 'list'] as const,
  list: (params: AlbaQueryParams) => [...albaKeys.lists(), params] as const,
  listInfinite: (params: AlbaQueryParams) =>
    [...albaKeys.lists(), 'infinite', params] as const,
  details: () => [...albaKeys.all, 'detail'] as const,
  detail: (id: number) => [...albaKeys.details(), id] as const,
};

export const useAlbalistQuery = (params: AlbaQueryParams = { limit: 10 }) => {
  const { getAlbas } = useAlbaListApi();

  return useQuery<AlbaItem[], Error>({
    queryKey: albaKeys.list(params),
    queryFn: async () => {
      // 타입 안정성 보장
      const res = await getAlbas(params);
      if (!res.data?.data || !Array.isArray(res.data.data)) {
        throw new Error('Invalid API response format');
      }
      return res.data.data as AlbaItem[];
    },
    enabled: true, // 무조건 요청 실행
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnMount: false,
  });
};
