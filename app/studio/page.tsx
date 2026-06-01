import { StudioClient } from "@/app/studio/studio-client";
import { loaderRegistry } from "@/lib/registry-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio",
  description: "Theme CellForge loaders with live controls, framework code output, and install-ready snippets."
};

interface StudioPageProps {
  searchParams?: Promise<{
    loader?: string;
  }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const params = await searchParams;
  const loaderOptions = loaderRegistry.map((loader) => ({
    slug: loader.slug,
    title: loader.title,
    description: loader.description,
    componentName: loader.componentName
  }));

  return (
    <StudioClient
      initialSlug={params?.loader}
      loaders={loaderOptions}
    />
  );
}
