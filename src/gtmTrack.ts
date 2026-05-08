/**
 * Push a dedicated thank-you event when the visitor arrived from a successful
 * form submit (sessionStorage flag set in uniquera-main.js before redirect).
 * Use this event in GTM as the primary “conversion” trigger to avoid double-counting
 * duplicate page loads; the pre-redirect push is for tools that need a hit before unload.
 */
export function pushConsultationFormThankYouIfPending(): void {
  if (typeof window === 'undefined') {
    return;
  }

  let shouldFire = false;
  try {
    if (window.sessionStorage?.getItem('uniquera_cf_confirmation_pending') === '1') {
      shouldFire = true;
      window.sessionStorage.removeItem('uniquera_cf_confirmation_pending');
    }
  } catch {
    /* private mode / quota */
  }

  if (!shouldFire) {
    return;
  }

  const common = {
    form_id: 'uniquera_consultation_form',
    form_name: 'Uniquera consultation form',
    form_flow_version: 5,
    page_path: window.location.pathname || '',
    page_hostname: window.location.hostname || '',
    page_url: window.location.href || '',
    funnel_step: 'thank_you_page',
  } as const;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'uniquera_consultation_form_confirmation',
    ...common,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'consultation_form_confirmation', {
      form_id: 'uniquera_consultation_form',
    });
  }
}
