import { useMemo } from 'react';

import AlbaCardSkeleton from './AlbaCardSkeleton';

const LoadMoreSkeleton = () => {
  const skeletonKeys = useMemo(
    () => Array.from({ length: 6 }, () => `${Date.now()}-${Math.random()}`),
    []
  );

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-32 sm:grid-cols-2 md:gap-x-24 md:gap-y-48 lg:grid-cols-3 lg:gap-y-64">
      {skeletonKeys.map(key => (
        <AlbaCardSkeleton key={key} />
      ))}
    </div>
  );
};

export default LoadMoreSkeleton;
