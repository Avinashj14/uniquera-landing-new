import {useEffect, useMemo, useRef} from 'react';
import {absoluteLandingUrl, thankYouPageUrl} from '../routeUtils';
import formHtmlRaw from '../../uniquera-consultation-form/templates/form-fragment.html?raw';

/* Form markup is in `.uniquera-form-wrap`; CSS is scoped in uniquera-form-scoped.css and loaded unlayered in index.css so Bootstrap class names beat Tailwind utilities inside the form. */

type JQueryWithPlugin = {
  fn?: {
    onlineForm?: () => void;
  };
};

declare global {
  interface Window {
    jQuery?: JQueryWithPlugin & ((selector: string) => {onlineForm?: () => void});
    uniqueraForm?: {
      ajaxUrl: string;
      nonce: string;
      submitError: string;
      homeUrl?: string;
      thankYouUrl?: string;
      trackingDefaults: {
        utm_source: string;
        utm_campaign: string;
        utm_audience: string;
      };
    };
    language?: string;
    tedaviler?: unknown[];
    __uniqueraScriptPromises?: Record<string, Promise<void>>;
  }
}

function loadScript(src: string): Promise<void> {
  window.__uniqueraScriptPromises = window.__uniqueraScriptPromises || {};
  if (window.__uniqueraScriptPromises[src]) {
    return window.__uniqueraScriptPromises[src];
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-uniquera-src="${src}"]`);
    if (existing?.dataset.uniqueraLoaded === 'true') {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener('load', () => resolve(), {once: true});
      existing.addEventListener('error', () => reject(new Error(`Failed loading ${src}`)), {once: true});
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.uniqueraSrc = src;
    script.onload = () => {
      script.dataset.uniqueraLoaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed loading ${src}`));
    document.body.appendChild(script);
  });

  window.__uniqueraScriptPromises[src] = promise;
  return promise;
}

async function waitFor(check: () => boolean, retries = 20, delayMs = 150): Promise<boolean> {
  for (let i = 0; i < retries; i += 1) {
    if (check()) {
      return true;
    }
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }
  return false;
}

export default function UniqueraConsultationForm() {
  const rootRef = useRef<HTMLDivElement>(null);
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const assetBase = `${basePath}/uniquera-consultation-form/assets`;
  const submitUrl = `${basePath}/api/uniquera-form-submit.php`;
  const scriptSources = useMemo(
    () => [
      `${assetBase}/js/jquery-3.6.0.min.js`,
      `${assetBase}/js/nouislider.min.js`,
      `${assetBase}/js/intlTelInput.min.js`,
      `${assetBase}/js/utils.js`,
      `${assetBase}/js/uniquera-main.js`,
    ],
    [assetBase],
  );

  const formHtml = useMemo(() => {
    return formHtmlRaw
      .replaceAll('../assets/form/images/', `${assetBase}/images/`)
      .replaceAll('https://uniqueraclinic.com/', `${basePath}/`);
  }, [assetBase, basePath]);

  useEffect(() => {
    document.body.classList.add('uniquera-consultation-form-active');
    return () => {
      document.body.classList.remove('uniquera-consultation-form-active');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      window.language = 'en';
      window.tedaviler = [];
      window.uniqueraForm = {
        ajaxUrl: submitUrl,
        nonce: 'react-app',
        submitError: 'Could not submit your form. Please try again.',
        homeUrl: absoluteLandingUrl(basePath),
        thankYouUrl: thankYouPageUrl(basePath),
        trackingDefaults: {
          utm_source: window.location.hostname,
          utm_campaign: 'uniquera_consultation_form',
          utm_audience: '',
        },
      };

      for (const src of scriptSources) {
        if (cancelled) {
          return;
        }
        await loadScript(src);
      }

      if (cancelled || !rootRef.current) {
        return;
      }

      const ready = await waitFor(() => {
        const jq = window.jQuery;
        if (!jq || !jq.fn?.onlineForm || !rootRef.current) {
          return false;
        }
        const wrap = rootRef.current;
        return wrap.querySelector('.questions') != null && wrap.querySelector('#footer .steps') != null;
      });
      if (!ready) {
        throw new Error('Uniquera form scripts loaded but onlineForm plugin was not ready');
      }
      const jq = window.jQuery;

      const selector = `#${rootRef.current.id} .questions`;
      const hasBootedUi = () => {
        if (!rootRef.current) return false;
        return rootRef.current.querySelectorAll('#footer .steps .step').length > 0;
      };

      jq(selector)?.onlineForm?.();
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      if (!hasBootedUi()) {
        throw new Error('Uniquera form initialization incomplete: steps were not mounted');
      }
    };

    boot().catch((error) => {
      console.error('Uniquera form boot failed', error);
    });

    return () => {
      cancelled = true;
    };
  }, [scriptSources, submitUrl]);

  return (
    <section id="consultation-form" aria-label="Consultation form" className="bg-primary-bg">
      <div className="w-full bg-primary-bg overflow-x-hidden overflow-y-visible shadow-2xl border-white/10 py-6">
        <div
          id="uniquera-react-form-root"
          ref={rootRef}
          className="uniquera-form-wrap"
          data-uniquera-form="1"
          data-thank-you-url={thankYouPageUrl(basePath)}
          dangerouslySetInnerHTML={{__html: formHtml}}
        />
      </div>
    </section>
  );
}