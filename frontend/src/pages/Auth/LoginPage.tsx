import React, { useState } from "react";
import { BsFillBookmarkStarFill, BsEnvelope, BsLock } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../api/baseUrl";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/events";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      });

      const data = await response.json();

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
      const error = err as Error;
      toast.error(error.message || "Connection error. Is the server running?");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/events"
          className="flex justify-center items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-lg border border-slate-100">
            <BsFillBookmarkStarFill size={26} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Evently
          </h2>
        </Link>
        <p className="mt-4 text-center text-sm text-slate-500 font-medium">
          Sign in to manage your professional events
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
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none bg-slate-50/50 text-slate-800 placeholder-slate-400"
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
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none bg-slate-50/50 text-slate-800 placeholder-slate-400"
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
