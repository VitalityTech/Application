import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  BsFillBookmarkStarFill,
  BsEnvelope,
  BsLock,
  BsPerson,
} from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/baseUrl";

export const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/events";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Валідація
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

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
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          response.status === 409
            ? "Користувач з таким email вже існує"
            : data.message || "Registration failed";
        throw new Error(message);
      }

      // --- ДОДАНИЙ БЛОК ЗГІДНО З ТЗ ---

      // 3. ЗБЕРЕЖЕННЯ СЕСІЇ (JWT)
      // Зберігаємо токен та дані користувача для подальших запитів
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
      const error = err as Error;
      console.error("Registration error:", error);
      toast.error(
        error.message || "Something went wrong. Is the server running?",
      );
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
            <BsFillBookmarkStarFill size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Evently
          </h2>
        </Link>
        <p className="mt-4 text-center text-sm text-slate-500 font-medium">
          Create an account to start managing events
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
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
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
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
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
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
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
