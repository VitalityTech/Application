import React, { useState } from "react";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import {
  BsFillBookmarkStarFill,
  BsEnvelope,
  BsLock,
  BsPerson,
} from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/baseUrl";
import {
  getGoogleClientId,
  isGoogleClientIdConfigured,
} from "../../api/googleClient";

export const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/events";
  const googleClientId = getGoogleClientId();
  const hasGoogleClientId = isGoogleClientIdConfigured(googleClientId);

  const parseResponseBody = async <T,>(response: Response): Promise<T> => {
    const rawText = await response.text();
    if (!rawText) {
      return {} as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch {
      if (!response.ok) {
        throw new Error(
          "Сервер повернув не JSON. Перевір VITE_API_URL у налаштуваннях середовища.",
        );
      }
      throw new Error("Отримано некоректну відповідь сервера");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Валідація
    if (fullName.trim().length < 2) {
      toast.error("Ім'я повинно містити мінімум 2 символи");
      return;
    }

    if (fullName.trim().length > 50) {
      toast.error("Ім'я занадто довге (максимум 50 символів)");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Введіть коректний email (наприклад: user@example.com)");
      return;
    }

    if (password.length < 6) {
      toast.error("Пароль повинен містити мінімум 6 символів");
      return;
    }

    if (/^\d+$/.test(password)) {
      toast.error("Пароль не може містити лише цифри");
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      // 2. РЕАЛЬНИЙ ЗАПИТ ДО БЕКЕНДУ
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(
        `[Register] Response status: ${response.status}, ok: ${response.ok}`,
      );
      const data = await parseResponseBody<{
        access_token?: string;
        user?: unknown;
        message?: string;
      }>(response);
      console.log(`[Register] Parsed data:`, data);

      if (!response.ok) {
        const message =
          response.status === 409
            ? "Користувач з таким email вже існує"
            : data.message || "Registration failed";
        throw new Error(message);
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // 4. УСПІХ ТА ПЕРЕХІД
      toast.success(`Welcome, ${fullName}!`, {
        icon: "🚀",
        duration: 2000,
      });

      navigate(redirectTo);

      // -------------------------------
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const error = err as Error;
      console.error("[Register] Error:", error);
      console.error("[Register] Stack:", error.stack);
      console.log("[Register] API_BASE_URL was:", API_BASE_URL);
      if (error.name === "AbortError") {
        toast.error("Сервер недоступний. Перевірте підключення до мережі.", {
          duration: 5000,
        });
      } else {
        toast.error(
          error.message || "Something went wrong. Is the server running?",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-up failed");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await parseResponseBody<{
        access_token?: string;
        user?: unknown;
        message?: string;
      }>(response);
      if (!response.ok) {
        throw new Error(data.message || "Google sign-up failed");
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Logged in with Google");
      navigate(redirectTo);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Google sign-up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/events"
          className="group flex justify-center items-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-lg border border-slate-100">
            <BsFillBookmarkStarFill size={24} />
          </div>
          <h2 className="text-4xl font-black tracking-tight bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent leading-[1.08] pb-1 transition-all duration-300 group-hover:from-indigo-900 group-hover:to-violet-700">
            Evently
          </h2>
        </Link>
        <p className="mt-4 text-center text-sm text-slate-500 font-medium">
          Join Evently and start creating events people truly remember.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <BsPerson size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-base md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <BsEnvelope size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-base md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <BsLock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-base md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-4 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer shadow-sm
                ${
                  isLoading
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                    : "bg-white border border-slate-900 text-slate-900 hover:shadow-md active:scale-[0.98]"
                }`}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>

            <>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    or
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                {hasGoogleClientId ? (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google sign-up failed")}
                    text="continue_with"
                    shape="pill"
                    theme="outline"
                    size="large"
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full max-w-[320px] rounded-full border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Continue with Google
                  </button>
                )}
                {!hasGoogleClientId && (
                  <p className="text-xs text-slate-400 text-center">
                    Додай VITE_GOOGLE_CLIENT_ID у frontend/.env щоб увімкнути
                    Google Login
                  </p>
                )}
              </div>
            </>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-slate-900 hover:underline underline-offset-4 transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
