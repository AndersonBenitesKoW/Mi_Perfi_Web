"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { profile } from "@/content/profile";
import { uiCopy } from "@/content/ui-copy";
import { useTranslate } from "@/i18n/LanguageProvider";

/**
 * Muestra el CV dentro de la misma página en un modal (div overlay).
 * No usa `target="_blank"` ni `download`: el visitante solo puede leerlo,
 * no se abre otra pestaña ni se dispara una descarga directa.
 */
interface CvViewerProps {
  className?: string;
}

export function CvViewer({ className }: CvViewerProps = {}) {
  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={translate(uiCopy.hero.resumeAction)}
        className={`inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-base px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-muted transition ${className ?? ""}`}
      >
        {translate(uiCopy.hero.resumeAction)}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Curriculum Vitae"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative mx-4 w-full max-w-5xl max-h-[90vh] bg-surface-base rounded-xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-base/50">
              <h3 className="text-sm font-semibold text-text-primary">
                Curriculum Vitae
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface-muted hover:text-text-primary transition"
                aria-label="Cerrar CV"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 relative">
              <iframe
                src={profile.resumeUrl}
                className="w-full h-full"
                title="Curriculum Vitae"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
