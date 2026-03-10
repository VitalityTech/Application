const GOOGLE_PLACEHOLDER = "your-google-oauth-client-id";
// Public OAuth client id fallback for deployments where env injection is misconfigured.
const GOOGLE_CLIENT_ID_FALLBACK =
  "976945532072-rllahg5pldtrm2f0gcpr72n0avh61qtj.apps.googleusercontent.com";

// Vercel/UI sometimes stores env values with accidental quotes or trailing spaces.
export const getGoogleClientId = (): string | undefined => {
  const rawValue = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (typeof rawValue !== "string") {
    return GOOGLE_CLIENT_ID_FALLBACK;
  }

  const normalized = rawValue.trim().replace(/^['\"]|['\"]$/g, "");
  return normalized.length > 0 ? normalized : GOOGLE_CLIENT_ID_FALLBACK;
};

export const isGoogleClientIdConfigured = (
  clientId: string | undefined,
): boolean => {
  if (!clientId) {
    return false;
  }

  return !clientId.toLowerCase().includes(GOOGLE_PLACEHOLDER);
};
