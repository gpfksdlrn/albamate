'use client';

import { Session } from 'next-auth';
import { useCallback, useEffect, useMemo, useState } from 'react';

import FloatingFormButton from '@/features/albalist/components/FloatingFormButton';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { useSessionUtils } from '@/shared/lib/auth/use-session-utils';

import useAlbaListApi from '../api/albaListApi';
import { convertFiltersToApiParams } from '../utils/filterUtils';
import AlbaFilterBar from './AlbaFilterBar';
import InfiniteScroll from './InfiniteScroll';
import AlbaListSkeleton from './skeleton/AlbaListSkeleton';

interface FilterState {
  recruitStatus?: string;
  publicStatus?: string;
  sortStatus?: string;
  searchKeyword?: string;
}

const AlbaListPage = ({ session }: { session: Session | null }) => {
  const { isLoading: isSessionLoading } = useSessionUtils();
  const { getAlbas } = useAlbaListApi();
  const isOwner = session?.user?.role === 'OWNER';

  const [filters, setFilters] = useState<FilterState>({});
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchKeyword(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 디바운스된 검색어 필터에 반영
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchKeyword: debouncedSearchKeyword,
    }));
  }, [debouncedSearchKeyword]);

  // 필터 → API 파라미터 변환
  const apiParams = useMemo(
    () => convertFiltersToApiParams(filters, 6),
    [filters]
  );

  const queryKey = useMemo(
    () => ['albaList', 'infinite', apiParams] as const,
    [apiParams]
  );

  // 공용 무한스크롤 훅 사용
  const {
    isLoading,
    isError,
    isFetchingNextPage: isLoadingMore,
    loadMoreRef,
    getData,
    error,
  } = useInfiniteScroll({
    mode: 'cursor',
    queryKey,
    fetcher: async params => {
      const response = await getAlbas(params);
      return response.data;
    },
    initialParams: apiParams,
    enabled: !isSessionLoading, // 세션 로딩 완료 후 데이터 로드
  });

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // 같은 값이지만 상태를 갱신하여 useInfiniteScroll 트리거
  const handleRetry = useCallback(() => {
    setFilters(prev => ({ ...prev }));
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => setSearchInput(value),
    []
  );

  if (isSessionLoading) {
    return <AlbaListSkeleton count={6} />;
  }

  return (
    <div className="mb-68">
      <AlbaFilterBar
        isOwner={isOwner}
        recruitValue={filters.recruitStatus}
        searchValue={searchInput}
        sortValue={filters.sortStatus}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      <InfiniteScroll
        data={getData()}
        error={isError ? error : null}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        loadMoreRef={loadMoreRef}
        onRetry={handleRetry}
      >
        {isOwner && <FloatingFormButton />}
      </InfiniteScroll>
    </div>
  );
};

export default AlbaListPage;
