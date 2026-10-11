export const SITE_URL = 'https://khatakit.in';
export const SITE_NAME = 'Khatakit';
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
export const LOGO_URL = `${SITE_URL}/logo.png`;

export const REPO_URL = 'https://github.com/a1filtercoffee/khatakit';
export const ISSUES_URL = `${REPO_URL}/issues`;
export const RULES_REVIEW_URL = `${REPO_URL}/blob/main/docs/RULES-REVIEW.md`;

/** Who builds and maintains Khatakit. */
export const PUBLISHER = { name: 'filtercoffee.dev', url: 'https://filtercoffee.dev' } as const;

export const DEFAULT_SOCIAL_IMAGE = {
  url: OG_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: 'Khatakit - free accounting and tax calculators for India',
} as const;
