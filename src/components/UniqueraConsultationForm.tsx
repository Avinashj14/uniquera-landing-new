import {useEffect, useMemo, useRef} from 'react';
import formHtmlRaw from '../../uniquera-consultation-form/templates/form-fragment.html?raw';

import '../../uniquera-consultation-form/assets/css/nouislider.min.css';
import '../../uniquera-consultation-form/assets/css/intlTelInput.css';
import '../../uniquera-consultation-form/assets/css/main_v2.css';
import '../../uniquera-consultation-form/assets/css/theme-overrides.css';
import '../../uniquera-consultation-form/assets/css/uniquera-elementor-compat.css';

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
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-uniquera-src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.uniqueraSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed loading ${src}`));
    document.body.appendChild(script);
  });
}

export default function UniqueraConsultationForm() {
  const rootRef = useRef<HTMLDivElement>(null);

  const formHtml = useMemo(() => {
    return formHtmlRaw
      .replaceAll('../assets/form/images/', '/uniquera-consultation-form/assets/images/')
      .replaceAll('https://uniqueraclinic.com/', '/');
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
      jq(`#${rootRef.current.id} .questions`)?.onlineForm?.();
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
      <div className="w-full bg-white overflow-hidden shadow-2xl border-white/10 py-6">
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
