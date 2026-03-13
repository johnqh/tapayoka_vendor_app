export function InstallationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Add Installation
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
        No installations configured. Create installations to assign to your devices.
      </div>
    </div>
  );
}
