import Image from 'next/image';
import React from 'react';

import { usePopupStore } from '@/shared/store/popupStore';
import { getExperienceLabel } from '@/shared/utils/application';
import { formatPhoneNumber } from '@/shared/utils/format';

import { useResumeDownloadMutation } from '../../queries/queries';
import { ApplicationResponse } from '../../types/application';

interface ApplicationProfileProps {
  data: ApplicationResponse;
}

const ApplicationProfile = ({ data }: ApplicationProfileProps) => {
  const { name, phoneNumber, experienceMonths, introduction } = data;
  const { showPopup } = usePopupStore();

  const downloadMutation = useResumeDownloadMutation({
    onSuccess: () => {
      showPopup('이력서 다운로드가 완료되었습니다.', 'success');
    },
    onError: () => {
      showPopup('이력서 다운로드에 실패했습니다.', 'error');
    },
  });

  const handleDownloadResume = async () => {
    if (!data.resumeId) {
      showPopup('다운로드에 필요한 정보가 부족합니다.', 'info');
      return;
    }

    downloadMutation.mutate(data.resumeId);
  };

  return (
    <div>
      <h2 className="my-16 text-2lg font-semibold">제출 내용</h2>
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0">
        <div className="space-y-6">
          {/* 이름 */}
          <div className="flex items-center justify-between border-b border-gray-200 py-14">
            <span className="text-gray-500 dark:text-gray-400">이름</span>
            <span className="font-medium">{name}</span>
          </div>

          {/* 연락처 */}
          <div className="flex items-center justify-between border-b border-gray-200 py-14">
            <span className="text-gray-400">연락처</span>
            <span className="font-medium">
              {formatPhoneNumber(phoneNumber)}
            </span>
          </div>

          {/* 경력 */}
          <div className="flex items-center justify-between border-b border-gray-200 py-14">
            <span className="text-gray-400">경력</span>
            <span className="font-medium">
              {getExperienceLabel(experienceMonths)}
            </span>
          </div>

          {/* 이력서 */}
          <div className="py-4">
            <div className="mb-4 py-14 text-gray-400">이력서</div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-14">
              <span className="text-gray-700">{name}_이력서</span>
              <button
                aria-label="이력서 다운로드"
                className="flex"
                disabled={downloadMutation.isPending}
                type="button"
                onClick={handleDownloadResume}
              >
                <Image
                  alt="다운로드 아이콘"
                  className={downloadMutation.isPending ? 'opacity-50' : ''}
                  height={24}
                  src="/icons/download.svg"
                  width={24}
                />
              </button>
            </div>
          </div>

          {/* 자기소개 */}
          <div className="py-4">
            <div className="mb-4 py-14 text-gray-400">자기소개</div>
            <div className="rounded-lg bg-gray-50 p-14">
              <p className="text-md leading-relaxed whitespace-pre-wrap text-black-400">
                {introduction || '자기소개가 작성되지 않았습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationProfile;
