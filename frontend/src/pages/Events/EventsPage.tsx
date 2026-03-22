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

// --- КОНСТАНТИ КОЛЬОРІВ ТА КАТЕГОРІЙ ---
const CATEGORY_MAP: Record<string, string> = {
  tech: "bg-blue-50 text-blue-600 border-blue-100",
  music: "bg-purple-50 text-purple-600 border-purple-100",
  art: "bg-pink-50 text-pink-600 border-pink-100",
  sport: "bg-orange-50 text-orange-600 border-orange-100",
  food: "bg-emerald-50 text-emerald-600 border-emerald-100",
  business: "bg-indigo-50 text-indigo-600 border-indigo-100",
  charity: "bg-red-50 text-red-600 border-red-100",
  конференції: "bg-blue-50 text-blue-600 border-blue-100",
  мітапи: "bg-purple-50 text-purple-600 border-purple-100",
  воркшопи: "bg-pink-50 text-pink-600 border-pink-100",
  вебінари: "bg-emerald-50 text-emerald-600 border-emerald-100",
  нетворкінг: "bg-orange-50 text-orange-600 border-orange-100",
};

const CATEGORY_ALIASES: Record<string, string> = {
  tech: "tech",
  music: "music",
  art: "art",
  sport: "sport",
  sports: "sport",
  food: "food",
  business: "business",
  charity: "charity",
  конференції: "tech",
  мітапи: "music",
  воркшопи: "art",
  вебінари: "food",
  нетворкінг: "sport",
};

const normalizeCategory = (category?: string) => {
  const key = (category || "").trim().toLowerCase();
  return CATEGORY_ALIASES[key] || "other";
};

const getCategoryStyles = (category: string) => {
  const normalizedCategory = normalizeCategory(category);
  return (
    CATEGORY_MAP[normalizedCategory] ||
    "bg-slate-50 text-slate-500 border-slate-100"
  );
};

const EVENT_MOOD_MAP: Record<string, string> = {
  tech: "Startup Rush",
  music: "High Energy",
  art: "Creative Flow",
  sport: "Action Mode",
  food: "Warm Social",
  business: "Deep Networking",
  charity: "Purpose Driven",
  конференції: "Deep Focus",
  мітапи: "Startup Rush",
  воркшопи: "Hands-on Lab",
  вебінари: "Calm Learning",
  нетворкінг: "Deep Networking",
};

const getEventMood = (category?: string) => {
  const key = normalizeCategory(category);
  return EVENT_MOOD_MAP[key] || "Open Format";
};

const getTrustSignal = (participantsCount: number, capacity: number | null) => {
  if (capacity && participantsCount >= capacity) {
    return {
      label: "Sold out momentum",
      tone: "text-red-600",
    };
  }

  if (participantsCount >= 20) {
    return {
      label: "High demand this week",
      tone: "text-indigo-600",
    };
  }

  if (participantsCount >= 8) {
    return {
      label: "Growing fast",
      tone: "text-violet-600",
    };
  }

  return {
    label: "Fresh event",
    tone: "text-emerald-600",
  };
};

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
  { value: "all", label: "Усі категорії" },
  { value: "tech", label: "tech" },
  { value: "music", label: "music" },
  { value: "art", label: "art" },
  { value: "sport", label: "sport" },
  { value: "food", label: "food" },
  { value: "business", label: "business" },
  { value: "charity", label: "charity" },
  { value: "other", label: "other" },
];

const DEMO_EVENTS: Event[] = [
  {
    id: "demo-tech-meetup",
    title: "Spring Tech Meetup",
    category: "tech",
    description:
      "Обговорення AI-трендів, NestJS best practices та networking з розробниками.",
    startDate: "2026-03-29T14:00:00.000Z",
    location: "Unit City, Київ",
    capacity: null,
    visibility: "PUBLIC",
    participants: [],
    _count: { participants: 0 },
  },
  {
    id: "demo-cyber-night",
    title: "CyberPunk Night",
    category: "music",
    description:
      "Тематична подія про digital-art, музику та live-перформанси у стилі кіберпанк.",
    startDate: "2026-03-25T17:00:00.000Z",
    location: "Secret Bunker, вулиця Хрещатик, 1",
    capacity: null,
    visibility: "PUBLIC",
    participants: [],
    _count: { participants: 0 },
  },
  {
    id: "demo-business-network",
    title: "Startup Networking Evening",
    category: "business",
    description:
      "Швидкі знайомства для фаундерів, маркетологів і продакт-менеджерів.",
    startDate: "2026-04-02T15:30:00.000Z",
    location: "Kooperativ, Київ",
    capacity: 80,
    visibility: "PUBLIC",
    participants: [],
    _count: { participants: 0 },
  },
  {
    id: "demo-webinar-growth",
    title: "Growth Webinar: From Idea to Launch",
    category: "food",
    description:
      "Практичний вебінар про валідацію ідеї, MVP та перших користувачів.",
    startDate: "2026-04-05T16:00:00.000Z",
    location: "Online",
    capacity: null,
    visibility: "PUBLIC",
    participants: [],
    _count: { participants: 0 },
  },
];

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [processingEventId, setProcessingEventId] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user.id) {
        setEvents(DEMO_EVENTS);
        return;
      }

      try {
        const endpoint = `${API_BASE_URL}/auth/users/me/events?userId=${user.id}`;

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
      selectedCategory === "all" ||
      normalizeCategory(event.category) === selectedCategory;

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
      if (!response.ok)
        throw new Error(responseData.message || "Request failed");

      setEvents((prev) =>
        prev.map((item) =>
          item.id === event.id
            ? {
                ...item,
                participants: responseData.participants,
                _count: { participants: responseData.participants.length },
              }
            : item,
        ),
      );

      toast.success(isParticipant ? "You left the event" : "Joined event");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error");
    } finally {
      setProcessingEventId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 pt-1 pb-8 md:pt-2 md:pb-10">
        <div className="mb-4 md:mb-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            {user.id ? "✦ My Workspace" : "✦ Explore"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] pb-1 bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent mb-2">
            {user.id ? "My Space" : "Find an Event"}
          </h1>
          <p className="text-slate-400 font-medium text-sm md:text-base max-w-md leading-relaxed">
            {user.id
              ? "Browse, join, and manage your events in one place"
              : "Discover top events and find inspiration nearby"}
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
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
                <option key={category.value} value={category.value}>
                  {category.label}
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
                (p) => p.id === user.id,
              );
              const isProcessing = processingEventId === event.id;
              const disableJoin = Boolean(isFull && !isParticipant);
              const isGuest = !user.id;
              const trustSignal = getTrustSignal(
                event._count?.participants || 0,
                event.capacity,
              );
              const eventMood = getEventMood(event.category);

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  onClick={(e) => {
                    if (isGuest) e.preventDefault();
                  }}
                  className={`bg-white rounded-[28px] sm:rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col h-full transition-all duration-300 ${
                    isGuest
                      ? "cursor-default"
                      : "cursor-pointer hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-2xl font-black text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      {/* --- ЦЕЙ БЛОК МАЛЮЄ КОЛЬОРОВИЙ БЕЙДЖ --- */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shrink-0 border transition-all ${getCategoryStyles(event.category || "other")}`}
                      >
                        {normalizeCategory(event.category)}
                      </span>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      Mood: {eventMood}
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
                      <div className="flex flex-col">
                        <span
                          className={
                            isFull ? "text-red-500" : "text-emerald-600"
                          }
                        >
                          {event._count?.participants || 0} /{" "}
                          {event.capacity || "∞"} participants{" "}
                          {isFull && "(Full)"}
                        </span>
                        <span
                          className={`text-xs font-semibold ${trustSignal.tone}`}
                        >
                          {trustSignal.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isGuest ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/login");
                      }}
                      className="w-full py-4 rounded-2xl font-black text-center transition-all active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                      Login to Join
                    </button>
                  ) : (
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
                  )}
                </Link>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-4xl sm:rounded-[40px] p-10 sm:p-20 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 mb-6 font-bold text-xl">
                {search || selectedCategory !== "all"
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
