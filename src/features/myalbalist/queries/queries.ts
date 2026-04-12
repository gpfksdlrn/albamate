import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { myAlbalistApi } from '../api/api';
import { ApplicantQueryParams, OwnerQueryParams } from '../types/myalbalist';

export const useApplicantMyAlbalistQuery = (
  params: ApplicantQueryParams = { limit: 10 },
  userRole?: 'OWNER' | 'APPLICANT'
) => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['applicantMyAlbalist', params],
    queryFn: async () => {
      try {
        const response = await myAlbalistApi.getApplicantMyAlbalist(params);
        return response.data.data;
      } catch (error: any) {
        console.error('Applicant API 에러 상세:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    enabled: status === 'authenticated' && userRole === 'APPLICANT',
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
};

export const useOwnerMyAlbalistQuery = (
  params: OwnerQueryParams = { limit: 10 },
  userRole?: 'OWNER' | 'APPLICANT'
) => {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['ownerMyAlbalist', params],
    queryFn: async () => {
      try {
        const response = await myAlbalistApi.getOwnerMyAlbalist(params);
        return response.data.data;
      } catch (error: any) {
        console.error('Owner API 에러 상세:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    enabled: status === 'authenticated' && userRole === 'OWNER',
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });
};

/**
 * 알바폼 삭제 뮤테이션
 */
export const useDeleteFormMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formId: number) => myAlbalistApi.deleteForm(formId),
    onSuccess: () => {
      // 관련 쿼리들 무효화하여 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ['ownerMyAlbalist'],
      });
      queryClient.invalidateQueries({
        queryKey: ['applicantMyAlbalist'],
      });
    },
    onError: error => {
      console.error('알바폼 삭제 실패:', error);
    },
  });
};
