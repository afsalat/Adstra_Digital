const DEFAULT_BASE_URL = "https://adstradigital.com";

export function getResolvedBaseUrl() {
  // 1. Explicit env variables take priority
  const envUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }

  // 2. Client-side browser check: if running on localhost or local IP, point to local Django backend
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local")
    ) {
      return "http://localhost:8000/api";
    }
  }

  // 3. Node development server check
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000/api";
  }

  return `${DEFAULT_BASE_URL}/api`;
}

class DynamicApiBaseUrl extends String {
  toString() {
    return getResolvedBaseUrl();
  }
  valueOf() {
    return getResolvedBaseUrl();
  }
  [Symbol.toPrimitive]() {
    return getResolvedBaseUrl();
  }
}

class DynamicBaseUrl extends String {
  toString() {
    return getResolvedBaseUrl().replace(/\/api$/, "");
  }
  valueOf() {
    return getResolvedBaseUrl().replace(/\/api$/, "");
  }
  [Symbol.toPrimitive]() {
    return getResolvedBaseUrl().replace(/\/api$/, "");
  }
}

export const API_BASE_URL = new DynamicApiBaseUrl(getResolvedBaseUrl());
export const BASE_URL = new DynamicBaseUrl(getResolvedBaseUrl().replace(/\/api$/, ""));

export default API_BASE_URL;
