'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

import PrimaryButton from '@/shared/components/common/button/PrimaryButton';
import InnerContainer from '@/shared/components/container/InnerContainer';
import { usePopupStore } from '@/shared/store/popupStore';

type Role = 'APPLICANT' | 'OWNER';

const KakaoSignupPage = () => {
  const router = useRouter();
  const { showPopup } = usePopupStore();

  const [kakaoCode, setKakaoCode] = useState<string | null>(null);
  const [kakaoRedirectUri, setKakaoRedirectUri] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('APPLICANT');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storePhoneNumber, setStorePhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const code = sessionStorage.getItem('kakaoCode');
    const redirectUri = sessionStorage.getItem('kakaoRedirectUri');

    if (!code || !redirectUri) {
      showPopup('잘못된 접근입니다. 다시 로그인해주세요.', 'error');
      router.replace('/signin?type=applicant');
      return;
    }

    setKakaoCode(code);
    setKakaoRedirectUri(redirectUri);
  }, []);

  const isOwner = role === 'OWNER';

  const isFormValid =
    name.trim() !== '' &&
    nickname.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    (!isOwner || (storeName.trim() !== '' && storePhoneNumber.trim() !== ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting || !kakaoCode || !kakaoRedirectUri) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/oauth/kakao/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: kakaoCode,
          redirectUri: kakaoRedirectUri,
          role,
          name,
          nickname,
          phoneNumber,
          storeName: isOwner ? storeName : '',
          storePhoneNumber: isOwner ? storePhoneNumber : '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showPopup(errorData.error || '회원가입에 실패했습니다.', 'error');
        return;
      }

      const data = await response.json();

      // sessionStorage 정리
      sessionStorage.removeItem('kakaoCode');
      sessionStorage.removeItem('kakaoRedirectUri');

      // NextAuth 세션 생성
      const signInResult = await signIn('kakao-register', {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userDataJson: JSON.stringify(data.user),
        redirect: false,
      });

      if (signInResult?.error) {
        showPopup('세션 생성 중 오류가 발생했습니다.', 'error');
        return;
      }

      showPopup('회원가입이 완료되었습니다!', 'success');
      setTimeout(() => {
        router.push('/albalist');
      }, 1000);
    } catch (error) {
      console.error('Kakao 회원가입 오류:', error);
      showPopup('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-line-100 bg-white px-16 py-14 text-md outline-none transition-colors focus:border-orange-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white';
  const labelClass =
    'mb-8 block text-sm font-medium text-gray-700 dark:text-gray-300';

  if (!kakaoCode) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main>
      <InnerContainer
        className="flex flex-col gap-48 py-94 md:pt-130 lg:pt-200"
        size="sm"
      >
        <div className="flex flex-col gap-8">
          <h1 className="text-2xl font-bold text-black lg:text-3xl dark:text-white">
            추가 정보 입력
          </h1>
          <p className="text-md text-gray-500">
            카카오 회원가입을 완료하려면 추가 정보가 필요합니다.
          </p>
        </div>

        <form className="flex flex-col gap-24" onSubmit={handleSubmit}>
          {/* 역할 선택 */}
          <div>
            <p className={labelClass}>회원 유형</p>
            <div className="flex gap-12">
              <button
                className={`flex-1 rounded-lg border py-14 text-md font-medium transition-colors ${
                  role === 'APPLICANT'
                    ? 'border-orange-300 bg-orange-50 text-orange-400 dark:bg-orange-900/20'
                    : 'border-line-100 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                }`}
                type="button"
                onClick={() => setRole('APPLICANT')}
              >
                지원자
              </button>
              <button
                className={`flex-1 rounded-lg border py-14 text-md font-medium transition-colors ${
                  role === 'OWNER'
                    ? 'border-orange-300 bg-orange-50 text-orange-400 dark:bg-orange-900/20'
                    : 'border-line-100 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                }`}
                type="button"
                onClick={() => setRole('OWNER')}
              >
                사장님
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="name">
              이름 <span className="text-orange-400">*</span>
            </label>
            <input
              required
              className={inputClass}
              id="name"
              placeholder="이름을 입력해주세요"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="nickname">
              닉네임 <span className="text-orange-400">*</span>
            </label>
            <input
              required
              className={inputClass}
              id="nickname"
              placeholder="닉네임을 입력해주세요"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="phoneNumber">
              전화번호 <span className="text-orange-400">*</span>
            </label>
            <input
              required
              className={inputClass}
              id="phoneNumber"
              placeholder="01012345678"
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>

          {isOwner && (
            <>
              <div>
                <label className={labelClass} htmlFor="storeName">
                  가게 이름 <span className="text-orange-400">*</span>
                </label>
                <input
                  className={inputClass}
                  id="storeName"
                  placeholder="가게 이름을 입력해주세요"
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="storePhoneNumber">
                  가게 전화번호 <span className="text-orange-400">*</span>
                </label>
                <input
                  className={inputClass}
                  id="storePhoneNumber"
                  placeholder="021234567"
                  type="tel"
                  value={storePhoneNumber}
                  onChange={e => setStorePhoneNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <PrimaryButton
            className="mt-8 h-58 w-full"
            disabled={!isFormValid || isSubmitting}
            label={isSubmitting ? '처리 중...' : '카카오 회원가입 완료'}
            type="submit"
            variant="solid"
          />
        </form>
      </InnerContainer>
    </main>
  );
};

export default KakaoSignupPage;
