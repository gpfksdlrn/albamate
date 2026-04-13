'use client';

import AlbaDescription from '@alba/AlbaDescription';
import AlbaDetail from '@alba/AlbaDetail';

import AlbaLocation from '@/features/alba/components/AlbaLocation';

import { AlbaItem } from '../types/AlbaItem';
import AlbaCondition from './AlbaCondition';
import AlbaContact from './AlbaContact';
import AlbaInfo from './AlbaInfo';
import ApplyButton from './button/ApplyButton';

interface PageContentProps {
  item: AlbaItem;
  isOwner: boolean;
}

const PageContent = ({ item, isOwner }: PageContentProps) => {
  return (
    <div className="mx-auto flex flex-col gap-32 lg:grid lg:grid-cols-12 lg:gap-32">
      {/* 왼쪽 열 - flex-col 기본, lg 이상일 때 grid col-span 적용 */}
      <div className="flex flex-col gap-32 lg:col-span-6">
        <AlbaDetail item={item} />

        {/* md 이하에서만 보이게 (AlbaDetail 바로 아래에 배치) */}
        <div className="block lg:hidden">
          <div className="flex flex-col gap-20">
            <AlbaInfo item={item} />
            <AlbaContact item={item} />
          </div>
        </div>

        <AlbaDescription description={item.description} />
        <AlbaLocation location={item.location} />
      </div>

      {/* 오른쪽 열 */}
      <div className="flex flex-col gap-32 lg:col-span-6">
        {/* lg 이상에서만 보이게 (기존 위치 유지) */}
        <div className="hidden lg:block">
          <div className="flex flex-col gap-36">
            <AlbaInfo item={item} />
            <AlbaContact item={item} />
          </div>
        </div>

        {/* Apply 버튼은 화면 크기에 따라 자동 분기 */}
        <ApplyButton
          id={item.id}
          isOwner={isOwner}
          recruitmentEndDate={item.recruitmentEndDate}
        />

        <AlbaCondition item={item} />
      </div>
    </div>
  );
};

export default PageContent;
