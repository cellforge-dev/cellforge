"use client";

import { DialRoot } from "dialkit";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useDocumentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const read = () => {
      const t = document.documentElement.dataset.theme;
      setTheme(t === "light" ? "light" : "dark");
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function useMediaQuery(query: string, initialValue = false) {
  const [matches, setMatches] = useState(initialValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const sync = () => setMatches(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

export function DialKitRouteRoot() {
  const pathname = usePathname();
  const isPlayground = pathname === "/playground";
  const dialTheme = useDocumentTheme();
  const shouldOpenByDefault = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!isPlayground) {
      delete document.body.dataset.playgroundRoute;
      return;
    }

    document.body.dataset.playgroundRoute = "true";

    return () => {
      delete document.body.dataset.playgroundRoute;
    };
  }, [isPlayground]);

  if (!isPlayground) {
    return null;
  }

  return (
    <DialRoot
      key={shouldOpenByDefault ? "open-controls" : "collapsed-controls"}
      position="top-right"
      defaultOpen={shouldOpenByDefault}
      theme={dialTheme}
      productionEnabled
    />
  );
}
