/** Vite base path without trailing slash, e.g. "" or "/subdir". */
export function normalizeBasePath(baseUrl: string): string {
  return (baseUrl || '/').replace(/\/+$/, '');
}

export function homePathFromBase(basePath: string): string {
  return basePath === '' ? '/' : `${basePath}/`;
}

export function thankYouPathFromBase(basePath: string): string {
  const b = normalizeBasePath(basePath);
  return b === '' ? '/thank-you/' : `${b}/thank-you/`;
}

export function matchesThankYouPath(pathname: string, basePath: string): boolean {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  const b = normalizeBasePath(basePath);
  const expected = b === '' ? '/thank-you' : `${b}/thank-you`;
  return path === expected || path.endsWith('/thank-you');
}

export function thankYouPageUrl(basePath: string): string {
  if (typeof window === 'undefined') {
    return thankYouPathFromBase(basePath);
  }
  const path = thankYouPathFromBase(basePath);
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Absolute URL to SPA home (landing), including subpath deployments. */
export function absoluteLandingUrl(basePath: string): string {
  if (typeof window === 'undefined') {
    return homePathFromBase(basePath);
  }
  const p = homePathFromBase(basePath);
  const path = p === '/' ? '/' : (p.endsWith('/') ? p : `${p}`);
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}
