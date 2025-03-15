export function ImageGallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-md" />{" "}
      {/* Back button */}
      <div className="aspect-square w-full bg-slate-100 animate-pulse rounded-lg min-h-[400px]" />{" "}
      {/* Main image */}
      <div className="flex gap-2 overflow-auto py-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-20 flex-shrink-0 bg-slate-100 animate-pulse rounded-md"
          />
        ))}
      </div>
    </div>
  );
}

export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-10 w-3/4 bg-slate-100 animate-pulse rounded-md mb-3" />{" "}
        {/* Title */}
        <div className="h-7 w-32 bg-slate-100 animate-pulse rounded-md mb-3" />{" "}
        {/* Category */}
        <div className="h-8 w-40 bg-slate-100 animate-pulse rounded-md" />{" "}
        {/* Price */}
      </div>
      {/* Description section */}
      <div className="h-[1px] bg-slate-100 w-full my-6" /> {/* Separator */}
      <div className="space-y-4">
        <div className="h-7 w-32 bg-slate-100 animate-pulse rounded-md" />{" "}
        {/* Heading */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 animate-pulse rounded-md" />
          <div className="h-4 w-full bg-slate-100 animate-pulse rounded-md" />
          <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded-md" />
          <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded-md" />
        </div>
      </div>
      {/* Tags section */}
      <div className="space-y-3">
        <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-md" />{" "}
        {/* Tags heading */}
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 bg-slate-100 animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
      {/* What You'll Get card */}
      <div className="border border-slate-100 rounded-lg p-6 space-y-3">
        <div className="h-6 w-48 bg-slate-100 animate-pulse rounded-md" />{" "}
        {/* Card heading */}
        <div className="space-y-3 mt-3">
          <div className="h-5 w-3/4 bg-slate-100 animate-pulse rounded-md" />
          <div className="h-5 w-1/2 bg-slate-100 animate-pulse rounded-md" />
        </div>
      </div>
      {/* Buttons */}
      <div className="pt-4 space-y-3">
        <div className="h-12 w-full bg-slate-100 animate-pulse rounded-md" />{" "}
        {/* Buy Now button */}
        <div className="h-12 w-full bg-slate-100 animate-pulse rounded-md" />{" "}
        {/* Add to Cart button */}
      </div>
    </div>
  );
}

export function ProductDescriptionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-7 w-32 bg-slate-100 animate-pulse rounded-md mb-2" />{" "}
      {/* Heading */}
      <div className="space-y-2">
        <div className="h-5 w-full bg-slate-100 animate-pulse rounded-md" />
        <div className="h-5 w-full bg-slate-100 animate-pulse rounded-md" />
        <div className="h-5 w-full bg-slate-100 animate-pulse rounded-md" />
        <div className="h-5 w-3/4 bg-slate-100 animate-pulse rounded-md" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Mobile back button */}
      <div className="lg:hidden mb-2 col-span-1">
        <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-md" />
      </div>

      <div className="lg:col-span-3">
        <ImageGallerySkeleton />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <ProductInfoSkeleton />
      </div>
    </div>
  );
}

export const ProductCardSkeleton = () => {
  return (
    <div className="rounded-2xl pt-3 border border-muted bg-card shadow-sm transition-all duration-200 overflow-hidden h-full min-h-[380px] flex flex-col">
      {/* Header section */}
      <div className="px-6 pb-3">
        <div className="h-7 w-3/4 bg-slate-100 animate-pulse rounded-md mb-2" />
        {/* Title */}
        <div className="h-5 w-1/3 bg-slate-100 animate-pulse rounded-md" />
        {/* Category */}
      </div>

      {/* Content section - Image */}
      <div className="px-6 pb-5 flex-grow flex items-center justify-center">
        <div className="w-5/6 aspect-square bg-stone-200 animate-pulse rounded-md min-h-[220px]" />
      </div>

      {/* Footer section - Button */}
      <div className="px-6 pt-0 pb-4 flex justify-center mt-auto">
        <div className="h-10 w-36 bg-slate-100 rounded-md animate-pulse" />
        {/* Button with price */}
      </div>
    </div>
  );
};

export const ProductsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-10 md:gap-10 md:mx-20">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
