'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { albaKeys } from '@/features/albalist/queries/queries';
import { postApplication, postResume } from '@/features/apply/api';
import {
  CreateApplicationRequest,
  createApplicationResponseSchema,
} from '@/features/apply/schema/apply.schema';

export const useApplyMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formId,
      form,
    }: {
      formId: number;
      form: CreateApplicationRequest;
    }) => postApplication({ formId, form }),
    onSuccess: (response, variables) => {
      const parseResponse = createApplicationResponseSchema.safeParse(
        response.data
      );
      if (!parseResponse.success) {
        console.error(
          '서버 응답 데이터 Zod 유효성 검사 실패',
          parseResponse.error
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: albaKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: albaKeys.detail(variables.formId),
      });
      // 회원은 지원 상세 페이지로, 비회원은 알바폼 상세 페이지로
      if (parseResponse.data.applicantId) {
        queryClient.setQueryData(
          ['myApplication', String(variables.formId)],
          parseResponse.data
        );
        router.push(`/myapply/${variables.formId}`);
      } else {
        router.push(`/alba/${variables.formId}`);
      }
    },
    onError: error => {
      console.error('폼 제출 실패', error);
    },
  });
};

export const useResumeMutation = () => {
  return useMutation({
    mutationFn: (file: File) => postResume(file),
    onError: error => {
      console.error('이력서 업로드 실패', error);
    },
  });
};
