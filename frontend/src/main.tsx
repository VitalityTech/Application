import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";
import {
  getGoogleClientId,
  isGoogleClientIdConfigured,
} from "./api/googleClient";

const googleClientId = getGoogleClientId();
const hasValidGoogleClientId = isGoogleClientIdConfigured(googleClientId);

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
