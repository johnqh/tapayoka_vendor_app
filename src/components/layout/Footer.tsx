import { Link } from 'react-router-dom';
import { type FooterConfig, type FooterLinkSection } from '@sudobility/building_blocks';
import { SystemStatusIndicator, useNetwork } from '@sudobility/devops-components';
import { CONSTANTS } from '../../config/constants';

const linkWrapper = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link to={href} className={className}>
    {children}
  </Link>
);

export function useFooterConfig(variant: 'full' | 'compact'): FooterConfig {
  const currentYear = String(new Date().getFullYear());
  const { isOnline } = useNetwork();

  if (variant === 'compact') {
    return {
      variant: 'compact',
      version: CONSTANTS.APP_VERSION,
      copyrightYear: currentYear,
      companyName: CONSTANTS.COMPANY_NAME,
      companyUrl: '/',
      statusIndicator: CONSTANTS.STATUS_PAGE_URL
        ? {
            statusPageUrl: CONSTANTS.STATUS_PAGE_URL,
            apiEndpoint: CONSTANTS.STATUS_PAGE_API_URL,
            refreshInterval: 60000,
          }
        : undefined,
      StatusIndicatorComponent: SystemStatusIndicator,
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
      LinkComponent: linkWrapper,
      isNetworkOnline: isOnline,
      sticky: true,
    };
  }

  const linkSections: FooterLinkSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Vendor', href: '/vendor' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  return {
    variant: 'full',
    logo: {
      src: '/logo.png',
      appName: CONSTANTS.APP_NAME,
    },
    linkSections,
    socialLinks: CONSTANTS.SOCIAL_LINKS,
    statusIndicator: CONSTANTS.STATUS_PAGE_URL
      ? {
          statusPageUrl: CONSTANTS.STATUS_PAGE_URL,
          apiEndpoint: CONSTANTS.STATUS_PAGE_API_URL,
          refreshInterval: 60000,
        }
      : undefined,
    StatusIndicatorComponent: SystemStatusIndicator,
    version: CONSTANTS.APP_VERSION,
    copyrightYear: currentYear,
    companyName: CONSTANTS.COMPANY_NAME,
    description:
      'Device management, QR payments, and order tracking for laundry and vending vendors.',
    LinkComponent: linkWrapper,
    isNetworkOnline: isOnline,
  };
}
