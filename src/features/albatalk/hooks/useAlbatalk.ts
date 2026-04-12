import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { axiosInstance } from '@/shared/lib/axios';

import {
  addAlbatalkLike,
  createAlbatalk,
  createComment,
  deleteAlbatalk,
  deleteComment,
  fetchAlbatalkDetail,
  fetchAlbatalks,
  fetchComments,
  removeAlbatalkLike,
  updateAlbatalk,
  updateComment,
} from '../api/albatalkApi';
import {
  CreateAlbatalkParams,
  GetAlbatalksParams,
  GetCommentsParams,
} from '../schemas/albatalk.schema';

// 쿼리 키 팩토리
export const albatalkKeys = {
  all: ['albatalk'] as const,
  lists: () => [...albatalkKeys.all, 'list'] as const,
  list: (params: GetAlbatalksParams) =>
    [...albatalkKeys.lists(), params] as const,
  listInfinite: (params: GetAlbatalksParams) =>
    [...albatalkKeys.lists(), 'infinite', params] as const,
  details: () => [...albatalkKeys.all, 'detail'] as const,
  detail: (id: number) => [...albatalkKeys.details(), id] as const,
  comments: (postId: number) =>
    [...albatalkKeys.all, 'comments', postId] as const,
  commentsList: (postId: number, params?: GetCommentsParams) =>
    [...albatalkKeys.comments(postId), 'list', params] as const,
  commentsInfinite: (postId: number) =>
    [...albatalkKeys.comments(postId), 'infinite'] as const,
};

/**
 * 게시글 목록 조회 훅
 */
export const useAlbatalks = (params: GetAlbatalksParams) => {
  return useQuery({
    queryKey: albatalkKeys.list(params),
    queryFn: () => fetchAlbatalks(params),
  });
};

/**
 * 게시글 상세 조회 훅
 * @returns
 */
export const useAlbatalkDetail = (
  postId: number,
  options?: { enabled?: boolean }
) => {
  const authAxios = axiosInstance;

  return useQuery({
    queryKey: albatalkKeys.detail(postId),
    queryFn: () => fetchAlbatalkDetail(postId, authAxios),
    enabled: options?.enabled !== false,
  });
};

/**
 * 게시글 작성 훅
 */
export const useCreateAlbatalk = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: (params: CreateAlbatalkParams) =>
      createAlbatalk(params, authAxios),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.lists(),
        exact: false,
      });
    },
    onError: error => {
      console.error('알바토크 작성 실패: ', error);
    },
  });
};

/**
 * 알바토크 수정 훅
 */
export const useUpdateAlbatalk = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: ({
      postId,
      ...params
    }: { postId: number } & CreateAlbatalkParams) =>
      updateAlbatalk(postId, params, authAxios),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.detail(variables.postId),
      });

      queryClient.invalidateQueries({
        queryKey: albatalkKeys.lists(),
        exact: false,
      });
    },
    onError: error => {
      console.error('알바토크 수정 실패: ', error);
    },
  });
};

/**
 * 게시글 삭제 훅
 */
export const useDeleteAlbatalk = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: (postId: number) => deleteAlbatalk(postId, authAxios),
    onSuccess: (_, postId) => {
      queryClient.removeQueries({
        queryKey: albatalkKeys.detail(postId),
      });
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.lists(),
        exact: false,
      });
      queryClient.removeQueries({
        queryKey: albatalkKeys.comments(postId),
      });
    },
    onError: error => {
      console.error('알바토크 삭제 실패: ', error);
    },
  });
};

/**
 * 게시글 좋아요 토글 훅
 */
export const useAddAlbatalkLike = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: (postId: number) => addAlbatalkLike(postId, authAxios),
    onSuccess: (_, postId) => {
      // 게시글 상세 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.detail(postId),
      });
      // 게시글 목록 쿼리 무효화
      queryClient.refetchQueries({
        queryKey: albatalkKeys.lists(),
        exact: false,
      });
    },
    onError: error => {
      console.error('좋아요 실패:', error);
    },
  });
};

/**
 * 게시글 좋아요 취소 훅
 */
export const useRemoveAlbatalkLike = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: (postId: number) => removeAlbatalkLike(postId, authAxios),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.detail(postId),
      });
      queryClient.refetchQueries({
        queryKey: albatalkKeys.lists(),
        exact: false,
      });
    },
    onError: error => {
      console.error('좋아요 취소 실패:', error);
    },
  });
};

// ========== 댓글 관련 훅들 ==========

/**
 * 댓글 목록 조회 훅
 */
export const useAlbatalkComments = (
  postId: number,
  params?: GetCommentsParams
) => {
  const authAxios = axiosInstance;
  const { data: session, status } = useSession();

  const isSessionLoading = status === 'loading';
  const hasAccessToken = !!session?.accessToken;

  return useQuery({
    queryKey: albatalkKeys.commentsList(postId, params),
    queryFn: () => fetchComments(postId, authAxios, params),
    enabled: !isSessionLoading && hasAccessToken,
  });
};

/**
 * 댓글 작성 훅
 */
export const useCreateAlbatalkComment = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      createComment(postId, content, authAxios),
    onSuccess: (_, { postId }) => {
      // 무한 스크롤 댓글 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.commentsInfinite(postId),
      });

      // 게시글 상세 정보도 무효화 (댓글 수 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.detail(postId),
      });
    },
    onError: error => {
      console.error('댓글 작성 실패:', error);
    },
  });
};

/**
 * 댓글 무한 스크롤 조회 훅
 */
export const useAlbatalkCommentsInfinite = (postId: number) => {
  const authAxios = axiosInstance;
  const { data: session, status } = useSession();

  const isSessionLoading = status === 'loading';
  const hasAccessToken = !!session?.accessToken;

  return useInfiniteScroll({
    mode: 'page',
    queryKey: albatalkKeys.commentsInfinite(postId),
    fetcher: (params: GetCommentsParams) =>
      fetchComments(postId, authAxios, params),
    initialParams: { page: 1, pageSize: 6 },
    enabled: !isSessionLoading && hasAccessToken,
  });
};

/**
 * 댓글 수정 훅
 */
export const useUpdateAlbatalkComment = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: ({
      commentId,
      content,
      postId,
    }: {
      commentId: number;
      content: string;
      postId: number;
    }) => updateComment(commentId, content, authAxios),
    onSuccess: (_, { postId }) => {
      // 해당 게시글의 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.comments(postId),
      });

      // 무한 스크롤 댓글 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.commentsInfinite(postId),
      });
    },
    onError: error => {
      console.error('댓글 수정 실패', error);
    },
  });
};

/**
 * 댓글 삭제 훅
 */
export const useDeleteAlbatalkComment = () => {
  const queryClient = useQueryClient();
  const authAxios = axiosInstance;

  return useMutation({
    mutationFn: ({
      commentId,
      postId,
    }: {
      commentId: number;
      postId: number;
    }) => deleteComment(commentId, authAxios),
    onSuccess: (_, { postId }) => {
      // 해당 게시글의 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.comments(postId),
      });

      // 무한 스크롤 댓글 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.commentsInfinite(postId),
      });

      // 게시글 상세 정보도 무효화 (댓글 수 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: albatalkKeys.detail(postId),
      });
    },
    onError: error => {
      console.error('댓글 삭제 실패:', error);
    },
  });
};
