import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string | null;
  icons?: Metadata["icons"];
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  twitterHandle?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  alternates?: Record<string, string>;
  publishedTime?: string;
  modifiedTime?: string;
}

export const generateMetadata = ({
  title = `${process.env.NEXT_PUBLIC_APP_NAME} - Smart Social Media Marketing Platform`,
  description = "Streamline your social media management with AI-powered analytics, scheduling, and content generation.",
  image = "/thumbnail.png",
  icons = [
    {
      rel: "icon",
      url: "/icons/favicon-16x16.png",
      sizes: "16x16",
    },
    {
      rel: "icon",
      url: "/icons/favicon-32x32.png",
      sizes: "32x32",
    },
  ],
  noIndex = false,
  keywords = [
    "AI content creation",
    "content automation",
    "AI writing assistant",
    "content generation",
    "artificial intelligence",
    "content marketing",
  ],
  author = process.env.NEXT_PUBLIC_AUTHOR_NAME,
  twitterHandle = "@yourtwitterhandle",
  type = "website",
  locale = "en_US",
  alternates = {},
  publishedTime,
  modifiedTime,
}: MetadataProps = {}): Metadata => {
  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://luro-ai.vercel.app",
  );
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${metadataBase.origin}${image}`
    : null;

  return {
    metadataBase,
    title: {
      default: title,
      template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
    },
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    publisher: process.env.NEXT_PUBLIC_APP_NAME,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    formatDetection: {
      address: false,
      telephone: false,
    },
    icons,

    // OpenGraph
    openGraph: {
      type,
      siteName: process.env.NEXT_PUBLIC_APP_NAME,
      title,
      description,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
      locale,
      alternateLocale: Object.keys(alternates),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: twitterHandle,
      ...(imageUrl && { images: [imageUrl] }),
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION || "",
    },
  };
};
