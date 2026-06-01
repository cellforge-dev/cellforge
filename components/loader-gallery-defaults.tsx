import type { HeroNavLink, LoaderGalleryHeroContent } from "@/components/loader-gallery.types";

const HERO_SHADCN_INSTALL_COMMAND = "npx shadcn@latest add @cellforge/cell-square-3";

const DEFAULT_HERO_NAV_LINKS: readonly HeroNavLink[] = [
  { label: "Introduction", href: "/getting-started/introduction" },
  { label: "Usage", href: "/getting-started/usage" },
  { label: "Manual setup", href: "/getting-started/manual" },
  { label: "Studio", href: "/studio" }
];

const DEFAULT_HERO_TITLE = (
  <span className="block">
    Sharp loaders for product interfaces.
  </span>
);

const DEFAULT_HERO_DESCRIPTION =
  "Pick a loader, set a clearer color mood and cell style, then open Studio when you need exact props and export-ready code.";

export const LOADER_GALLERY_DEFAULT_DETAIL_PREVIEW_SCALE = 3;
export const LOADER_GALLERY_DEFAULT_DETAIL_DOT_BOOST = 11;

export const LOADER_GALLERY_DEFAULT_HERO_CONTENT: LoaderGalleryHeroContent = {
  title: DEFAULT_HERO_TITLE,
  description: DEFAULT_HERO_DESCRIPTION,
  navLinks: DEFAULT_HERO_NAV_LINKS,
  installCommand: HERO_SHADCN_INSTALL_COMMAND
};
