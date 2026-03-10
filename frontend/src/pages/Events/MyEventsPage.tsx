import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  BsPlusLg,
  BsCalendar3,
  BsListUl,
  BsArrowLeft, // Додано для навігації
} from "react-icons/bs";
import "./calendar-custom.css";
import { API_BASE_URL } from "../../api/baseUrl";

interface Event {
  id: string;
  title: string;
  startDate: string;
}

export const MyEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<"month" | "week">("month");
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/users/me/events?userId=${user.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching my events:", error);
      }
    };
    if (user.id) fetchMyEvents();
  }, [user.id]);

  // Функція для відображення подій у клітинках календаря
  const tileContent = ({
    date,
    view: currentView,
  }: {
    date: Date;
    view: string;
  }): ReactNode => {
    if (currentView === "month") {
      const dayEvents = events.filter(
        (e) => new Date(e.startDate).toDateString() === date.toDateString(),
      );
      return (
        <div className="flex flex-col gap-1 mt-1">
          {dayEvents.map((e) => (
            <div
              key={e.id}
              className="bg-indigo-50 text-indigo-600 text-[10px] p-1 rounded font-bold truncate text-left"
            >
              {e.title}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(activeDate);
    const currentDay = day.getDay();
    const diffToMonday = (currentDay + 6) % 7;
    day.setDate(day.getDate() - diffToMonday + index);
    day.setHours(0, 0, 0, 0);
    return day;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Кнопка повернення на головну */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-slate-500 mb-5 font-bold hover:text-indigo-600 transition-all group"
        >
          <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Назад до подій
        </button>

        <div className="mb-8">
          {/* Заголовок */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-3">
              ✦ My Events
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent mb-2">
              Мої Події
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-sm leading-relaxed">
              Переглядайте та керуйте своїм календарем
            </p>
          </div>

          {/* Контроли — на мобільному вертикально */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Перемикач виглядів */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm w-fit">
              <button
                onClick={() => setView("month")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  view === "month"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <BsCalendar3 size={16} /> Місяць
              </button>
              <button
                onClick={() => setView("week")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  view === "week"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <BsListUl size={16} /> Тиждень
              </button>
            </div>

            <Link
              to="/create-event"
              className="bg-linear-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.97] whitespace-nowrap w-full sm:w-auto"
            >
              <BsPlusLg /> Створити подію
            </Link>
          </div>
        </div>

        {/* Секція календаря */}
        <div className="bg-white p-4 md:p-8 rounded-4xl md:rounded-[40px] shadow-sm border border-slate-100 min-h-150">
          {view === "month" ? (
            <Calendar
              locale="uk-UA"
              tileContent={tileContent}
              value={activeDate}
              onClickDay={(date) => {
                setActiveDate(date);
                const dayEvent = events.find(
                  (e) =>
                    new Date(e.startDate).toDateString() ===
                    date.toDateString(),
                );
                if (dayEvent) navigate(`/events/${dayEvent.id}`);
              }}
              className="w-full border-none"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const dayEvents = events.filter(
                  (event) =>
                    new Date(event.startDate).toDateString() ===
                    day.toDateString(),
                );

                return (
                  <div
                    key={day.toISOString()}
                    className="border border-slate-200 rounded-2xl p-3 min-h-28"
                  >
                    <p className="text-xs text-slate-500 font-bold mb-2">
                      {day.toLocaleDateString("uk-UA", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>

                    {dayEvents.length > 0 ? (
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="w-full text-left bg-indigo-50 text-indigo-700 rounded-lg p-2 text-xs font-bold hover:bg-indigo-100 transition-colors"
                          >
                            <p className="truncate">{event.title}</p>
                            <p className="text-[10px] text-indigo-500 mt-0.5">
                              {new Date(event.startDate).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-medium">
                        No events
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-slate-400 font-bold text-xl mb-3">
                You are not part of any events yet. Explore public events and
                join.
              </p>
              <Link
                to="/events"
                className="text-indigo-600 font-black text-lg hover:underline"
              >
                Переглянути публічні події та приєднатися
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
