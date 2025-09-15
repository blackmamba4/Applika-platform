export default function Loading() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-10 w-full bg-gray-100 rounded mb-4" />
      <div className="h-[60vh] w-full bg-gray-100 rounded" />
    </div>
  );
}