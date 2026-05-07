const DEFAULT_API_BASE_URL = "http://localhost:8000";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export default API_BASE_URL;
