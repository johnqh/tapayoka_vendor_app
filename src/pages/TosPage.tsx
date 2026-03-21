import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TapayokaClient } from "@sudobility/tapayoka_client";
import { useApi } from "@sudobility/building_blocks/firebase";
import { useAuthStatus } from "@sudobility/auth-components";
import ScreenContainer from "../components/layout/ScreenContainer";

function TosPage() {
  const navigate = useNavigate();
  const { networkClient, baseUrl, token } = useApi();
  const { user } = useAuthStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suppress unused variable warning
  void user;

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const client = new TapayokaClient({ networkClient, baseUrl });
      await client.acceptTosAndCreateEntity({ acceptTos: true }, token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept terms. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6 mb-8">
          <p className="text-gray-600">
            Welcome to Tapayoka. By using this application, you agree to the
            following terms and conditions.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using the Tapayoka vendor platform, you agree to be
              bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Use of Service</h2>
            <p className="text-gray-600">
              You agree to use the service only for lawful purposes and in accordance
              with these terms. You are responsible for maintaining the security of
              your account credentials.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Vendor Responsibilities</h2>
            <p className="text-gray-600">
              As a vendor, you are responsible for the accuracy of your service
              listings, pricing, and device configurations. You agree to provide
              services as described and maintain your installation in working order.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Privacy</h2>
            <p className="text-gray-600">
              Your privacy is important to us. We collect and process data as
              described in our Privacy Policy, which is incorporated into these terms
              by reference.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Limitation of Liability</h2>
            <p className="text-gray-600">
              Tapayoka shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of the service.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate("/login")}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : "Accept & Continue"}
          </button>
        </div>
      </div>
    </ScreenContainer>
  );
}

export default TosPage;
