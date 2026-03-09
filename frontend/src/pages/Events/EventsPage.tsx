import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsCalendar4Event,
  BsPlusLg,
  BsGeoAlt,
  BsClock,
  BsPeople,
  BsBoxArrowRight,
} from "react-icons/bs";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: string;
  capacity: number | null;
  _count: { participants: number };
}

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Змінено на /auth/events для відповідності твоєму бекенду
        const response = await fetch("http://localhost:3000/auth/events");
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/events"
              className="flex items-center gap-2 font-black text-xl text-slate-900"
            >
              <BsCalendar4Event className="text-indigo-600" />
              <span>Evently</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
              <Link
                to="/events"
                className="text-slate-900 border-b-2 border-slate-900 py-5"
              >
                Events
              </Link>
              <Link
                to="/my-events"
                className="hover:text-slate-900 transition-colors"
              >
                My Events
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/create-event"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <BsPlusLg /> Create Event
            </Link>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 font-bold text-sm">
              <Link
                to="/my-events"
                className="text-slate-900 cursor-pointer"
              >
                {user.fullName || "Guest"}
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <BsBoxArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Discover Events
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Find and join exciting events happening around you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => {
              const isFull =
                event.capacity && event._count.participants >= event.capacity;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="mb-6">
                    <Link to={`/events/${event.id}`}>
                      <h3 className="text-2xl font-black text-slate-900 mb-3 hover:text-indigo-600 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                    </Link>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                      {event.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-4 text-sm font-bold text-slate-600 mb-10 grow">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <BsCalendar4Event className="text-indigo-600" />
                      </div>
                      <span>
                        {new Date(event.startDate).toLocaleDateString("uk-UA", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <BsClock className="text-indigo-600" />
                      </div>
                      <span>
                        {new Date(event.startDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <BsGeoAlt className="text-indigo-600" />
                      </div>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <BsPeople className="text-indigo-600" />
                      </div>
                      <span
                        className={isFull ? "text-red-500" : "text-emerald-600"}
                      >
                        {event._count?.participants || 0} /{" "}
                        {event.capacity || "∞"} participants{" "}
                        {isFull && "(Full)"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className={`w-full py-4 rounded-2xl font-black text-center transition-all active:scale-95 shadow-lg ${
                      isFull
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100"
                    }`}
                  >
                    {isFull ? "Full Event" : "View & Join"}
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 mb-6 font-bold text-xl">
                No public events available right now.
              </p>
              <Link
                to="/create-event"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all"
              >
                <BsPlusLg /> Create the first one
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
