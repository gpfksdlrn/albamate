'use client';

import FloatingButton from '@common/button/FloatingButton';
import FloatingButtonContainer from '@common/button/FloatingButtonContainer';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import useAlbaListApi from '@/features/albalist/api/albaListApi';
import { albaKeys } from '@/features/albalist/queries/queries';
import { useAuthSession } from '@/features/auth';
import { useSessionUtils } from '@/shared/lib/auth/use-session-utils';
import { usePopupStore } from '@/shared/store/popupStore';

interface Props {
  formId: number;
}

const FloatingButtons = ({ formId }: Props) => {
  const { isAuthenticated, refreshSession } = useAuthSession();
  const { isOwner } = useSessionUtils();
  const { scrapAlba, cancelScrapAlba } = useAlbaListApi();
  const queryClient = useQueryClient();
  const { showPopup } = usePopupStore();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 알바 상세 데이터에서 스크랩 상태 확인
  useEffect(() => {
    const albaDetailData = queryClient.getQueryData(albaKeys.detail(formId));
    if (
      albaDetailData &&
      typeof albaDetailData === 'object' &&
      'isScrapped' in albaDetailData
    ) {
      setIsBookmarked(Boolean(albaDetailData.isScrapped));
    }
  }, [formId, queryClient]);

  const handleBookmarkToggle = useCallback(async () => {
    await refreshSession();

    if (!isAuthenticated) {
      await signOut({ callbackUrl: `${window.location.origin}/signin` });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      // 세션 강제 갱신 시도
      try {
        await refreshSession();
      } catch (refreshError) {
        console.warn('세션 갱신 실패. 로그아웃을 진행합니다.');
        signOut({
          callbackUrl: `${window.location.origin}/signin`,
          redirect: true,
        });

        return;
      }

      if (isBookmarked) {
        // 스크랩 취소
        await cancelScrapAlba(formId);
        setIsBookmarked(false);
        showPopup('스크랩을 취소했어요.', 'error');
      } else {
        // 스크랩 시도
        try {
          await scrapAlba(formId);
          setIsBookmarked(true);
          showPopup('스크랩했어요!', 'success');
        } catch (error) {
          if (
            error instanceof Error &&
            'response' in error &&
            (error as any).response?.data?.message ===
              '이미 스크랩한 알바폼입니다.'
          ) {
            // 실제로는 이미 스크랩된 상태이므로 취소 동작 수행
            await cancelScrapAlba(formId);
            setIsBookmarked(false);
            showPopup('스크랩을 취소했어요.', 'error');
          } else {
            throw error;
          }
        }
      }

      // 강제로 모든 관련 쿼리를 다시 불러오기
      await Promise.all([
        queryClient.refetchQueries({ queryKey: albaKeys.lists() }),
        queryClient.refetchQueries({ queryKey: albaKeys.detail(formId) }),
      ]);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        showPopup('요청 중 오류가 발생했습니다.', 'error');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    isLoading,
    isBookmarked,
    formId,
    refreshSession,
    scrapAlba,
    cancelScrapAlba,
    queryClient,
    showPopup,
  ]);

  return (
    <FloatingButtonContainer position="right-center">
      {/* 사장님이 아닌 경우만 스크랩 */}
      {!isOwner && (
        <FloatingButton
          isBookmarked={isBookmarked}
          type="bookmark"
          onClick={handleBookmarkToggle}
        />
      )}

      <FloatingButton type="share" />
    </FloatingButtonContainer>
  );
};

export default FloatingButtons;
