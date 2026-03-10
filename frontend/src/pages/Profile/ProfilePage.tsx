import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BsPlusLg, BsCalendar3, BsGeoAlt } from "react-icons/bs";
import { API_BASE_URL } from "../../api/baseUrl";

interface EventItem {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  userId?: string;
}

export const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user.id) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/users/me/events?userId=${user.id}`,
        );
        if (response.ok) {
          const data = (await response.json()) as EventItem[];
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to load profile events", error);
      }
    };

    void fetchEvents();
  }, [user.id]);

  const organized = useMemo(
    () => events.filter((event) => event.userId === user.id),
    [events, user.id],
  );

  const joined = useMemo(
    () => events.filter((event) => event.userId !== user.id),
    [events, user.id],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 border-2 border-indigo-300 text-indigo-700 font-black text-2xl flex items-center justify-center">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {user.fullName || "User"}
              </h1>
              <p className="text-slate-500 font-medium">
                {user.email || "No email"}
              </p>
            </div>
          </div>

          <Link
            to="/create-event"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-colors"
          >
            <BsPlusLg /> Створити подію
          </Link>
        </section>

        <section>
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            Особистий кабінет
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                Організовую ({organized.length})
              </h3>
              <div className="space-y-3">
                {organized.length > 0 ? (
                  organized.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                    >
                      <p className="font-black text-slate-900 mb-1">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                        <BsCalendar3 />
                        {new Date(event.startDate).toLocaleString("uk-UA")}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <BsGeoAlt /> {event.location || "Online"}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 font-medium">
                    Поки що немає подій.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                Беру участь ({joined.length})
              </h3>
              <div className="space-y-3">
                {joined.length > 0 ? (
                  joined.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                    >
                      <p className="font-black text-slate-900 mb-1">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                        <BsCalendar3 />
                        {new Date(event.startDate).toLocaleString("uk-UA")}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <BsGeoAlt /> {event.location || "Online"}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-slate-400 font-medium">
                    Поки що нічого немає.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
