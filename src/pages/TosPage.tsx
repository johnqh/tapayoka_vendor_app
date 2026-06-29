import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TapayokaClient } from '@sudobility/tapayoka_client';
import { useApi } from '../context/apiContextDef';
import { useAuthStatus } from '@sudobility/auth-components';
import { Alert, Button, Card, Heading, Text } from '@sudobility/components';
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
        <Heading level={1} size="3xl" className="mb-8">
          Terms of Service
        </Heading>

        <Card variant="bordered" padding="none" className="p-8 space-y-6 mb-8">
          <Text>
            Welcome to Tapayoka. By using this application, you agree to the following terms and
            conditions.
          </Text>

          <div>
            <Heading level={2} size="base" className="mb-2">
              1. Acceptance of Terms
            </Heading>
            <Text>
              By accessing or using the Tapayoka vendor platform, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </Text>
          </div>

          <div>
            <Heading level={2} size="base" className="mb-2">
              2. Use of Service
            </Heading>
            <Text>
              You agree to use the service only for lawful purposes and in accordance with these
              terms. You are responsible for maintaining the security of your account credentials.
            </Text>
          </div>

          <div>
            <Heading level={2} size="base" className="mb-2">
              3. Vendor Responsibilities
            </Heading>
            <Text>
              As a vendor, you are responsible for the accuracy of your service listings, pricing,
              and device configurations. You agree to provide services as described and maintain
              your installation in working order.
            </Text>
          </div>

          <div>
            <Heading level={2} size="base" className="mb-2">
              4. Privacy
            </Heading>
            <Text>
              Your privacy is important to us. We collect and process data as described in our
              Privacy Policy, which is incorporated into these terms by reference.
            </Text>
          </div>

          <div>
            <Heading level={2} size="base" className="mb-2">
              5. Limitation of Liability
            </Heading>
            <Text>
              Tapayoka shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of the service.
            </Text>
          </div>
        </Card>

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
