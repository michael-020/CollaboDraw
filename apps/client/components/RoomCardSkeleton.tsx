const RoomCardSkeleton = () => {
  return (
    <div className="bg-neutral-800/50 rounded-xl p-4 flex flex-col gap-4 animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 bg-neutral-700/50 rounded-md w-3/4"></div>
      
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-neutral-700/50 rounded-md w-full"></div>
        <div className="h-4 bg-neutral-700/50 rounded-md w-5/6"></div>
      </div>
      
      {/* Button skeleton */}
      <div className="mt-auto pt-4 flex gap-2">
        <div className="h-9 bg-neutral-700/50 rounded-lg w-2/3"></div>
        <div className="h-9 bg-neutral-700/50 rounded-lg w-1/3"></div>
      </div>
    </div>
  );
};

export default RoomCardSkeleton;