import React, { useState } from "react";
import { BsFillBookmarkStarFill, BsEnvelope, BsLock } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { API_BASE_URL } from "../../api/baseUrl";
import {
  getGoogleClientId,
  isGoogleClientIdConfigured,
} from "../../api/googleClient";

export const LoginPage = () => {
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
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      // 1. РЕАЛЬНИЙ ЗАПИТ ДО БЕКЕНДУ
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await parseResponseBody<{
        access_token?: string;
        user?: unknown;
        message?: string;
      }>(response);

      if (!response.ok) {
        // Якщо сервер повернув помилку (невірний пароль тощо)
        throw new Error(data.message || "Invalid email or password");
      }

      // --- ОСЬ ЦЕЙ БЛОК ОНОВЛЕНО ЗГІДНО З ТЗ ---

      // 2. ЗБЕРЕЖЕННЯ СЕСІЇ (JWT)
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        // Зберігаємо дані користувача для відображення імені в Header
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // 3. УСПІХ
      toast.success("Welcome back!", { icon: "👋" });
      navigate(redirectTo);

      // ----------------------------------------
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const error = err as Error;
      if (error.name === "AbortError") {
        toast.error("Сервер недоступний. Перевірте підключення до мережі.", {
          duration: 5000,
        });
      } else {
        toast.error(
          error.message || "Connection error. Is the server running?",
        );
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in failed");
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
        throw new Error(data.message || "Google sign-in failed");
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Signed in with Google");
      navigate(redirectTo);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Google sign-in failed");
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
            <BsFillBookmarkStarFill size={26} />
          </div>
          <h2 className="text-4xl font-black tracking-tight bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent leading-[1.08] pb-1 transition-all duration-300 group-hover:from-indigo-900 group-hover:to-violet-700">
            Evently
          </h2>
        </Link>
        <p className="mt-4 text-center text-sm text-slate-500 font-medium">
          Sign in and keep every event, idea, and moment in one elegant place.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl border border-slate-100 sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <BsEnvelope size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none bg-slate-50/50 text-slate-800 text-base md:text-sm placeholder-slate-400"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <BsLock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none bg-slate-50/50 text-slate-800 text-base md:text-sm placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-slate-900 text-sm font-bold transition-all active:scale-[0.98] 
                  ${
                    isLoading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border-slate-900 hover:bg-slate-50 cursor-pointer"
                  }`}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>

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
                    onError={() => toast.error("Google sign-in failed")}
                    use_fedcm_for_button={false}
                    type="standard"
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="320"
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

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-slate-900 hover:underline underline-offset-4 transition-all"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
