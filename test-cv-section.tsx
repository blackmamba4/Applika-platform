export default function TestCVSection() {
  return (
    <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-500">
      <h3 className="text-lg font-bold text-blue-800">CV Section Test</h3>
      <p className="text-blue-600">If you can see this, the file system is working!</p>
      <div className="mt-2">
        <label className="block text-sm font-medium mb-2">CV</label>
        <div className="flex items-center gap-6 text-sm mb-2">
          <button className="pb-1 text-blue-600 font-semibold border-b-2 border-blue-500">Auto</button>
          <button className="pb-1 text-gray-500">Manual</button>
        </div>
        <div className="rounded-xl border px-3 py-2 text-sm bg-gray-50 text-gray-600">
          Using your uploaded CV from profile
        </div>
      </div>
    </div>
  );
}
