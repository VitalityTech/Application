const normalizeEnvUrl = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .trim()
    .replace(/^['\"]|['\"]$/g, "")
    .replace(/\/$/, "");
  return normalized.length > 0 ? normalized : undefined;
};

const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const { hostname } = window.location;

  // Local dev: backend is expected on port 3000.
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Without explicit VITE_API_URL we prefer localhost fallback to avoid
  // accidentally calling frontend static hosting domain as backend API.
  return "http://localhost:3000";
};

export const API_BASE_URL =
  normalizeEnvUrl(import.meta.env.VITE_API_URL as string | undefined) ||
  getDefaultApiUrl();
