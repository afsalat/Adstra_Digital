export const SITE_URL = "https://adstradigital.com";
export const DEFAULT_BLOG_IMAGE_PATH =
  "/media/blog_images/best-digital-marketing-agencies-india.png";

export function hasImageSrc(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getBlogImagePath(postOrImage) {
  const candidate =
    typeof postOrImage === "string" ? postOrImage : postOrImage?.imageUrl;

  return hasImageSrc(candidate) ? candidate.trim() : DEFAULT_BLOG_IMAGE_PATH;
}

export function getAbsoluteSiteUrl(path) {
  return new URL(path, SITE_URL).toString();
}
