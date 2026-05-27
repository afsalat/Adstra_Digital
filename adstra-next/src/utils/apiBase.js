const DEFAULT_BASE_URL = "https://adstradigital.com";

const RAW_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  DEFAULT_BASE_URL;

export const BASE_URL = RAW_BACKEND_URL.replace(/\/+$/, "");

export const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

export default API_BASE_URL;
