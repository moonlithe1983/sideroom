import releaseMetadata from '@/config/release-metadata.json';

const placeholderDomains = ['example.com', 'yourdomain.com'];

function urlUsesPlaceholderDomain(value: string) {
  return placeholderDomains.some((domain) => value.includes(domain));
}

function emailUsesPlaceholderDomain(value: string) {
  const [, domain = ''] = value.split('@');
  return placeholderDomains.some((placeholderDomain) => domain.includes(placeholderDomain));
}

export const supportEmail = releaseMetadata.supportEmail;
export const supportUrl = releaseMetadata.supportUrl;
export const privacyPolicyUrl = releaseMetadata.privacyPolicyUrl;
export const termsUrl = releaseMetadata.termsUrl;
export const marketingUrl = releaseMetadata.marketingUrl;
export const googlePlayShortDescription = releaseMetadata.googlePlayShortDescription;
export const googlePlayFullDescription = releaseMetadata.googlePlayFullDescription;

export const hasPlaceholderSupportEmail = emailUsesPlaceholderDomain(supportEmail);
export const hasPlaceholderSupportUrl = urlUsesPlaceholderDomain(supportUrl);
export const hasPlaceholderPrivacyPolicyUrl = urlUsesPlaceholderDomain(privacyPolicyUrl);
export const hasPlaceholderTermsUrl = urlUsesPlaceholderDomain(termsUrl);
export const hasPlaceholderMarketingUrl = urlUsesPlaceholderDomain(marketingUrl);

export const missingReleaseMetadataItems = [
  hasPlaceholderSupportEmail ? 'Replace the placeholder support email.' : null,
  hasPlaceholderSupportUrl ? 'Replace the placeholder support URL.' : null,
  hasPlaceholderPrivacyPolicyUrl ? 'Replace the placeholder privacy policy URL.' : null,
  hasPlaceholderTermsUrl ? 'Replace the placeholder terms URL.' : null,
  hasPlaceholderMarketingUrl ? 'Replace the placeholder marketing URL.' : null,
].filter((item): item is string => item !== null);

export const releaseMetadataStatus = {
  policyLinksReady:
    !hasPlaceholderPrivacyPolicyUrl && !hasPlaceholderTermsUrl && !hasPlaceholderSupportUrl,
  playListingCopyReady:
    googlePlayShortDescription.trim().length > 0 && googlePlayFullDescription.trim().length > 0,
  supportContactReady: !hasPlaceholderSupportEmail && !hasPlaceholderSupportUrl,
};
