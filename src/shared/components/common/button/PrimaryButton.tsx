import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

import ButtonBase from './ButtonBase';

/**
 * PrimaryButton 컴포넌트
 *
 * @description
 * 프로젝트 전반에서 공통적으로 사용하는 기본 버튼 컴포넌트입니다.
 * variant, size, icon 등의 조합을 통해 다양한 형태로 확장할 수 있으며,
 * 반응형 대응 및 스타일 유연성을 고려해 설계되었습니다.
 *
 * @example
 * ```tsx
 * // 텍스트만 있는 버튼
 * <PrimaryButton
 *   variant="solid"
 *   className="px-4 py-2 text-sm"
 *   label="확인"
 *   type="button"
 *   onClick={() => alert('클릭됨')}
 * />
 *
 * // 아이콘과 텍스트가 함께 있는 버튼
 * <PrimaryButton
 *   variant="outline"
 *   className="px-4 py-2 text-sm"
 *   label="삭제"
 *   iconSrc="/icons/trash.svg"
 *   type="button"
 * />
 *
 * // 반응형으로 텍스트를 숨기는 버튼 (모바일에선 아이콘만 표시)
 * <PrimaryButton
 *   variant="solid"
 *   className="p-2"
 *   iconSrc="/icons/menu.svg"
 *   responsiveLabel={true}
 *   type="button"
 * />
 * ```
 *
 * @param variant - 버튼의 스타일 타입 (`solid`, `outline`, `cancelSolid`, `cancelOutline`)
 * @param className - Tailwind 클래스 문자열 (크기, 여백, 색상 등의 스타일 조정용)
 * @param label - 버튼에 표시될 텍스트 (생략 가능)
 * @param disabled - 버튼 비활성화 여부 (true일 경우 클릭 불가)
 * @param type - HTML 버튼 타입 (`button` | `submit` | `reset`)
 * @param iconSrc - 버튼 앞에 표시할 이미지 아이콘 경로 (Next.js `Image` 컴포넌트 사용)
 * @param responsiveLabel - true일 경우 작은 화면에서 텍스트를 숨기고 아이콘만 표시
 * @param onClick - 버튼 클릭 시 실행될 이벤트 핸들러 함수
 */

// 버튼의 스타일 담당
interface ButtonProps {
  variant: 'solid' | 'outline' | 'cancelSolid' | 'cancelOutline'; // Variant로 버튼 스타일 구분 기본값은 'solid'
  className: string; // className로 버튼 크기 및 텍스트 사이즈, 색상 등  추가 스타일 추가 가능
  label?: string; // 버튼에 표시될 텍스트
  disabled?: boolean; // disabled 상태 여부
  type: 'button' | 'submit' | 'reset';
  iconSrc?: string; // 아이콘 이미지 경로
  responsiveLabel?: boolean; // 반응형 레이블 여부
  onClick?: () => void;
}

const PrimaryButton = ({
  variant = 'solid',
  className,
  label,
  disabled = false,
  type,
  iconSrc,
  responsiveLabel = false,
  onClick,
}: ButtonProps) => {
  // 공통 base 스타일 정의
  const baseStyles =
    'rounded-lg font-semibold transition-colors duration-200 ease-in-out flex items-center justify-center text-center gap-1 cursor-pointer disabled:cursor-default';

  // variant별 스타일 정의
  const solidStyles =
    'bg-mint-300 dark:bg-mint-350 hover:bg-mint-400 text-gray-25 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100 dark:disabled:bg-gray-100';
  const outlineStyles =
    'border border-mint-300 dark:border-mint-350 hover:border-mint-400 text-mint-300 hover:text-mint-400 bg-transparent disabled:border-gray-100 disabled:hover:border-gray-100 disabled:text-gray-100 disabled:hover:text-gray-100 dark:disabled:bg-gray-100';
  const cancelSolidStyles = 'bg-gray-100 text-gray-25';
  const cancelOutlineStyles =
    'border border-gray-100 text-gray-100  bg-transparent';

  // variant에 따라 스타일 매핑
  const buttonStyle = {
    solid: solidStyles,
    outline: outlineStyles,
    cancelSolid: cancelSolidStyles,
    cancelOutline: cancelOutlineStyles,
  };

  // 최종으로 적용될 클래스 병합
  const finalStyles = cn(baseStyles, buttonStyle[variant], className);

  // responsiveLabel 여부에 따라 숨김 처리
  const labelStyles = responsiveLabel ? 'hidden' : 'inline-flex';

  return (
    <ButtonBase
      className={finalStyles}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {/* iconSrc 여부에 따라 아이콘 표시 */}
      {iconSrc && (
        <span className="relative inline-flex h-24 w-24 items-center justify-center lg:h-36 lg:w-36">
          <Image fill alt="icon" sizes="36px" src={iconSrc} />
        </span>
      )}
      <span className={labelStyles}>{label}</span>
    </ButtonBase>
  );
};

export default PrimaryButton;
