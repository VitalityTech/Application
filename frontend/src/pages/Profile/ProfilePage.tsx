import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsPlusLg,
  BsCalendar3,
  BsGeoAlt,
  BsStar,
  BsPeople,
} from "react-icons/bs";
import { API_BASE_URL } from "../../api/baseUrl";

interface EventItem {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  userId?: string;
}

export const ProfilePage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  const userString = localStorage.getItem("user");
  const user = useMemo(() => {
    try {
      return userString ? JSON.parse(userString) : {};
    } catch {
      return {};
    }
  }, [userString]);

  const initials = useMemo(() => {
    const name: string = user?.fullName || user?.email || "?";
    return name
      .split(" ")
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE_URL}/auth/users/me/events?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, [user?.id]);

  const organized = useMemo(
    () => events.filter((e) => e.userId === user?.id),
    [events, user?.id],
  );

  const joined = useMemo(
    () => events.filter((e) => e.userId !== user?.id),
    [events, user?.id],
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HERO */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-linear-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
              <span className="text-white text-2xl md:text-3xl font-black tracking-tight">
                {initials}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-3">
                ✦ Профіль
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-[1.12] pb-1 bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent mb-5 truncate">
                {user?.fullName || "Користувач"}
              </h1>
              <p className="text-slate-400 font-medium text-sm truncate">
                {user?.email || ""}
              </p>
            </div>

            {/* CTA */}
            <Link
              to="/create-event"
              className="bg-linear-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.97] whitespace-nowrap self-start sm:self-auto"
            >
              <BsPlusLg /> Створити подію
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <BsStar className="mx-auto text-indigo-500 mb-1" size={18} />
              <p className="text-2xl font-black text-slate-800">
                {organized.length}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Організовано
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <BsPeople className="mx-auto text-emerald-500 mb-1" size={18} />
              <p className="text-2xl font-black text-slate-800">
                {joined.length}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Відвідую
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <BsCalendar3 className="mx-auto text-violet-500 mb-1" size={18} />
              <p className="text-2xl font-black text-slate-800">
                {events.length}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Всього
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EVENT CARDS */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organized */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-base">
                Організовую
              </h2>
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">
                {organized.length}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {organized.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <BsStar size={32} className="mb-3" />
                  <p className="text-sm font-medium">
                    Немає організованих подій
                  </p>
                </div>
              ) : (
                organized.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BsStar className="text-indigo-500" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate leading-snug">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <BsCalendar3 size={10} />
                          {formatDate(event.startDate)}
                        </span>
                        {event.location && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <BsGeoAlt size={10} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Joined */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-base">
                Беру участь
              </h2>
              <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
                {joined.length}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {joined.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <BsPeople size={32} className="mb-3" />
                  <p className="text-sm font-medium">Немає приєднаних подій</p>
                </div>
              ) : (
                joined.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BsPeople className="text-emerald-500" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate leading-snug">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <BsCalendar3 size={10} />
                          {formatDate(event.startDate)}
                        </span>
                        {event.location && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <BsGeoAlt size={10} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
