import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signOut, useSession } from 'next-auth/react';

import { auth } from '@/auth';

// 쿼리 키 상수
export const SESSION_QUERY_KEYS = {
  session: ['session'] as const,
  user: ['user'] as const,
} as const;

/**
 * 서버 사이드에서 세션을 가져오는 함수
 *
 * @example
 
 * // 서버 컴포넌트에서 사용
 * export default async function ServerComponent() {
 *   const session = await fetchSession();
 *
 *   if (!session) {
 *     return <div>로그인이 필요합니다.</div>;
 *   }
 *
 *   return <div>안녕하세요, {session.user.name}님!</div>;
 * }
 *
 * // API 라우트에서 사용
 * export async function GET() {
 *   const session = await fetchSession();
 *
 *   if (!session) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   return Response.json({ user: session.user });
 * }
 */
async function fetchSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error('세션 가져오기 실패:', error);
    return null;
  }
}

/**
 * 클라이언트 사이드에서 세션을 쿼리로 관리하는 훅
 *
 * @example
 * // 기본 사용법
 * function MyComponent() {
 *   const { data: session, isLoading, error } = useSessionQuery();
 *
 *   if (isLoading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러가 발생했습니다.</div>;
 *   if (!session) return <div>로그인이 필요합니다.</div>;
 *
 *   return <div>안녕하세요, {session.user.name}님!</div>;
 * }
 *
 * // 조건부 렌더링
 * function ConditionalComponent() {
 *   const { data: session } = useSessionQuery();
 *
 *   return (
 *     <div>
 *       {session ? (
 *         <UserProfile user={session.user} />
 *       ) : (
 *         <LoginButton />
 *       )}
 *     </div>
 *   );
 * }
 */
export function useSessionQuery() {
  const { data: session, status, update } = useSession();

  return useQuery({
    queryKey: SESSION_QUERY_KEYS.session,
    queryFn: () => Promise.resolve(session),
    enabled: status !== 'loading',
  });
}

/**
 * 사용자 정보를 쿼리로 관리하는 훅
 *
 * @example
 * // 사용자 정보만 필요한 경우
 * function UserProfile() {
 *   const { data: user, isLoading } = useUserQuery();
 *
 *   if (isLoading) return <div>사용자 정보 로딩 중...</div>;
 *   if (!user) return <div>사용자 정보를 찾을 수 없습니다.</div>;
 *
 *   return (
 *     <div>
 *       <h2>{user.name}</h2>
 *       <p>{user.email}</p>
 *       <p>역할: {user.role}</p>
 *     </div>
 *   );
 * }
 *
 * // 사용자 역할에 따른 조건부 렌더링
 * function RoleBasedComponent() {
 *   const { data: user } = useUserQuery();
 *
 *   if (user?.role === 'OWNER') {
 *     return <OwnerDashboard />;
 *   }
 *
 *   if (user?.role === 'APPLICANT') {
 *     return <ApplicantDashboard />;
 *   }
 *
 *   return <div>역할을 확인할 수 없습니다.</div>;
 * }
 */
export function useUserQuery() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: SESSION_QUERY_KEYS.user,
    queryFn: () => Promise.resolve(session?.user || null),
    enabled: !!session?.user,
  });
}

/**
 * 세션 갱신 뮤테이션
 *
 * @example
 * // 수동 세션 갱신
 * function RefreshButton() {
 *   const refreshSession = useRefreshSessionMutation();
 *
 *   const handleRefresh = async () => {
 *     try {
 *       await refreshSession.mutateAsync();
 *       alert('세션이 갱신되었습니다.');
 *     } catch (error) {
 *       alert('세션 갱신에 실패했습니다.');
 *     }
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleRefresh}
 *       disabled={refreshSession.isPending}
 *     >
 *       {refreshSession.isPending ? '갱신 중...' : '세션 갱신'}
 *     </button>
 *   );
 * }
 *
 * // 토큰 만료 시 자동 갱신
 * function AutoRefreshComponent() {
 *   const refreshSession = useRefreshSessionMutation();
 *
 *   useEffect(() => {
 *     const handleTokenExpiry = () => {
 *       refreshSession.mutate();
 *     };
 *
 *     // 토큰 만료 이벤트 리스너 등록
 *     window.addEventListener('tokenExpired', handleTokenExpiry);
 *
 *     return () => {
 *       window.removeEventListener('tokenExpired', handleTokenExpiry);
 *     };
 *   }, [refreshSession]);
 *
 *   return <div>자동 갱신 활성화됨</div>;
 * }
 */
export function useRefreshSessionMutation() {
  const queryClient = useQueryClient();
  const { update } = useSession();

  return useMutation({
    mutationFn: async () => {
      const result = await update();
      return result;
    },
    onSuccess: newSession => {
      // 쿼리 캐시 업데이트
      queryClient.setQueryData(SESSION_QUERY_KEYS.session, newSession);
      queryClient.setQueryData(SESSION_QUERY_KEYS.user, newSession?.user);
    },
    onError: error => {
      console.error('세션 갱신 실패:', error);
      // 에러 시 로그아웃 처리
      signOut({ callbackUrl: '/signin' });
    },
  });
}

/**
 * 로그아웃 뮤테이션
 *
 * @example
 * // 기본 로그아웃 버튼
 * function LogoutButton() {
 *   const logout = useLogoutMutation();
 *
 *   const handleLogout = async () => {
 *     if (confirm('정말 로그아웃하시겠습니까?')) {
 *       try {
 *         await logout.mutateAsync();
 *         // 로그아웃 성공 시 추가 처리
 *       } catch (error) {
 *         alert('로그아웃 중 오류가 발생했습니다.');
 *       }
 *     }
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleLogout}
 *       disabled={logout.isPending}
 *       className="text-red-500"
 *     >
 *       {logout.isPending ? '로그아웃 중...' : '로그아웃'}
 *     </button>
 *   );
 * }
 *
 * // 네비게이션 바의 로그아웃
 * function NavigationBar() {
 *   const logout = useLogoutMutation();
 *   const { data: user } = useUserQuery();
 *
 *   return (
 *     <nav>
 *       <div>안녕하세요, {user?.name}님</div>
 *       <button
 *         onClick={() => logout.mutate()}
 *         disabled={logout.isPending}
 *       >
 *         로그아웃
 *       </button>
 *     </nav>
 *   );
 * }
 *
 * // 자동 로그아웃 (세션 만료 시)
 * function SessionManager() {
 *   const logout = useLogoutMutation();
 *
 *   useEffect(() => {
 *     const handleSessionExpiry = () => {
 *       logout.mutate();
 *     };
 *
 *     // 세션 만료 이벤트 리스너
 *     window.addEventListener('sessionExpired', handleSessionExpiry);
 *
 *     return () => {
 *       window.removeEventListener('sessionExpired', handleSessionExpiry);
 *     };
 *   }, [logout]);
 *
 *   return null;
 * }
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await signOut({ callbackUrl: '/signin' });
    },
    onSuccess: () => {
      // 쿼리 캐시 무효화
      queryClient.removeQueries({ queryKey: SESSION_QUERY_KEYS.session });
      queryClient.removeQueries({ queryKey: SESSION_QUERY_KEYS.user });
    },
  });
}
