import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {X} from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

type FieldErrors = {
  name?: string;
  email?: string;
  submit?: string;
};

const GUIDE_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzJ-Epj61TVHwVrW1N-U3aI3PmgNrI_N60iHDyDVm8SAZT95Zu-J6MdoVd_KCQUr_CB/exec';

function isValidEmail(email: string) {
  // Reasonable, production-friendly email regex (not RFC-perfect by design).
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

export default function FreeGuideModal({open, onClose}: Props) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({name: false, email: false});
  const [errors, setErrors] = useState<FieldErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nameTrimmed = name.trim();
  const emailTrimmed = email.trim();

  const isNameValid = nameTrimmed.length > 0;
  const isEmailValid = isValidEmail(emailTrimmed);
  const isFormValid = isNameValid && isEmailValid;

  const fieldErrors = useMemo(() => {
    const next: FieldErrors = {};
    if (!isNameValid) next.name = 'Name is required.';
    if (!emailTrimmed) next.email = 'Email is required.';
    else if (!isEmailValid) next.email = 'Please enter a valid email address.';
    return next;
  }, [emailTrimmed, isEmailValid, isNameValid]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const closeAndReset = useCallback(() => {
    setName('');
    setEmail('');
    setTouched({name: false, email: false});
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAndReset();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeAndReset, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setErrors((prev) => ({...prev, ...fieldErrors, submit: prev.submit}));
  }, [fieldErrors, open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({name: true, email: true});
    setErrors((prev) => ({...prev, submit: undefined}));
    setIsSuccess(false);

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Attempt a standard JSON POST first (preferred).
      const res = await fetch(GUIDE_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: nameTrimmed, email: emailTrimmed}),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      setIsSuccess(true);
      setName('');
      setEmail('');
      setTouched({name: false, email: false});

      window.setTimeout(() => {
        closeAndReset();
      }, 2000);
    } catch (err) {
      // Google Apps Script endpoints frequently fail in browsers due to CORS,
      // even though they accept the request server-side. If we detect a fetch
      // failure (commonly TypeError: Failed to fetch), retry as no-cors.
      const maybeTypeError = err instanceof TypeError;
      if (maybeTypeError) {
        try {
          await fetch(GUIDE_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify({name: nameTrimmed, email: emailTrimmed}),
          });

          setIsSuccess(true);
          setName('');
          setEmail('');
          setTouched({name: false, email: false});

          window.setTimeout(() => {
            closeAndReset();
          }, 2000);
          return;
        } catch {
          // fall through to user-facing error
        }
      }

      setErrors((prev) => ({...prev, submit: 'Something went wrong. Please try again.'}));
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNameError = touched.name && !!fieldErrors.name;
  const showEmailError = touched.email && !!fieldErrors.email;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          {/* Backdrop: must stay below panel (z-index) so close button receives clicks */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="absolute inset-0 z-0 bg-black/80 backdrop-blur-sm"
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={closeAndReset}
              className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
            />
          </motion.div>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="free-guide-title"
            initial={{opacity: 0, scale: 0.95, y: 12}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.95, y: 12}}
            transition={{duration: 0.18, ease: 'easeOut'}}
            className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#043a40] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.6)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-cyan/15 blur-[80px]"
              aria-hidden
            />

            <button
              type="button"
              onClick={closeAndReset}
              className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative p-6 md:p-7">
              <h2 id="free-guide-title" className="text-2xl font-bold text-white mb-1">
                Get Your Free Guide
              </h2>
              <p className="text-sm text-white/70 mb-6">
                Enter your details and we’ll email the ebook instantly.
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5" htmlFor="free-guide-name">
                    Name
                  </label>
                  <input
                    id="free-guide-name"
                    ref={nameInputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({...t, name: true}))}
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    className={[
                      'w-full rounded-2xl bg-white/5 border px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors',
                      showNameError ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-brand-cyan/70',
                    ].join(' ')}
                  />
                  {showNameError && (
                    <p className="mt-1.5 text-xs text-red-300">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5" htmlFor="free-guide-email">
                    Email
                  </label>
                  <input
                    id="free-guide-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({...t, email: true}))}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={[
                      'w-full rounded-2xl bg-white/5 border px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors',
                      showEmailError ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-brand-cyan/70',
                    ].join(' ')}
                  />
                  {showEmailError && (
                    <p className="mt-1.5 text-xs text-red-300">{fieldErrors.email}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errors.submit}
                  </div>
                )}

                {isSuccess && (
                  <div className="rounded-2xl border border-brand-cyan/25 bg-brand-cyan/10 px-4 py-3 text-sm text-white">
                    Thanks, we’ve emailed you the ebook.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={[
                    'w-full rounded-full px-6 py-3 font-bold transition-all',
                    !isFormValid || isSubmitting
                      ? 'bg-gray-500/40 text-white/60 cursor-not-allowed'
                      : 'bg-brand-cyan text-primary-bg hover:opacity-95 shadow-[0_18px_35px_-12px_rgba(45,199,204,0.5)]',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

