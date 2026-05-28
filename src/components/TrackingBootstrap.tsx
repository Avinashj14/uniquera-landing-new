import {useEffect} from 'react';
import {
  initializeConsentModeDefaultDenied,
  injectGtmNoscriptOnce,
  loadGtmOnce,
  loadMetaPixelOnce,
  loadClarityOnce,
  restoreConsentAndLoad,
  trackLeadSubmit,
  trackPhoneClick,
  trackWhatsAppClick,
  trackMetaPageView,
  hasConsent,
} from '../tracking';

export default function TrackingBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // GTM is global and always loaded; consent gates data collection.
    initializeConsentModeDefaultDenied();
    loadGtmOnce();
    injectGtmNoscriptOnce();

    // Expose guarded loaders for consent banner.
    window.__loadClarity = () => loadClarityOnce();
    window.__loadMetaPixel = () => loadMetaPixelOnce();
    window.__trackMetaPageView = () => trackMetaPageView();

    const restored = restoreConsentAndLoad();
    if (restored === 'granted') {
      loadMetaPixelOnce();
      loadClarityOnce();
      trackMetaPageView();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__uniqueraClickTrackingBound) return;

    window.__uniqueraClickTrackingBound = true;
    let lastKey = '';
    let lastTs = 0;

    const onClick = (ev: MouseEvent) => {
      const el = ev.target as Element | null;
      const a = el?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const key = href + '|' + (a.textContent || '').trim();
      const now = Date.now();
      if (key === lastKey && now - lastTs < 800) return;
      lastKey = key;
      lastTs = now;

      if (href.startsWith('tel:')) trackPhoneClick();
      if (href.includes('wa.me')) trackWhatsAppClick();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.__uniqueraClickTrackingBound = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onLeadSubmit = () => {
      trackLeadSubmit();
    };

    window.addEventListener('uniquera:lead_submit_success', onLeadSubmit);
    return () => window.removeEventListener('uniquera:lead_submit_success', onLeadSubmit);
  }, []);

  // Consent-aware meta page view on history navigation, without duplicate hard crashes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onRouteLikeChange = () => {
      if (hasConsent()) {
        trackMetaPageView();
      }
    };
    window.addEventListener('popstate', onRouteLikeChange);
    return () => window.removeEventListener('popstate', onRouteLikeChange);
  }, []);

  return null;
}

