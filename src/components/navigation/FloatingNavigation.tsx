"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type FloatingNavigationProps = {
  locale: Locale;
  dictionary: Dictionary;
  brandName?: string;
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export function FloatingNavigation({
  locale,
  dictionary,
  brandName = "PSR",
}: FloatingNavigationProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const shellRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = toggleRef.current;

    const frame = requestAnimationFrame(() => {
      toggleRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const handleShellKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!open || event.key !== "Tab" || !shellRef.current) return;

      const focusable = getFocusableElements(shellRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [open],
  );

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden={!open}
        aria-label={dictionary.a11y.closeMenu}
        className={`fixed inset-0 z-40 bg-nav-overlay transition-opacity duration-200 ease-out ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(var(--floating-nav-offset)+var(--safe-bottom))] sm:px-6">
        <div
          ref={shellRef}
          id="site-navigation-menu"
          role={open ? "dialog" : undefined}
          aria-modal={open ? true : undefined}
          aria-labelledby={titleId}
          onKeyDown={handleShellKeyDown}
          className="pointer-events-auto flex w-[min(100%,var(--floating-nav-width))] flex-col overflow-hidden rounded-md border border-nav-divider bg-nav-bg text-nav-fg shadow-[0_10px_28px_rgb(0_0_0_/0.5)]"
        >
          <div
            className={`grid transition-[grid-template-rows] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                inert={open ? undefined : true}
                aria-hidden={!open}
                className={`origin-bottom max-h-[min(62dvh,28rem)] overflow-y-auto border-b border-nav-divider bg-nav-panel transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-h-[min(68dvh,32rem)] ${
                  open
                    ? "translate-y-0 scale-y-100 opacity-100"
                    : "translate-y-3 scale-y-90 opacity-0"
                }`}
              >
                <NavigationMenu
                  locale={locale}
                  dictionary={dictionary}
                  onNavigate={close}
                />
              </div>
            </div>
          </div>

          <div className="grid h-[var(--floating-nav-height)] shrink-0 grid-cols-[2.25rem_1fr_2.25rem] items-center px-2.5 sm:px-3">
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="site-navigation-menu"
              aria-haspopup="dialog"
              aria-label={
                open ? dictionary.a11y.closeMenu : dictionary.a11y.openMenu
              }
              className="inline-flex h-9 w-9 items-center justify-center text-nav-fg transition hover:text-brand-yellow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
              onClick={toggle}
            >
              {open ? (
                <span aria-hidden="true" className="text-2xl leading-none">
                  ×
                </span>
              ) : (
                <span className="flex w-4 flex-col gap-1.5" aria-hidden="true">
                  <span className="h-0.5 w-full bg-current" />
                  <span className="h-0.5 w-full bg-current" />
                </span>
              )}
            </button>

            <Link
              id={titleId}
              href="/"
              className="justify-self-center font-display text-xl tracking-[0.32em] text-nav-fg uppercase transition hover:text-brand-yellow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow sm:text-2xl"
              aria-label={brandName}
              onClick={open ? close : undefined}
            >
              {brandName}
            </Link>

            <span aria-hidden="true" className="h-9 w-9" />
          </div>
        </div>
      </div>
    </>
  );
}
