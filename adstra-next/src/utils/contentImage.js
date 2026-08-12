const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://adstradigital.com"
).replace(/\/+$/, "");

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://adstradigital.com"
).replace(/\/+$/, "");

export const DEFAULT_BLOG_IMAGE_PATH =
  "/media/blog_images/best-digital-marketing-agencies-india.png";

export function hasImageSrc(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getMediaUrl(path) {
  if (!path) return "";
  const trimmed = path.trim();
  if (trimmed.startsWith("http")) return trimmed;
  const resolvedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${resolvedPath}`;
}

export function getBlogImagePath(postOrImage) {
  const candidate =
    typeof postOrImage === "string" ? postOrImage : postOrImage?.imageUrl;

  return hasImageSrc(candidate) ? getMediaUrl(candidate) : getMediaUrl(DEFAULT_BLOG_IMAGE_PATH);
}

export function getAbsoluteSiteUrl(path) {
  return new URL(path, SITE_URL).toString();
}
