import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SITE_NAME = 'GetURQR';
const DEFAULT_DOMAIN = 'https://geturqr.com';
const DEFAULT_IMAGE = `${DEFAULT_DOMAIN}/pwa-512x512.png`;
const DEFAULT_DESC = 'Create smart digital QR tags with instant WhatsApp chat connectivity. Secure your pets, luggage, parking, and home rentals without exposing your phone number.';

function updateMetaTag(attrName, attrValue, content) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
  return element;
}

function updateLinkTag(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  return element;
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  jsonLd,
  noindex = false,
}) {
  const location = useLocation();
  const currentUrl = canonical || `${DEFAULT_DOMAIN}${location.pathname}`;
  const fullTitle = title
    ? (title.includes(DEFAULT_SITE_NAME) ? title : `${title} | ${DEFAULT_SITE_NAME}`)
    : `${DEFAULT_SITE_NAME} — Smart QR Tags for Everything`;

  useEffect(() => {
    // 1. Update Title
    const prevTitle = document.title;
    document.title = fullTitle;

    // 2. Primary Meta Tags
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // 3. Robots meta (noindex for private/protected routes)
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // 4. Canonical Link
    updateLinkTag('canonical', currentUrl);

    // 5. OpenGraph Tags
    updateMetaTag('property', 'og:site_name', DEFAULT_SITE_NAME);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', currentUrl);
    updateMetaTag('property', 'og:image', ogImage);

    // 6. Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 7. Structured Data (JSON-LD)
    let jsonLdScript = null;
    const scriptId = 'page-jsonld-schema';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    if (jsonLd) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = scriptId;
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = prevTitle;
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [fullTitle, description, keywords, currentUrl, ogType, ogImage, jsonLd, noindex]);

  return null;
}
