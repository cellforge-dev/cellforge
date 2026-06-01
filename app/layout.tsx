import type { Metadata } from "next";

const siteUrl =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL("https://cellforge.dev");

const siteDescription =
  "CellForge is an open-source loader system for React teams: animated cell primitives, a live studio, and install-ready source snippets.";

const defaultTitle = "CellForge";

const ogImageAlt =
  "CellForge mark: a forged cell cluster inside a soft square app icon.";

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: ogImageAlt,
  type: "image/png" as const
};

const creatorName = "CellForge";
const creatorUrl = "https://cellforge.dev";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine
} from "geist/font/pixel";
import type { ReactNode } from "react";

import { RouteAwareSiteFooter } from "@/components/route-aware-site-footer";
import { SiteHeaderNav } from "@/components/site-header-nav";
import { DialKitRouteRoot } from "@/components/dialkit-route-root";
import "dialkit/styles.css";
import "./globals.css";

const fontVariables = [
  GeistSans.variable,
  GeistMono.variable,
  GeistPixelSquare.variable,
  GeistPixelGrid.variable,
  GeistPixelCircle.variable,
  GeistPixelTriangle.variable,
  GeistPixelLine.variable
].join(" ");

const themeInitScript = `(() => {
  try {
    const key = "cellforge-theme";
    const stored = localStorage.getItem(key);
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
      document.documentElement.style.colorScheme = stored;
    } else {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  } catch {
    // Ignore storage errors in restricted contexts and keep dark default.
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();`;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  applicationName: defaultTitle,
  title: {
    default: defaultTitle,
    template: "%s | CellForge"
  },
  description: siteDescription,
  keywords: [
    "CellForge",
    "React",
    "component library",
    "cell loader",
    "loaders",
    "loading",
    "shadcn",
    "shadcn/ui",
    "registry",
    "Tailwind CSS",
    "UI",
    "npm",
    "open source"
  ],
  icons: {
    icon: [{ url: "/brand/cellforge-avatar.png", type: "image/png" }],
    apple: [{ url: "/brand/cellforge-avatar.png", type: "image/png" }]
  },
  authors: [{ name: creatorName, url: creatorUrl }],
  creator: creatorName,
  publisher: creatorName,
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: defaultTitle,
    title: defaultTitle,
    description: siteDescription,
    ...(siteUrl ? { url: new URL("/", siteUrl).href } : {}),
    images: [ogImage]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
    images: [{ url: "/og.png", alt: ogImageAlt }]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
      style={{ colorScheme: "dark" }}
      data-diffkit-extension="1"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          src="https://cdn.databuddy.cc/databuddy.js"
          data-client-id="3bcee424-7f5b-4bef-b4df-f4d057106989"
          data-track-outgoing-links="true"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body
        className={`${GeistPixelCircle.className} ${fontVariables} flex min-h-dvh flex-col font-medium antialiased`}
        cz-shortcut-listen="true"
      >
        <SiteHeaderNav />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <DialKitRouteRoot />
        <RouteAwareSiteFooter />
      </body>
    </html>
  );
}
