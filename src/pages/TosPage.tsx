import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TapayokaClient } from '@sudobility/tapayoka_client';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui, buttonVariant, colors } from '@sudobility/design';
import { analyticsService } from '../config/analytics';

function TosPage() {
  const navigate = useNavigate();
  const { networkClient, baseUrl, token } = useApi();
  const { user } = useAuthStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suppress unused variable warning
  void user;

  useEffect(() => {
    analyticsService.trackPageView('/tos', 'Terms of Service');
  }, []);

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    analyticsService.trackButtonClick('accept_tos');
    try {
      const client = new TapayokaClient({ networkClient, baseUrl });
      await client.acceptTosAndCreateEntity({ acceptTos: true }, token);
      analyticsService.trackEvent('tos_accepted');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to accept terms. Please try again.';
      analyticsService.trackError(errorMessage, 'tos_accept_failed');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
      <h1 className={`${ui.text.h1} mb-8`}>Terms of Service</h1>

      <div className={`${ui.card.bordered} p-8 space-y-6 mb-8`}>
        <p className={ui.text.body}>
          Welcome to Tapayoka. By using this application, you agree to the following terms and
          conditions.
        </p>

        <div>
          <h2 className={`${ui.text.h5} mb-2`}>1. Acceptance of Terms</h2>
          <p className={ui.text.body}>
            By accessing or using the Tapayoka vendor platform, you agree to be bound by these Terms
            of Service and all applicable laws and regulations.
          </p>
        </div>

        <div>
          <h2 className={`${ui.text.h5} mb-2`}>2. Use of Service</h2>
          <p className={ui.text.body}>
            You agree to use the service only for lawful purposes and in accordance with these
            terms. You are responsible for maintaining the security of your account credentials.
          </p>
        </div>

        <div>
          <h2 className={`${ui.text.h5} mb-2`}>3. Vendor Responsibilities</h2>
          <p className={ui.text.body}>
            As a vendor, you are responsible for the accuracy of your service listings, pricing, and
            device configurations. You agree to provide services as described and maintain your
            installation in working order.
          </p>
        </div>

        <div>
          <h2 className={`${ui.text.h5} mb-2`}>4. Privacy</h2>
          <p className={ui.text.body}>
            Your privacy is important to us. We collect and process data as described in our Privacy
            Policy, which is incorporated into these terms by reference.
          </p>
        </div>

        <div>
          <h2 className={`${ui.text.h5} mb-2`}>5. Limitation of Liability</h2>
          <p className={ui.text.body}>
            Tapayoka shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages resulting from your use of the service.
          </p>
        </div>
      </div>

      {error && (
        <div
          className={`px-4 py-3 rounded-lg mb-4 border ${colors.component.alert.error.base} ${colors.component.alert.error.dark}`}
        >
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            analyticsService.trackButtonClick('tos_cancel');
            navigate('/login');
          }}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium ${buttonVariant('outline')}`}
        >
          Cancel
        </button>
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium disabled:opacity-50 ${buttonVariant('primary')}`}
        >
          {isLoading ? 'Please wait...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}

export default TosPage;
