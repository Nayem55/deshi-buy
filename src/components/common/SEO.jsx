import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Deshi Buy';
const DEFAULT_DESCRIPTION =
  'Shop pure, seasonal Bangladeshi food from Deshi Buy, including mangoes, date palm jaggery and everyday natural groceries.';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://deshibuy.com').replace(/\/$/, '');

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = '/deshi-buy-logo.jpg',
  type = 'website',
  noIndex = false,
  canonical,
  exactTitle = false,
}) {
  const location = useLocation();
  const pageTitle = exactTitle ? title : title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Pure • Natural • Traditional`;
  const path = canonical || `${location.pathname}${location.search}`;
  const canonicalUrl = path.startsWith('http') ? path : `${SITE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
