export function resolveFormAjaxUrl(fallbackUrl: string): string {
  if (typeof window === 'undefined') {
    return fallbackUrl;
  }

  try {
    // If WP (or theme) exposes ajaxurl, prefer it.
    const w = window as unknown as {ajaxurl?: unknown};
    if (typeof w.ajaxurl === 'string' && w.ajaxurl.trim()) {
      return w.ajaxurl.trim();
    }

    // Heuristic: WP frontend often has the REST discovery link tag.
    const wpApiLink = document.querySelector('link[rel="https://api.w.org/"]');
    if (wpApiLink) {
      return `${window.location.origin}/wp-admin/admin-ajax.php`;
    }
  } catch {
    // ignore
  }

  return fallbackUrl;
}

