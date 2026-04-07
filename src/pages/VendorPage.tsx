import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@sudobility/auth-components';

const sections = [
  {
    title: 'Device Management',
    description:
      'Register and configure all your devices from one central dashboard. Support for washers, dryers, parking meters, lockers, and vending machines. Set pricing strategies, slot modes, and operating schedules per device model.',
    items: [
      'Define device models with custom pricing (fixed or timed)',
      'Assign devices to locations with unique configurations',
      'Set daily operating schedules per model',
      'Track device status in real-time',
    ],
  },
  {
    title: 'Payment Processing',
    description:
      'Accept contactless QR code payments without requiring customers to download an app. Customers simply scan, pay, and use the service.',
    items: [
      'Generate QR codes for each offering',
      'Support both pre-pay and post-pay models',
      'Real-time payment confirmation via BLE',
      'Automatic receipt generation',
    ],
  },
  {
    title: 'Multi-Location Support',
    description:
      'Manage multiple business locations from a single account. Each location can have its own set of devices with independent configurations.',
    items: [
      'Add unlimited locations with address details',
      'Manage offerings per location',
      'View location-specific analytics',
      'Invite team members to specific workspaces',
    ],
  },
  {
    title: 'Analytics & Reporting',
    description:
      'Track revenue, order volume, and device utilization across all your locations. Make data-driven decisions to optimize your business.',
    items: [
      'Real-time order monitoring with status tracking',
      'Revenue reporting by location and device',
      'Device utilization metrics',
      'Export data for accounting',
    ],
  },
];

function VendorPage() {
  const navigate = useNavigate();
  const { user } = useAuthStatus();

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Built for Vendors</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Everything you need to manage your self-service business — from device configuration to
            payment collection.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className={`flex flex-col lg:flex-row gap-8 items-start ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-gray-600 mb-6">{section.description}</p>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
                <span className="text-gray-400 text-sm">{section.title} illustration</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Managing Your Devices Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your account and add your first location in minutes.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
          </button>
        </div>
      </section>
    </>
  );
}

export default VendorPage;
