"use client";

import { useCallback, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "cellforge-theme";
const DEFAULT_THEME: ThemeMode = "dark";
const THEME_TRANSITION_STYLE_ID = "cellforge-theme-transition-styles";

function updateTransitionStyles(css: string) {
  const existing = document.getElementById(THEME_TRANSITION_STYLE_ID);
  const styleElement =
    existing instanceof HTMLStyleElement ? existing : document.createElement("style");

  styleElement.id = THEME_TRANSITION_STYLE_ID;
  styleElement.textContent = css;

  if (!existing) {
    document.head.appendChild(styleElement);
  }
}

function createThemeTransitionCss() {
  return `
    ::view-transition-group(root) {
      animation-duration: 700ms;
      animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }

    ::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }

    ::view-transition-new(root) {
      animation-name: cellforge-theme-reveal;
    }

    @keyframes cellforge-theme-reveal {
      from {
        clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
      }
      to {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      ::view-transition-group(root),
      ::view-transition-new(root),
      ::view-transition-old(root) {
        animation-duration: 0ms !important;
      }
    }
  `;
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <circle cx="10" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 1.8v2.1M10 16.1v2.1M18.2 10h-2.1M3.9 10H1.8M15.8 4.2l-1.5 1.5M5.7 14.3l-1.5 1.5M15.8 15.8l-1.5-1.5M5.7 5.7 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <path
        d="M15.8 12.6A6.3 6.3 0 0 1 7.4 4.2a6.7 6.7 0 1 0 8.4 8.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14.2 3.1v2.2M15.3 4.2h-2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      setTheme(stored);
      return;
    }

    applyTheme(DEFAULT_THEME);
    setTheme(DEFAULT_THEME);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = theme ?? DEFAULT_THEME;
    const next: ThemeMode = current === "dark" ? "light" : "dark";
    const switchTheme = () => {
      applyTheme(next);
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      setTheme(next);
    };

    if (typeof document.startViewTransition !== "function") {
      switchTheme();
      return;
    }

    updateTransitionStyles(createThemeTransitionCss());
    document.startViewTransition(switchTheme);
  }, [theme]);

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className="inline-flex w-max min-w-0 rounded-xl border border-border-soft bg-surface p-1 text-fg-strong transition-[background-color,color,opacity] duration-150 ease-out hover:bg-surface-soft focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
    >
      <span className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-bg p-[7px]">
        {theme === "dark" ? <SunIcon className="size-4 sm:size-5" /> : <MoonIcon className="size-4 sm:size-5" />}
      </span>
    </button>
  );
}
