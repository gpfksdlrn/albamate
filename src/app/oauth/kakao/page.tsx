'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { usePopupStore } from '@/shared/store/popupStore';

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!;

const KakaoCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showPopup } = usePopupStore();
  const [status, setStatus] = useState('카카오 로그인 처리 중...');
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const code = searchParams.get('code');

    if (!code) {
      showPopup('로그인에 실패했습니다.', 'error');
      router.replace('/signin?type=applicant');
      return;
    }

    // StrictMode remount 대비: 같은 code 중복 처리 방지
    const processingKey = `kakao_processing_${code}`;
    if (sessionStorage.getItem(processingKey)) return;
    sessionStorage.setItem(processingKey, '1');

    const redirectUri = `${window.location.origin}/oauth/kakao`;

    const handleCallback = async () => {
      // 신규 유저 두 번째 Kakao 리다이렉트 → sign-up에 사용할 코드 저장
      const intent = sessionStorage.getItem('kakaoIntent');
      if (intent === 'signup') {
        sessionStorage.removeItem('kakaoIntent');
        sessionStorage.setItem('kakaoCode', code);
        sessionStorage.setItem('kakaoRedirectUri', redirectUri);
        setStatus('회원가입 페이지로 이동 중...');
        router.push('/oauth/kakao/signup');
        return;
      }

      // 기존 유저 sign-in 시도
      const response = await fetch('/api/oauth/kakao/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        // 기존 유저 → 세션 생성 후 이동
        await signIn('kakao-register', {
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
          userDataJson: JSON.stringify(responseData.user),
          redirect: false,
        });
        router.push('/albalist');
      } else if (
        response.status === 404 ||
        responseData?.detail?.message?.includes('등록되지 않은')
      ) {
        // 신규 유저 → 코드가 소비됐으므로 Kakao에서 새 코드 받기
        setStatus('카카오 회원가입 준비 중...');
        sessionStorage.setItem('kakaoIntent', 'signup');
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
        window.location.href = kakaoAuthUrl;
      } else {
        showPopup(
          responseData?.detail?.message || '로그인 중 오류가 발생했습니다.',
          'error'
        );
        router.replace('/signin?type=applicant');
      }
    };

    handleCallback();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <div className="h-40 w-40 animate-spin rounded-full border-4 border-orange-300 border-t-transparent" />
        <p className="text-md text-gray-500">{status}</p>
      </div>
    </main>
  );
};

export default KakaoCallbackPage;
