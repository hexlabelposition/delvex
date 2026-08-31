import type { Metadata } from "next";
import { siteMetadata } from "@shared/config";

interface CreateMetadataOptions {
  title: string;
  description: string;
  path: string;
}

export function createMetadata({
  title,
  description,
  path,
}: CreateMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteMetadata.locale,
      siteName: siteMetadata.name,
      title,
      description,
      url: path,
      images: [siteMetadata.image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteMetadata.image.url],
    },
  };
}
