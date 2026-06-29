import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Heading, MasterDetailLayout, Text } from '@sudobility/components';
import { ui } from '@sudobility/design';
import { SEOHead } from '@sudobility/seo_lib';
import { useSetPageConfig, usePageBreadcrumbs } from '../hooks/usePageConfig';
import { publicTrail } from '../lib/breadcrumbs';
import { CONSTANTS } from '../config/constants';
import { analyticsService } from '../config/analytics';

type DocSection = 'getting-started' | 'device-setup' | 'api-reference';

const sidebarItems: { id: DocSection; label: string }[] = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'device-setup', label: 'Device Setup' },
  { id: 'api-reference', label: 'API Reference' },
];

function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { section } = useParams<{ section?: string }>();
  const currentSection = section || 'getting-started';

  return (
    <nav className="p-4 space-y-1">
      {sidebarItems.map((item) => (
        <Link
          key={item.id}
          to={`/docs/${item.id}`}
          onClick={onNavigate}
          className={`block px-3 py-2 rounded-lg text-sm font-medium ${ui.transition.default} ${
            currentSection === item.id
              ? 'bg-accent text-primary'
              : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
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
    {
      title: 'Create Your Account',
      description:
        "Sign up with email or Google. You'll be prompted to accept the terms of service and create your first workspace.",
    },
    {
      title: 'Add a Location',
      description: 'Go to Locations and add your first business location with address details.',
    },
    {
      title: 'Define Device Models',
      description:
        "Create device models (e.g., 'Standard Washer') with pricing strategy, slot mode, and action type.",
    },
    {
      title: 'Add Offerings',
      description:
        'Assign device instances to locations. Configure individual pricing and generate QR codes.',
    },
    {
      title: 'Start Accepting Payments',
      description:
        'Print QR codes and place them on your devices. Customers scan to pay and start their session.',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <Text>Get up and running with Tapayoka in five simple steps.</Text>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} variant="bordered" padding="none" className="flex gap-4 p-5">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <Heading level={3} size="base" className="mb-1">
                {step.title}
              </Heading>
              <Text size="sm" color="muted">
                {step.description}
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DeviceSetupContent() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <Heading level={2} size="xl" className="mb-3">
          Device Models
        </Heading>
        <Text color="muted" className="mb-4">
          Device models define the type and behavior of your machines. Each model specifies:
        </Text>
        <div className="space-y-3">
          {[
            { name: 'Type', description: 'Washer, Dryer, Parking, Locker, or Vending' },
            { name: 'Pricing', description: 'Fixed (one-time) or Variable (time-based)' },
            {
              name: 'Slot Mode',
              description: 'Single (one customer at a time) or Multi (concurrent users)',
            },
            {
              name: 'Action',
              description: 'Timed (runs for a duration) or Sequence (step-by-step)',
            },
            {
              name: 'Interruption',
              description: 'Stop or Continue when payment expires (timed actions only)',
            },
            { name: 'Payment', description: 'At Start (pre-pay) or At End (post-pay)' },
          ].map((item) => (
            <Card key={item.name} variant="bordered" padding="none" className="p-4">
              <code className="text-sm font-mono bg-muted text-foreground rounded px-1.5 py-0.5">
                {item.name}
              </code>
              <Text size="sm" color="muted" className="mt-1">
                {item.description}
              </Text>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Heading level={2} size="xl" className="mb-3">
          BLE Protocol
        </Heading>
        <Text>
          Tapayoka uses Bluetooth Low Energy (BLE) to communicate between the Raspberry Pi
          controller and customer devices. The Pi advertises a GATT service that handles session
          initiation, payment verification, and device control signals.
        </Text>
      </div>

      <div>
        <Heading level={2} size="xl" className="mb-3">
          Offerings
        </Heading>
        <Text>
          Offerings are individual device instances assigned to a location or model. Each offering
          can override the model&apos;s default pricing with custom pricing configurations
          (variable, fixed, or multi-slot).
        </Text>
      </div>
    </div>
  );
}

function ApiReferenceContent() {
  return (
    <div className="space-y-8 max-w-3xl">
      <Text>
        The Tapayoka API provides RESTful endpoints for managing locations, models, offerings, and
        orders.
      </Text>

      <div>
        <Heading level={2} size="lg" className="mb-3">
          Endpoints
        </Heading>
        <div className="space-y-3">
          {[
            { method: 'GET', path: '/api/v1/vendor/locations', description: 'List all locations' },
            { method: 'POST', path: '/api/v1/vendor/locations', description: 'Create a location' },
            { method: 'GET', path: '/api/v1/vendor/models', description: 'List all device models' },
            { method: 'POST', path: '/api/v1/vendor/models', description: 'Create a device model' },
            { method: 'GET', path: '/api/v1/vendor/offerings', description: 'List offerings' },
            { method: 'GET', path: '/api/v1/vendor/orders', description: 'List orders' },
          ].map((endpoint) => (
            <Card
              key={`${endpoint.method}-${endpoint.path}`}
              variant="bordered"
              padding="none"
              className="p-4 font-mono text-sm"
            >
              <span className={endpoint.method === 'GET' ? 'text-success' : 'text-primary'}>
                {endpoint.method}
              </span>{' '}
              <span className="text-theme-text-primary">{endpoint.path}</span>
              <Text size="sm" color="muted" className="mt-1 font-sans">
                {endpoint.description}
              </Text>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Heading level={2} size="lg" className="mb-3">
          WebSocket Protocol
        </Heading>
        <Text color="muted" className="mb-4">
          Real-time updates are delivered via WebSocket connections. Subscribe to order status
          changes and device state updates.
        </Text>
        <Card variant="bordered" padding="none" className="p-4">
          <code className="text-sm font-mono bg-muted text-foreground rounded px-1.5 py-0.5">
            ws://api.tapayoka.com/ws/v1/vendor/events
          </code>
          <Text size="sm" color="muted" className="mt-1">
            Connects to the real-time event stream for your workspace.
          </Text>
        </Card>
      </div>

      <div>
        <Heading level={2} size="lg" className="mb-3">
          Authentication
        </Heading>
        <Text>All API requests require a Firebase ID token in the Authorization header:</Text>
        <div className="mt-3 p-4 bg-muted rounded-lg text-foreground text-sm font-mono overflow-x-auto">
          {`Authorization: Bearer <firebase-id-token>`}
        </div>
      </div>
    </div>
  );
}

function DocsPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('docsPage');
  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');
  useSetPageConfig({ scrollable: false, contentPadding: 'sm', maxWidth: '7xl' });

  const currentSection = (section as DocSection) || 'getting-started';
  const currentSectionLabel =
    sidebarItems.find((i) => i.id === currentSection)?.label ?? 'Documentation';

  usePageBreadcrumbs(
    publicTrail(
      { label: 'Documentation', href: '/docs' },
      { label: currentSectionLabel, current: true }
    )
  );

  useEffect(() => {
    analyticsService.trackPageView(`/docs/${currentSection}`, `Docs - ${currentSection}`);
  }, [currentSection]);

  useEffect(() => {
    if (!section) {
      navigate('/docs/getting-started', { replace: true });
    }
  }, [section, navigate]);

  const handleBackToNavigation = () => {
    setMobileView('navigation');
  };

  const handleNavigate = () => {
    setMobileView('content');
  };

  const getDetailTitle = () => {
    switch (currentSection) {
      case 'getting-started':
        return 'Getting Started';
      case 'device-setup':
        return 'Device Setup';
      case 'api-reference':
        return 'API Reference';
      default:
        return 'Documentation';
    }
  };

  const seoTitle = `${getDetailTitle()} - ${t('seo.title', { appName: CONSTANTS.APP_NAME })}`;
  const seoDescription = t(
    `seo.sections.${currentSection}`,
    t('seo.description', { appName: CONSTANTS.APP_NAME })
  );
  const rawKeywords = t('seo.keywords', { returnObjects: true });
  const seoKeywords = Array.isArray(rawKeywords) ? rawKeywords : undefined;

  const masterContent = <DocsSidebar onNavigate={handleNavigate} />;

  const detailContent = (
    <div className="p-6">
      {currentSection === 'getting-started' && <GettingStartedContent />}
      {currentSection === 'device-setup' && <DeviceSetupContent />}
      {currentSection === 'api-reference' && <ApiReferenceContent />}
    </div>
  );

  return (
    <>
      <SEOHead title={seoTitle} description={seoDescription} keywords={seoKeywords} />
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
    </>
  );
}

export default DocsPage;
