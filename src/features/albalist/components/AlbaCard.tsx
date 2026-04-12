'use client';

import AlbaCardItem from '@common/list/AlbaCardItem';
import { useRouter } from 'next/navigation';

import type { AlbaItem } from '@/shared/types/alba';

interface Props {
  item: AlbaItem;
}

const AlbaCard = ({ item }: Props) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/alba/${item.id}`);
  };

  const dropdownOptions = [
    {
      label: '지원하기',
      onClick: () => router.push(`/apply/${item.id}`),
    },
  ];

  return (
    <AlbaCardItem
      dropdownOptions={dropdownOptions}
      item={item}
      onClick={handleCardClick}
    />
  );
};

export default AlbaCard;
