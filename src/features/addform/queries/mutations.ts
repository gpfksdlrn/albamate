'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useAddformApi } from '@/features/addform/api';
import {
  CreateFormRequest,
  createFormResponseSchema,
} from '@/features/addform/schema/addform.schema';
import { albaKeys } from '@/features/albalist/queries/queries';

export const useAddformMutation = () => {
  const { postAddform } = useAddformApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (form: CreateFormRequest) => postAddform(form),
    onSuccess: response => {
      const parseResponse = createFormResponseSchema.safeParse(response.data);
      if (!parseResponse.success) {
        console.error(
          '서버 응답 데이터 Zod 유효성 검사 실패',
          parseResponse.error
        );
        return;
      }
      queryClient.invalidateQueries({
        queryKey: albaKeys.detail(parseResponse.data.id),
      });
      queryClient.invalidateQueries({ queryKey: albaKeys.lists() });
      router.push(`/alba/${parseResponse.data.id}`);
    },
    onError: error => {
      console.error('폼 제출 실패', error);
    },
  });
};

export const useEditformMutation = () => {
  const { editAddform } = useAddformApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      form,
    }: {
      formId: number;
      form: CreateFormRequest;
    }) => editAddform({ formId, form }),
    onSuccess: response => {
      const parseResponse = createFormResponseSchema.safeParse(response.data);
      if (!parseResponse.success) {
        console.error(
          '서버 응답 데이터 Zod 유효성 검사 실패',
          parseResponse.error
        );
        return;
      }
      queryClient.invalidateQueries({
        queryKey: albaKeys.detail(parseResponse.data.id),
      });
      queryClient.invalidateQueries({ queryKey: albaKeys.lists() });
      router.push(`/alba/${parseResponse.data.id}`);
    },
    onError: error => {
      console.error('폼 제출 실패', error);
    },
  });
};

export const useImageMutation = () => {
  const { uploadImage } = useAddformApi();
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
};
