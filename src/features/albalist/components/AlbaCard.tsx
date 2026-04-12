'use client';

import AlbaCardItem from '@common/list/AlbaCardItem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import { useAuthSession } from '@/features/auth';
import { usePopupStore } from '@/shared/store/popupStore';
import type { AlbaItem } from '@/shared/types/alba';

import useAlbaListApi from '../api/albaListApi';

interface Props {
  item: AlbaItem;
}

const AlbaCard = ({ item }: Props) => {
  const router = useRouter();
  const { isAuthenticated, refreshSession } = useAuthSession();
  const { scrapAlba, cancelScrapAlba, getAlbaDetail } = useAlbaListApi();
  const queryClient = useQueryClient();
  const { showPopup } = usePopupStore();

  const [isLoading, setIsLoading] = useState(false);

  const { data: detailData } = useQuery({
    queryKey: ['albaDetail', item.id],
    queryFn: () => getAlbaDetail(item.id).then(res => res.data),
  });

  const [isScrapped, setIsScrapped] = useState(false);
  const [localScrapCount, setLocalScrapCount] = useState(item.scrapCount);

  useEffect(() => {
    if (detailData && !isLoading) {
      setIsScrapped(detailData.isScrapped);
      setLocalScrapCount(detailData.scrapCount);
    }
  }, [detailData, isLoading]);

  const handleCardClick = () => {
    router.push(`/alba/${item.id}`);
  };

  const toggleScrap = useCallback(async () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    // optimistic update
    const prevScrapped = isScrapped;
    const prevScrapCount = localScrapCount;
    setIsScrapped(!prevScrapped);
    setLocalScrapCount(prevScrapCount + (prevScrapped ? -1 : 1));

    try {
      if (prevScrapped) {
        await cancelScrapAlba(item.id);
        showPopup(`스크랩 취소 완료!`, 'error');
      } else {
        await scrapAlba(item.id);
        showPopup(`스크랩 완료!`, 'success');
      }

      queryClient.invalidateQueries({ queryKey: ['albaList'] });
      queryClient.invalidateQueries({ queryKey: ['albaDetail', item.id] });
    } catch (error: any) {
      // rollback
      setIsScrapped(prevScrapped);
      setLocalScrapCount(prevScrapCount);

      if (error?.response?.status === 401) {
        try {
          await refreshSession(); // 세션 갱신 시도
          console.info('세션 갱신 성공');
          // 갱신 성공 시 아무 일도 하지 않음
        } catch (refreshError) {
          console.warn('세션 갱신 실패. 로그아웃을 진행합니다.');
          showPopup('로그인이 필요합니다', 'info');
          signOut({ callbackUrl: '/signin', redirect: true });
        }
        return;
      }

      if (error?.response?.status === 400) {
        showPopup(
          error.response?.data?.message || '요청 오류가 발생했습니다.',
          'error'
        );
        router.push('/');
        return;
      }

      showPopup('스크랩 처리 중 오류가 발생했습니다.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    isLoading,
    item.id,
    item.title,
    isScrapped,
    localScrapCount,
    refreshSession,
    scrapAlba,
    cancelScrapAlba,
    queryClient,
    router,
    showPopup,
  ]);

  const applyScrapOptions = [
    {
      label: '지원하기',
      onClick: () => router.push(`/apply/${item.id}`),
    },
    {
      label: isScrapped ? '스크랩 취소' : '스크랩',
      onClick: toggleScrap,
      disabled: isLoading,
    },
  ];

  const itemWithLocalScrapCount = {
    ...item,
    scrapCount: localScrapCount,
  };

  return (
    <AlbaCardItem
      dropdownOptions={applyScrapOptions}
      isScrapped={isScrapped}
      item={itemWithLocalScrapCount}
      onClick={handleCardClick}
    />
  );
};

export default AlbaCard;
