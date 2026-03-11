import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

type GoogleAuthButtonProps = {
  isConfigured: boolean;
  label: string;
  text: "signin_with" | "signup_with" | "continue_with" | "signin";
  onSuccess: (credentialResponse: CredentialResponse) => Promise<void> | void;
  onError: () => void;
};

export const GoogleAuthButton = ({
  isConfigured,
  label,
  text,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) => {
  if (!isConfigured) {
    return (
      <button
        type="button"
        disabled
        className="w-full max-w-[320px] rounded-full border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="relative w-full max-w-[320px] cursor-pointer overflow-hidden rounded-full">
      <div className="pointer-events-none flex min-h-13 items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-6 py-3 text-[15px] font-medium text-slate-700 shadow-sm transition-colors">
        <FcGoogle className="h-6 w-6 shrink-0" />
        <span>{label}</span>
      </div>

      <div className="absolute inset-0 z-10 overflow-hidden rounded-full opacity-[0.01]">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          text={text}
          type="standard"
          shape="pill"
          theme="outline"
          size="large"
          width="320"
          logo_alignment="left"
          containerProps={{
            className: "h-full w-full cursor-pointer [&>div]:!h-full [&>div]:!w-full",
          }}
        />
      </div>
    </div>
  );
};
