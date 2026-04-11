const AlbaSkeleton = () => {
  return (
    <div className="mx-auto flex w-full max-w-375 min-w-320 flex-col gap-40 py-120 text-sm lg:max-w-7xl lg:gap-80 lg:text-lg">
      {/* 이미지 캐러셀 영역 */}
      <div className="h-260 w-full animate-pulse rounded-md bg-gray-200 lg:h-500 dark:bg-gray-700" />

      {/* PageContent 메인 영역 - 반응형 그리드 */}
      <div className="flex flex-col gap-32 lg:grid lg:grid-cols-12 lg:gap-32">
        {/* 왼쪽 열 */}
        <div className="flex flex-col gap-32 lg:col-span-6">
          {/* AlbaDetail 스켈레톤 */}
          <div className="flex flex-col gap-16">
            <div className="h-28 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-20 w-3/4 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-16 w-1/2 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* md 이하에서만 보이는 AlbaInfo + AlbaContact */}
          <div className="block lg:hidden">
            <div className="flex flex-col gap-20">
              {/* AlbaInfo 스켈레톤 */}
              <div className="flex flex-col gap-12">
                <div className="h-80 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-60 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
              {/* AlbaContact 스켈레톤 */}
              <div className="h-112 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* AlbaDescription 스켈레톤 */}
          <div className="flex flex-col gap-12">
            <div className="h-24 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-153 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* AlbaLocation 스켈레톤 */}
          <div className="flex flex-col gap-12">
            <div className="h-24 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-120 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* 오른쪽 열 */}
        <div className="flex flex-col gap-32 lg:col-span-6">
          {/* lg 이상에서만 보이는 AlbaInfo + AlbaContact */}
          <div className="hidden lg:block">
            <div className="flex flex-col gap-36">
              {/* AlbaInfo 스켈레톤 */}
              <div className="flex flex-col gap-12">
                <div className="h-80 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-60 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
              {/* AlbaContact 스켈레톤 */}
              <div className="h-112 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* ApplyButton 스켈레톤 */}
          <div className="h-58 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />

          {/* AlbaCondition 스켈레톤 */}
          <div className="flex flex-col gap-12">
            <div className="h-24 w-28 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-196 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* 구분선 + ApplicationList 영역 (소유자일 때만) */}
      <div className="flex flex-col gap-40 lg:gap-80">
        <div className="h-8 w-full bg-gray-100 lg:h-12 dark:bg-gray-700" />
        <div className="h-310 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

export default AlbaSkeleton;
