import { Link, useLocation, useNavigate } from "react-router-dom";
import { BsCalendar4Event, BsPlusLg, BsBoxArrowRight } from "react-icons/bs";

export const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navItemClass = (path: string) =>
    `text-sm font-bold transition-colors ${
      location.pathname === path
        ? "text-indigo-600"
        : "text-slate-500 hover:text-slate-900"
    }`;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            to="/events"
            className="flex items-center gap-2 text-xl font-black text-slate-900"
          >
            <BsCalendar4Event className="text-indigo-600" />
            <span>Evently</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/events" className={navItemClass("/events")}>
              Events
            </Link>
            <Link to="/my-events" className={navItemClass("/my-events")}>
              My Events
            </Link>
            <Link to="/profile" className={navItemClass("/profile")}>
              Profile
            </Link>
          </nav>
        </div>

        {token ? (
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              to="/create-event"
              className="bg-indigo-600 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0"
            >
              <BsPlusLg />
              <span className="hidden sm:inline">Create Event</span>
            </Link>

            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-700 truncate max-w-40"
            >
              <span className="w-8 h-8 rounded-full border-2 border-indigo-200 text-indigo-600 flex items-center justify-center text-xs font-black">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </span>
              <span className="truncate">{user.fullName || "User"}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              aria-label="Logout"
            >
              <BsBoxArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
