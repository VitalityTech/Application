const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const { protocol, hostname } = window.location;

  // On mobile devices opened via LAN IP, use the same host with backend port.
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return `${protocol}//${hostname}:3000`;
  }

  return "http://localhost:3000";
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();
