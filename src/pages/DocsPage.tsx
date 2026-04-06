import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MasterDetailLayout } from "@sudobility/components";
import ScreenContainer from "../components/layout/ScreenContainer";
import { useSetPageConfig } from "../hooks/usePageConfig";

type DocSection = "getting-started" | "device-setup" | "api-reference";

const sidebarItems: { id: DocSection; label: string }[] = [
  { id: "getting-started", label: "Getting Started" },
  { id: "device-setup", label: "Device Setup" },
  { id: "api-reference", label: "API Reference" },
];

function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { section } = useParams<{ section?: string }>();
  const currentSection = section || "getting-started";

  return (
    <nav className="p-4 space-y-1">
      {sidebarItems.map((item) => (
        <Link
          key={item.id}
          to={`/docs/${item.id}`}
          onClick={onNavigate}
          className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
            currentSection === item.id
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function GettingStartedContent() {
  const steps = [
    { title: "Create Your Account", description: "Sign up with email or Google. You'll be prompted to accept the terms of service and create your first workspace." },
    { title: "Add a Location", description: "Go to Locations and add your first business location with address details." },
    { title: "Define Device Models", description: "Create device models (e.g., 'Standard Washer') with pricing strategy, slot mode, and action type." },
    { title: "Add Offerings", description: "Assign device instances to locations. Configure individual pricing and generate QR codes." },
    { title: "Start Accepting Payments", description: "Print QR codes and place them on your devices. Customers scan to pay and start their session." },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <p className="text-gray-600">
        Get up and running with Tapayoka in five simple steps.
      </p>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceSetupContent() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Device Models</h2>
        <p className="text-gray-600 mb-4">
          Device models define the type and behavior of your machines. Each model specifies:
        </p>
        <div className="space-y-3">
          {[
            { name: "Type", description: "Washer, Dryer, Parking, Locker, or Vending" },
            { name: "Pricing", description: "Fixed (one-time) or Variable (time-based)" },
            { name: "Slot Mode", description: "Single (one customer at a time) or Multi (concurrent users)" },
            { name: "Action", description: "Timed (runs for a duration) or Sequence (step-by-step)" },
            { name: "Interruption", description: "Stop or Continue when payment expires (timed actions only)" },
            { name: "Payment", description: "At Start (pre-pay) or At End (post-pay)" },
          ].map((item) => (
            <div key={item.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <code className="text-sm font-mono text-blue-600">{item.name}</code>
              <p className="mt-1 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">BLE Protocol</h2>
        <p className="text-gray-600">
          Tapayoka uses Bluetooth Low Energy (BLE) to communicate between the Raspberry Pi
          controller and customer devices. The Pi advertises a GATT service that handles
          session initiation, payment verification, and device control signals.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Offerings</h2>
        <p className="text-gray-600">
          Offerings are individual device instances assigned to a location or model.
          Each offering can override the model&apos;s default pricing with custom
          pricing configurations (variable, fixed, or multi-slot).
        </p>
      </div>
    </div>
  );
}

function ApiReferenceContent() {
  return (
    <div className="space-y-8 max-w-3xl">
      <p className="text-gray-600">
        The Tapayoka API provides RESTful endpoints for managing locations, models,
        offerings, and orders.
      </p>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Endpoints</h2>
        <div className="space-y-3">
          {[
            { method: "GET", path: "/api/v1/vendor/locations", description: "List all locations" },
            { method: "POST", path: "/api/v1/vendor/locations", description: "Create a location" },
            { method: "GET", path: "/api/v1/vendor/models", description: "List all device models" },
            { method: "POST", path: "/api/v1/vendor/models", description: "Create a device model" },
            { method: "GET", path: "/api/v1/vendor/offerings", description: "List offerings" },
            { method: "GET", path: "/api/v1/vendor/orders", description: "List orders" },
          ].map((endpoint) => (
            <div key={`${endpoint.method}-${endpoint.path}`} className="p-4 bg-gray-50 rounded-lg font-mono text-sm border border-gray-200">
              <span className={endpoint.method === "GET" ? "text-green-600" : "text-blue-600"}>
                {endpoint.method}
              </span>{" "}
              <span className="text-gray-900">{endpoint.path}</span>
              <p className="mt-1 font-sans text-gray-600 text-sm">{endpoint.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">WebSocket Protocol</h2>
        <p className="text-gray-600 mb-4">
          Real-time updates are delivered via WebSocket connections. Subscribe to order
          status changes and device state updates.
        </p>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <code className="text-sm font-mono text-purple-600">
            ws://api.tapayoka.com/ws/v1/vendor/events
          </code>
          <p className="mt-1 text-sm text-gray-600">
            Connects to the real-time event stream for your workspace.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h2>
        <p className="text-gray-600">
          All API requests require a Firebase ID token in the Authorization header:
        </p>
        <div className="mt-3 p-4 bg-gray-900 rounded-lg text-gray-100 text-sm font-mono overflow-x-auto">
          {`Authorization: Bearer <firebase-id-token>`}
        </div>
      </div>
    </div>
  );
}

function DocsPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState<"navigation" | "content">("navigation");
  useSetPageConfig({ scrollable: false, contentPadding: "sm", maxWidth: "7xl" });

  const currentSection = (section as DocSection) || "getting-started";

  useEffect(() => {
    if (!section) {
      navigate("/docs/getting-started", { replace: true });
    }
  }, [section, navigate]);

  const handleBackToNavigation = () => {
    setMobileView("navigation");
  };

  const handleNavigate = () => {
    setMobileView("content");
  };

  const getDetailTitle = () => {
    switch (currentSection) {
      case "getting-started":
        return "Getting Started";
      case "device-setup":
        return "Device Setup";
      case "api-reference":
        return "API Reference";
      default:
        return "Documentation";
    }
  };

  const masterContent = <DocsSidebar onNavigate={handleNavigate} />;

  const detailContent = (
    <div className="p-6">
      {currentSection === "getting-started" && <GettingStartedContent />}
      {currentSection === "device-setup" && <DeviceSetupContent />}
      {currentSection === "api-reference" && <ApiReferenceContent />}
    </div>
  );

  return (
    <ScreenContainer footerVariant="full">
      <div className="w-full min-w-0 overflow-x-hidden flex-1 flex flex-col min-h-0">
        <MasterDetailLayout
          masterTitle="Documentation"
          backButtonText="Documentation"
          masterContent={masterContent}
          detailContent={detailContent}
          detailTitle={getDetailTitle()}
          mobileView={mobileView}
          onBackToNavigation={handleBackToNavigation}
          enableAnimations={true}
          animationDuration={150}
          masterWidth={260}
          stickyTopOffset={80}
        />
      </div>
    </ScreenContainer>
  );
}

export default DocsPage;
