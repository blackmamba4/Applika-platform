// app/pricing/success/page.tsx
export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto p-8 space-y-3">
      <h1 className="text-2xl font-bold">All set ✅</h1>
      <p>Your purchase is complete. It may take a few seconds to show up.</p>
      <a
        href="/Dashboard"
        className="inline-block mt-2 rounded-full bg-emerald-500 text-white px-4 py-2 text-sm"
      >
        Go to dashboard
      </a>
    </div>
  );
}
