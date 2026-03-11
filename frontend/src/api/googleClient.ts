const GOOGLE_PLACEHOLDER = "your-google-oauth-client-id";

// Vercel/UI sometimes stores env values with accidental quotes or trailing spaces.
export const getGoogleClientId = (): string | undefined => {
  const rawValue = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (typeof rawValue !== "string") {
    return undefined;
  }

  const normalized = rawValue.trim().replace(/^['"]|['"]$/g, "");
  return normalized.length > 0 ? normalized : undefined;
};

export const isGoogleClientIdConfigured = (
  clientId: string | undefined,
): boolean => {
  if (!clientId) {
    return false;
  }

  return !clientId.toLowerCase().includes(GOOGLE_PLACEHOLDER);
};
