// components/ReflectionSkeleton.tsx
export function ReflectiveSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1,2,3].map(i => (
        <div key={i} className="p-6 border rounded-xl bg-white shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-5 gap-4">
            {[1,2,3,4,5].map(j => (
              <div key={j} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
