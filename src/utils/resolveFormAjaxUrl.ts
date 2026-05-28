export function resolveFormAjaxUrl(fallbackUrl: string): string {
  if (typeof window === 'undefined') {
    return fallbackUrl;
  }

  try {
    // Only use WordPress AJAX when the page explicitly exposes ajaxurl (WP embed).
    // Do NOT auto-detect via api.w.org link — static Vite builds on Hostinger would
    // otherwise post to admin-ajax.php and always fail.
    const w = window as unknown as {ajaxurl?: unknown};
    if (typeof w.ajaxurl === 'string' && w.ajaxurl.trim()) {
      return w.ajaxurl.trim();
    }
  } catch {
    // ignore
  }

  return fallbackUrl;
}

