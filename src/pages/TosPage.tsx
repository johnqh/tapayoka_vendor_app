import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TapayokaClient } from '@sudobility/tapayoka_client';
import { useApi } from '../context/apiContextDef';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui } from '@sudobility/design';
import { Alert, Button } from '@sudobility/components';
import { SEOHead } from '@sudobility/seo_lib';
import { CONSTANTS } from '../config/constants';
import { analyticsService } from '../config/analytics';
import { usePageBreadcrumbs } from '../hooks/usePageConfig';
import { publicTrail } from '../lib/breadcrumbs';

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

  usePageBreadcrumbs(publicTrail({ label: 'Terms of Service', current: true }));

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
    <>
      <SEOHead title={`Terms of Service | ${CONSTANTS.APP_NAME}`} description="" noIndex />
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
              By accessing or using the Tapayoka vendor platform, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
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
              As a vendor, you are responsible for the accuracy of your service listings, pricing,
              and device configurations. You agree to provide services as described and maintain
              your installation in working order.
            </p>
          </div>

          <div>
            <h2 className={`${ui.text.h5} mb-2`}>4. Privacy</h2>
            <p className={ui.text.body}>
              Your privacy is important to us. We collect and process data as described in our
              Privacy Policy, which is incorporated into these terms by reference.
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

        {error && <Alert variant="error" description={error} className="mb-4" />}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              analyticsService.trackButtonClick('tos_cancel');
              navigate('/login');
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleAccept} disabled={isLoading}>
            {isLoading ? 'Please wait...' : 'Accept & Continue'}
          </Button>
        </div>
      </div>
    </>
  );
}

export default TosPage;
