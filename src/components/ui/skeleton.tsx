import cn from "classnames";


const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse bg-base-300 rounded-md", className)}
      {...props}
    />
  );
};

export { Skeleton };

// Variant components for specific use cases
const BannerSkeleton = () => (
  <Skeleton className="w-full h-64 md:h-96 rounded-box" />
);

const InfoCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-5 w-3/4 rounded" />
    <Skeleton className="h-4 w-1/2 rounded" />
  </div>
);

const QuickLinkSkeleton = () => (
  <div className="space-y-2 flex flex-col items-center">
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="h-4 w-16 rounded" />
  </div>
);

export { BannerSkeleton, InfoCardSkeleton, QuickLinkSkeleton };