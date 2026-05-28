export const COOKIE_CONSENT_KEY = 'uniquera_cookie_consent';

const GTM_ID = 'GTM-NWRKK3CQ';
const META_PIXEL_ID = '24083899567936637';
const CLARITY_ID = 'wnuhyv9408';

type ConsentState = 'granted' | 'denied';

function safeLocalStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return safeLocalStorageGet(COOKIE_CONSENT_KEY) === 'granted';
}

export function pushDataLayer(payload: Record<string, unknown>): void {
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch {
    // never break app logic
  }
}

function ensureGtagStub(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    };
  }
}

function updateConsentMode(state: ConsentState, mode: 'default' | 'update'): void {
  try {
    ensureGtagStub();
    window.gtag?.('consent', mode, {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  } catch {
    // tracking should never crash UX
  }
}

export function initializeConsentModeDefaultDenied(): void {
  updateConsentMode('denied', 'default');
}

function loadScriptOnce(id: string, src: string, parent: HTMLElement): void {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  parent.appendChild(script);
}

export function loadGtmOnce(): void {
  if (typeof document === 'undefined') return;
  loadScriptOnce(
    'uniquera-gtm-script',
    `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`,
    document.head,
  );
}

export function injectGtmNoscriptOnce(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('uniquera-gtm-noscript')) return;
  const wrapper = document.createElement('noscript');
  wrapper.id = 'uniquera-gtm-noscript';
  wrapper.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.prepend(wrapper);
}

export function loadMetaPixelOnce(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__uniqueraMetaPixelLoaded) return;

  // Standard fbq bootstrap with duplicate guards.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Element) => {
    if (f.fbq) return;
    n = f.fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod.apply(n, args);
      else n.queue.push(args);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    t.id = 'uniquera-meta-pixel';
    s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  try {
    window.fbq?.('init', META_PIXEL_ID);
  } catch {
    // ignore
  }
  window.__uniqueraMetaPixelLoaded = true;
}

export function trackMetaPageView(): void {
  try {
    if (!hasConsent()) return;
    if (typeof window.fbq !== 'function') return;
    window.fbq('track', 'PageView');
  } catch {
    // ignore
  }
}

export function loadClarityOnce(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__uniqueraClarityLoaded) return;
  loadScriptOnce(
    'uniquera-clarity-script',
    `https://www.clarity.ms/tag/${CLARITY_ID}`,
    document.head,
  );
  window.__uniqueraClarityLoaded = true;
}

export function trackFb(event: string, params?: Record<string, unknown>): void {
  try {
    if (!hasConsent()) return;
    if (typeof window.fbq !== 'function') return;
    window.fbq('track', event, params);
  } catch {
    // ignore
  }
}

export function trackLeadSubmit(): void {
  pushDataLayer({event: 'lead_submit', form_name: 'contact_form'});
  trackFb('Lead');
}

export function trackThankYouPage(): void {
  pushDataLayer({event: 'thank_you_page'});
  trackFb('CompleteRegistration');
}

export function trackWhatsAppClick(): void {
  pushDataLayer({event: 'whatsapp_click'});
}

export function trackPhoneClick(): void {
  pushDataLayer({event: 'phone_click'});
}

export function applyConsent(granted: boolean): void {
  const state: ConsentState = granted ? 'granted' : 'denied';
  safeLocalStorageSet(COOKIE_CONSENT_KEY, state);
  updateConsentMode(state, 'update');

  if (granted) {
    loadMetaPixelOnce();
    loadClarityOnce();
    trackMetaPageView();
  }
}

export function restoreConsentAndLoad(): 'granted' | 'denied' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';

  // Migrate old consent key if present.
  const legacy = safeLocalStorageGet('uniquera-cookie-consent');
  if (!safeLocalStorageGet(COOKIE_CONSENT_KEY) && legacy) {
    if (legacy === 'accepted') safeLocalStorageSet(COOKIE_CONSENT_KEY, 'granted');
    if (legacy === 'rejected') safeLocalStorageSet(COOKIE_CONSENT_KEY, 'denied');
  }

  const stored = safeLocalStorageGet(COOKIE_CONSENT_KEY);
  if (stored === 'granted') {
    applyConsent(true);
    return 'granted';
  }
  if (stored === 'denied') {
    applyConsent(false);
    return 'denied';
  }
  return 'unknown';
}

