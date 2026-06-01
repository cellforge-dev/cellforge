"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteMarkIcon } from "@/components/site-mark-icon";

const navItems = [
  { label: "Gallery", href: "/" },
  { label: "Studio", href: "/studio" },
  { label: "Playground", href: "/playground" },
  { label: "Docs", href: "/getting-started/introduction" },
  { label: "Usage", href: "/getting-started/usage" },
  { label: "Manual setup", href: "/getting-started/manual" }
] as const;

const externalItems = [
  { label: "GitHub", href: "https://github.com/cellforge-dev/cellforge" },
  { label: "npm", href: "https://www.npmjs.com/package/cellforge-loaders" }
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-border-soft bg-bg/82 backdrop-blur-md">
      <div className="mx-auto flex h-15 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="CellForge home"
          className="group inline-flex items-center gap-3 outline-offset-4"
        >
          <span className="inline-flex size-9 items-center justify-center rounded-[10px] border border-border-soft bg-surface p-0.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:rotate-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:rotate-0">
            <SiteMarkIcon className="size-full shrink-0 select-none" />
          </span>
          <span className="theme-text-strong text-lg tracking-tight sm:text-xl">CellForge</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-fg-dim md:flex lg:text-base">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors duration-150 ease-out hover:text-link-hover ${
                  active ? "text-fg-strong" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 text-sm text-fg-dim lg:flex">
          {externalItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-150 ease-out hover:text-link-hover"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
