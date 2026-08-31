const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (rawSiteUrl === undefined) {
  throw new Error("NEXT_PUBLIC_SITE_URL is required");
}

const siteUrl = new URL(rawSiteUrl);

if (
  (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") ||
  siteUrl.pathname !== "/" ||
  siteUrl.search !== "" ||
  siteUrl.hash !== ""
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be an absolute origin without a path, query, or hash",
  );
}

export const siteMetadata = {
  name: "Delvex",
  description: "Manage logistics operations and shipments with Delvex.",
  url: siteUrl,
  locale: "en_US",
  image: {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: "Abstract Delvex logistics illustration with a package and delivery routes.",
  },
} as const;
