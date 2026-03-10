import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsCalendar4Event,
  BsPlusLg,
  BsSearch,
  BsGeoAlt,
  BsClock,
  BsPeople,
} from "react-icons/bs";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../api/baseUrl";

interface Event {
  id: string;
  title: string;
  category?: string;
  description: string;
  startDate: string;
  location: string;
  capacity: number | null;
  visibility: "PUBLIC" | "PRIVATE";
  participants: { id: string; fullName: string }[];
  _count: { participants: number };
}

const CATEGORY_OPTIONS = [
  "Усі категорії",
  "Конференції",
  "Мітапи",
  "Воркшопи",
  "Вебінари",
  "Нетворкінг",
  "Інше",
];

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Усі категорії");
  const [processingEventId, setProcessingEventId] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const endpoint = user.id
          ? `${API_BASE_URL}/auth/users/me/events?userId=${user.id}`
          : `${API_BASE_URL}/auth/events`;

        const response = await fetch(endpoint);
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to load events");
      }
    };
    fetchEvents();
  }, [user.id]);

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      event.title.toLowerCase().includes(query) ||
      (event.description || "").toLowerCase().includes(query) ||
      (event.location || "").toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "Усі категорії" ||
      (event.category || "Інше") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleToggleJoin = async (event: Event) => {
    if (!user.id) {
      toast.error("Please login to join events");
      navigate("/login");
      return;
    }

    const isParticipant = event.participants?.some((p) => p.id === user.id);
    const endpoint = isParticipant ? "leave" : "join";
    setProcessingEventId(event.id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/events/${event.id}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        },
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Request failed");
      }

      setEvents((prev) =>
        prev.map((item) =>
          item.id === event.id
            ? {
                ...item,
                participants: responseData.participants,
                _count: {
                  participants: responseData.participants.length,
                },
              }
            : item,
        ),
      );

      toast.success(isParticipant ? "You left the event" : "Joined event");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      toast.error(message);
    } finally {
      setProcessingEventId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            {user.id ? "My Workspace" : "Discover Events"}
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl">
            {user.id
              ? "Create and manage your own events in a personal space"
              : "Find and join exciting events happening around you"}
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <div className="relative">
              <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const isFull =
                event.capacity && event._count.participants >= event.capacity;
              const isParticipant = event.participants?.some(
                (participant) => participant.id === user.id,
              );
              const isProcessing = processingEventId === event.id;
              const disableJoin = Boolean(isFull && !isParticipant);

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="bg-white rounded-[28px] sm:rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-2xl font-black text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <span className="text-xs font-black bg-slate-100 text-slate-700 px-3 py-1 rounded-full shrink-0">
                        {event.category || "Інше"}
                      </span>
                    </div>
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      void handleToggleJoin(event);
                    }}
                    disabled={isProcessing || disableJoin}
                    className={`w-full py-4 rounded-2xl font-black text-center transition-all active:scale-95 shadow-lg ${
                      disableJoin
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        : isParticipant
                          ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 shadow-none"
                          : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100"
                    }`}
                  >
                    {isProcessing
                      ? "Processing..."
                      : disableJoin
                        ? "Full"
                        : isParticipant
                          ? "Leave Event"
                          : "Join Event"}
                  </button>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-4xl sm:rounded-[40px] p-10 sm:p-20 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 mb-6 font-bold text-xl">
                {search || selectedCategory !== "Усі категорії"
                  ? "No events matched your filters."
                  : user.id
                    ? "You have no events yet. Create your first one."
                    : "No public events available right now."}
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
