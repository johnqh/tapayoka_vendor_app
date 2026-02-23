export function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Add Service
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
        No services configured. Create services to assign to your devices.
      </div>
    </div>
  );
}
