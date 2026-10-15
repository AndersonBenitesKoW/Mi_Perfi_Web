"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileText, Loader2, X } from "lucide-react";
import { profile } from "@/content/profile";
import { uiCopy } from "@/content/ui-copy";
import { useTranslate } from "@/i18n/LanguageProvider";
import { mergeClassNames } from "@/shared/lib/class-names";

/**
 * Muestra el CV dentro de la misma página en un modal (div overlay).
 * No usa `target="_blank"` ni `download`: el visitante solo puede leerlo,
 * no se abre otra pestaña ni se dispara una descarga directa.
 *
 * El modal se monta con un portal en `document.body`: el header usa
 * `backdrop-filter`, que convierte a sus hijos `fixed` en relativos al header
 * y dejaba el modal encerrado en una franja de 64px.
 */
interface CvViewerProps {
  className?: string;
}

const PDF_VIEW_PARAMS = "#toolbar=0&navpanes=0&view=FitH";

const subscribeNoop = () => () => {};

/** `true` only after hydration, so the portal never mismatches the server HTML. */
function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function CvViewer({ className }: CvViewerProps = {}) {
  const translate = useTranslate();
  const prefersReducedMotion = useReducedMotion();
  const isClient = useIsClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [isOpen]);

  function openViewer() {
    setIsPdfLoaded(false);
    setIsOpen(true);
  }

  const panelMotion = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 32, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 24, scale: 0.98 },
      };

  const modal = (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="cv-viewer"
          className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-viewer-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            aria-hidden
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            {...panelMotion}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-border-strong bg-surface-raised shadow-[0_30px_120px_-20px_rgba(139,92,246,0.45)] sm:h-[88dvh] sm:rounded-3xl"
          >
            {/* Brand accent line */}
            <div
              aria-hidden
              className="h-px w-full bg-linear-to-r from-accent-violet via-accent-cyan to-accent-fuchsia"
            />

            {/* Mobile drag handle (visual only) */}
            <div aria-hidden className="flex justify-center pt-2.5 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-border-strong" />
            </div>

            <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-accent-violet to-accent-cyan text-surface-base shadow-lg shadow-accent-violet/30">
                <FileText className="size-5" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <h3
                  id="cv-viewer-title"
                  className="truncate text-sm font-semibold text-text-primary sm:text-base"
                >
                  {translate(uiCopy.resume.title)}
                </h3>
                <p className="truncate font-mono text-xs text-text-muted">
                  {profile.fullName}
                </p>
              </div>

              <span className="hidden items-center gap-1.5 text-xs text-text-muted md:inline-flex">
                <kbd className="rounded-md border border-border-strong bg-surface-overlay px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                  Esc
                </kbd>
                {translate(uiCopy.resume.escHint)}
              </span>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={translate(uiCopy.resume.close)}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-border-subtle text-text-secondary transition hover:border-border-strong hover:bg-surface-overlay hover:text-text-primary"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>

            <div className="relative flex-1 bg-surface-overlay p-0 sm:p-3">
              {!isPdfLoaded ? (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3 text-text-muted">
                    <Loader2 className="size-7 animate-spin text-accent-violet" aria-hidden />
                    <span className="text-xs">{translate(uiCopy.resume.loading)}</span>
                  </div>
                </div>
              ) : null}

              <iframe
                src={`${profile.resumeUrl}${PDF_VIEW_PARAMS}`}
                title={translate(uiCopy.resume.title)}
                onLoad={() => setIsPdfLoaded(true)}
                className={mergeClassNames(
                  "relative block size-full bg-white transition-opacity duration-300 sm:rounded-xl",
                  isPdfLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openViewer}
        aria-haspopup="dialog"
        className={mergeClassNames(
          "group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-base px-6 py-3 text-sm font-medium text-text-primary transition hover:border-accent-violet/60 hover:bg-surface-raised",
          className,
        )}
      >
        <FileText
          className="size-4 text-text-secondary transition group-hover:text-accent-violet"
          aria-hidden
        />
        {translate(uiCopy.hero.resumeAction)}
      </button>

      {isClient ? createPortal(modal, document.body) : null}
    </>
  );
}
