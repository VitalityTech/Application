const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const { protocol, hostname } = window.location;

  // Local dev: backend is expected on port 3000.
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // Production fallback: use current origin unless VITE_API_URL is set.
  return `${protocol}//${hostname}`;
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();
