import { useInfiniteQuery } from '@tanstack/react-query';

import { CursorResponse, PageResponse } from '../types/mypage';
import { useIntersectionObserver } from './useIntersectionObserver';

/**
 * 무한 스크롤 기능을 제공하는 커스텀 훅입니다.
 * 커서 기반 또는 페이지 기반 방식 중 선택하여 사용할 수 있습니다.
 *
 * @template T - 반환받는 데이터 배열의 아이템 타입
 * @template P - fetcher 함수에 전달될 파라미터 객체 타입
 *
 * @param {Object} options - 훅에 전달할 옵션 객체
 * @param {'cursor' | 'page'} options.mode - 무한 스크롤 모드 ('cursor': 커서 기반, 'page': 페이지 기반)
 * @param {(string | number)[]} options.queryKey - React Query에서 사용하는 쿼리 키
 * @param {(params: P) => Promise<CursorResponse<T> | PageResponse<T>>} options.fetcher - 데이터를 불러오는 비동기 함수
 * @param {P} options.initialParams - 초기 요청에 사용할 파라미터 객체
 * @param {boolean} [options.enabled=true] - 쿼리 활성화 여부
 *
 * @returns {{
 *   data: ReturnType<typeof useInfiniteQuery>['data'];
 *   isLoading: boolean;
 *   isError: boolean;
 *   fetchNextPage: () => void;
 *   hasNextPage: boolean | undefined;
 *   isFetchingNextPage: boolean;
 *   loadMoreRef: (node: Element | null) => void;
 *   getData: () => T[];
 * }} - 무한 스크롤 관련 상태 및 유틸리티
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   fetchNextPage,
 *   hasNextPage,
 *   loadMoreRef,
 *   getData,
 * } = useInfiniteScroll({
 *   mode: 'cursor',
 *   queryKey: ['posts'],
 *   fetcher: fetchPosts,
 *   initialParams: { pageSize: 10 },
 * });
 *
 * return (
 *   <div>
 *     {getData().map(post => (
 *       <PostCard key={post.id} post={post} />
 *     ))}
 *     <div ref={loadMoreRef} />
 *   </div>
 * );
 * ```
 */

type InfiniteScrollMode = 'cursor' | 'page';

interface UseInfiniteScrollOptions<T, P> {
  mode: InfiniteScrollMode;
  queryKey: readonly unknown[];
  fetcher: (params: P) => Promise<CursorResponse<T> | PageResponse<T>>;
  initialParams: P;
  enabled?: boolean;
}

export function useInfiniteScroll<
  T,
  P extends Record<string, any> & { cursor?: number | null; page?: number },
>({
  mode,
  queryKey,
  fetcher,
  initialParams,
  enabled = true,
}: UseInfiniteScrollOptions<T, P>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      if (mode === 'cursor') {
        return await fetcher({ ...initialParams, cursor: pageParam } as P);
      } else {
        return await fetcher({ ...initialParams, page: pageParam } as P);
      }
    },
    initialPageParam: mode === 'cursor' ? null : 1,
    getNextPageParam: lastPage => {
      if (mode === 'cursor') {
        const cursorResponse = lastPage as CursorResponse<T>;
        return cursorResponse.nextCursor ?? undefined;
      } else {
        const pageResponse = lastPage as PageResponse<T>;
        if (pageResponse.currentPage < pageResponse.totalPages) {
          return pageResponse.currentPage + 1;
        }
        return undefined;
      }
    },
    enabled,
  });

  // Intersection Observer 설정
  const loadMoreRef = useIntersectionObserver(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  });

  // 데이터 추출 함수
  const getData = () => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page: any) => page.data);
  };

  return {
    ...query,
    loadMoreRef,
    getData,
  };
}
