'use client';

import FloatingButtonContainer from '@common/button/FloatingButtonContainer';
import { useState } from 'react';

import FloatingButton from '@/shared/components/common/button/FloatingButton';
import PrimaryButton from '@/shared/components/common/button/PrimaryButton';
import EmptyCard from '@/shared/components/common/EmptyCard';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

import { fetchAlbatalks } from '../../api/albatalkApi';
import { albatalkKeys } from '../../hooks/useAlbatalk';
import type { GetAlbatalksParams } from '../../schemas/albatalk.schema';
import AlbatalkItem from '../albatalk-item';
import AlbatalkFilterBar from './AlbatalkFilterBar';

interface AlbatalkListClientProps {
  initialParams?: GetAlbatalksParams;
}

const AlbatalkListClient = ({ initialParams }: AlbatalkListClientProps) => {
  const ALBATALKS_FETCH_LIMIT = 6;

  const [params, setParams] = useState<GetAlbatalksParams>(
    initialParams || {
      limit: ALBATALKS_FETCH_LIMIT,
      orderBy: 'mostRecent',
    }
  );

  const {
    isLoading,
    error,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    getData,
    refetch,
  } = useInfiniteScroll({
    mode: 'cursor',
    queryKey: albatalkKeys.listInfinite(params),
    fetcher: async (fetchParams: GetAlbatalksParams) => {
      const { cursor, ...otherParams } = fetchParams;
      const apiParams = cursor ? { ...otherParams, cursor } : otherParams;
      return await fetchAlbatalks(apiParams);
    },
    initialParams: params,
    enabled: true,
  });

  const handleParamsChange = (newParams: Partial<GetAlbatalksParams>) => {
    setParams(prev => {
      const updated = {
        ...prev,
        ...newParams,
        cursor: undefined,
      };
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-1480 pb-128">
        <AlbatalkFilterBar
          currentKeyword={params.keyword}
          currentOrderBy={params.orderBy}
          isLoading={isLoading}
          onParamsChange={handleParamsChange}
        />
        {/* TODO: 스켈레톤 UI 예정 */}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-1480 pb-128">
        <AlbatalkFilterBar
          currentKeyword={params.keyword}
          currentOrderBy={params.orderBy}
          isLoading={isLoading}
          onParamsChange={handleParamsChange}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="mb-4 text-red-500">
            {error?.message || '게시글을 불러오는데 실패했습니다.'}
          </p>
          <PrimaryButton
            className="p-15"
            label="다시 시도"
            type="button"
            variant="solid"
            onClick={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const albatalks = getData();

  return (
    <div className="mx-auto max-w-1480 pb-128">
      <AlbatalkFilterBar
        currentKeyword={params.keyword}
        currentOrderBy={params.orderBy}
        isLoading={isLoading}
        onParamsChange={handleParamsChange}
      />

      <section className="mb-8 grid grid-cols-1 gap-24 lg:grid-cols-3">
        {albatalks.map(albatalk => (
          <AlbatalkItem key={albatalk.id} albatalk={albatalk} />
        ))}
      </section>

      {/* 무한 스크롤 감지용 요소 */}
      <div ref={loadMoreRef} className="h-4 w-full" />

      {/* 다음 페이지 로딩 상태 표시 */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="text-gray-500">더 많은 데이터를 불러오는 중...</div>
        </div>
      )}

      {albatalks.length === 0 && (
        <EmptyCard
          description="궁금한 점, 고민 등의 게시글을 올려보세요"
          title="작성한 게시글이 없어요."
          type="post"
        />
      )}

      <FloatingButtonContainer>
        <FloatingButton href="/addtalk" type="addAlbatalk" />
      </FloatingButtonContainer>
    </div>
  );
};

export default AlbatalkListClient;
