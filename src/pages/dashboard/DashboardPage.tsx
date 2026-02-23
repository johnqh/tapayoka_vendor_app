export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Total Devices', 'Active Orders', 'Revenue Today', 'Success Rate'].map(title => (
          <div key={title} className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          </div>
        ))}
      </div>
    </div>
  );
}
