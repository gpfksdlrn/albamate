import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useSession } from 'next-auth/react';

import { AlbaItemDetail } from '@/shared/types/albaDetail';

import { useApplicationDetailApi } from '../api/applicationDetail';

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 30000,
  gcTime: 5 * 60 * 1000,
  refetchOnMount: false,
};

// 알바폼 상세 조회 쿼리
export const useAlbaformDetailQuery = (
  formId: string,
  initialData?: AlbaItemDetail,
  options = {}
) => {
  const api = useApplicationDetailApi();

  return useQuery({
    queryKey: ['albaDetail', Number(formId)],
    queryFn: async () => {
      const response = await api.getAlbaformDetail(formId);
      return response.data;
    },
    enabled: !!formId,
    initialData,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

// 내 지원 내역 조회 쿼리 (지원자용)
export const useMyApplicationQuery = (formId: string, options = {}) => {
  const { data: session, status } = useSession();
  const api = useApplicationDetailApi();

  return useQuery({
    queryKey: ['myApplication', formId],
    queryFn: async () => {
      const response = await api.getMyApplication(formId);
      return response.data;
    },
    enabled: status === 'authenticated' && !!session?.accessToken && !!formId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

// 특정 지원서 조회 쿼리 (사장님용)
export const useApplicationByIdQuery = (
  applicationId: string | undefined,
  options = {}
) => {
  const { data: session, status } = useSession();
  const api = useApplicationDetailApi();

  return useQuery({
    queryKey: ['applicationById', applicationId],
    queryFn: async () => {
      if (!applicationId) return null;

      const response = await api.getApplicationById(applicationId);
      return response.data;
    },
    enabled:
      status === 'authenticated' && !!session?.accessToken && !!applicationId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
};

// 이력서 다운로드
type DownloadOptions = UseMutationOptions<AxiosResponse<Blob>, unknown, number>;
export const useResumeDownloadMutation = (options: DownloadOptions = {}) => {
  const api = useApplicationDetailApi();

  return useMutation({
    mutationFn: async (resumeId: number) => {
      const response = await api.downloadResume(String(resumeId));
      return response;
    },
    onSuccess: response => {
      // 파일 다운로드 처리
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // 파일명 설정 (response header에서 가져오거나 기본값 사용)
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'resume.pdf'; // 기본 파일명

      if (contentDisposition) {
        // "attachment; filename="1754115498904_qzqyktg178.pdf"" 형태에서 파일명 추출
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // 메모리 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      options.onSuccess?.(response, response.config.data, undefined);
    },
    onError: error => {
      console.error('Resume download failed:', error);
    },
  });
};

// 지원 상태 수정 - 단순하고 확실한 낙관적 업데이트
type UpdateStatusVariables = {
  applicationId: string;
  status: string;
};

type UpdateStatusResponse = {
  id: string;
  status: string;
  updatedAt: string;
};

type UpdateStatusOptions = UseMutationOptions<
  AxiosResponse<UpdateStatusResponse>,
  Error,
  UpdateStatusVariables
>;

export const useUpdateApplicationStatusMutation = (
  options: UpdateStatusOptions = {}
) => {
  const api = useApplicationDetailApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status }: UpdateStatusVariables) => {
      if (
        !status ||
        ![
          'REJECTED',
          'INTERVIEW_PENDING',
          'INTERVIEW_COMPLETED',
          'HIRED',
        ].includes(status)
      ) {
        throw new Error('유효하지 않은 지원 상태입니다.');
      }

      const response = await api.updateApplicationStatus(applicationId, {
        status,
      });

      return response;
    },
    // 단순한 낙관적 업데이트
    onMutate: async ({ applicationId, status }) => {
      // 모든 관련 쿼리 취소
      await queryClient.cancelQueries();

      // 업데이트 함수
      const updateData = (
        old: Record<string, unknown> | undefined
      ): Record<string, unknown> | undefined => {
        if (!old?.id) return old;

        // ID가 일치하면 상태 업데이트
        if (String(old.id) === String(applicationId)) {
          return {
            ...old,
            status,
            updatedAt: new Date().toISOString(),
          };
        }

        return old;
      };

      // 모든 관련 쿼리 즉시 업데이트
      queryClient.setQueriesData({ queryKey: ['applicationById'] }, updateData);

      queryClient.setQueriesData({ queryKey: ['myApplication'] }, updateData);
    },
    onSettled: (data, error, variables, context) => {
      // 성공/실패 상관없이 서버에서 최신 데이터 가져오기
      queryClient.invalidateQueries({
        queryKey: ['applicationById'],
      });
      queryClient.invalidateQueries({
        queryKey: ['myApplication'],
      });

      options.onSettled?.(data, error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
};
