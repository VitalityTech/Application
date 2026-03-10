import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;
const hasValidGoogleClientId =
  Boolean(googleClientId) &&
  !googleClientId?.includes("your-google-oauth-client-id") &&
  /\.apps\.googleusercontent\.com$/.test(googleClientId ?? "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {hasValidGoogleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId!}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
