import { useMemo } from 'react';

import AlbaCardSkeleton from './AlbaCardSkeleton';

const AlbaListSkeleton = ({ count = 6 }: { count?: number }) => {
  const skeletonIds = useMemo(
    () => Array.from({ length: count }, () => crypto.randomUUID()),
    [count]
  );

  return (
    <div className="mb-68">
      <div className="mb-24 flex flex-col gap-16 px-16 py-20">
        <div className="h-48 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex gap-12">
          <div className="h-40 w-80 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-40 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-40 w-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-40 w-72 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-32 sm:grid-cols-2 md:gap-x-24 md:gap-y-48 lg:grid-cols-3 lg:gap-y-64">
        {skeletonIds.map(id => (
          <AlbaCardSkeleton key={id} />
        ))}
      </div>
    </div>
  );
};

export default AlbaListSkeleton;
