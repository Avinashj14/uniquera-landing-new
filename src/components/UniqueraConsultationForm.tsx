import {useEffect, useMemo, useRef} from 'react';
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

const SCRIPT_SOURCES = [
  '/uniquera-consultation-form/assets/js/jquery-3.6.0.min.js',
  '/uniquera-consultation-form/assets/js/nouislider.min.js',
  '/uniquera-consultation-form/assets/js/intlTelInput.min.js',
  '/uniquera-consultation-form/assets/js/utils.js',
  '/uniquera-consultation-form/assets/js/uniquera-main.js',
];

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

export default function UniqueraConsultationForm() {
  const rootRef = useRef<HTMLDivElement>(null);

  const formHtml = useMemo(() => {
    return formHtmlRaw
      .replaceAll('../assets/form/images/', '/uniquera-consultation-form/assets/images/')
      .replaceAll('https://uniqueraclinic.com/', '/');
  }, []);

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
        ajaxUrl: '/api/uniquera-form-submit',
        nonce: 'react-app',
        submitError: 'Could not submit your form. Please try again.',
        trackingDefaults: {
          utm_source: window.location.hostname,
          utm_campaign: 'uniquera_consultation_form',
          utm_audience: '',
        },
      };

      for (const src of SCRIPT_SOURCES) {
        if (cancelled) {
          return;
        }
        await loadScript(src);
      }

      if (cancelled || !rootRef.current) {
        return;
      }

      const jq = window.jQuery;
      if (!jq || !jq.fn?.onlineForm) {
        return;
      }

      const selector = `#${rootRef.current.id} .questions`;
      const hasBootedUi = () => {
        if (!rootRef.current) return false;
        return rootRef.current.querySelectorAll('#footer .steps .step').length > 0;
      };

      // Some environments race script eval vs inline template init.
      // Re-run init a few times until steps/questions are actually mounted.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        if (cancelled) return;
        jq(selector)?.onlineForm?.();
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        if (hasBootedUi()) {
          break;
        }
      }
    };

    boot().catch((error) => {
      console.error('Uniquera form boot failed', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="consultation-form" aria-label="Consultation form" className="bg-primary-bg">
      <div className="w-full bg-primary-bg overflow-x-hidden overflow-y-visible shadow-2xl border-white/10 py-6">
        <div
          id="uniquera-react-form-root"
          ref={rootRef}
          className="uniquera-form-wrap"
          data-uniquera-form="1"
          dangerouslySetInnerHTML={{__html: formHtml}}
        />
      </div>
    </section>
  );
}
