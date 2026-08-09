import type { Metadata } from "next";

const defaultImage = "/images/thumbnail.png";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  keywords?: string[];
  noIndex?: boolean;
};

/** Builds consistent route metadata. Relative URLs resolve against root metadataBase. */
export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "Luro AI",
      title,
      description,
      url: path,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: `${title} - Luro AI`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultImage],
    },
  };
}
