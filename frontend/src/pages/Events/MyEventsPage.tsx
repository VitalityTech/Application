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

interface Event {
  id: string;
  title: string;
  startDate: string;
}

export const MyEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<"month" | "week">("month");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/auth/users/${user.id}/events`,
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Кнопка повернення на головну */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-slate-500 mb-6 font-bold hover:text-indigo-600 transition-all group"
        >
          <BsArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Назад до подій
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              Мої Події
            </h1>
            <p className="text-slate-500 font-bold text-lg">
              Переглядайте та керуйте своїм календарем
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Перемикач виглядів */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
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
              className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <BsPlusLg /> Створити подію
            </Link>
          </div>
        </div>

        {/* Секція календаря */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 min-h-150">
          {events.length > 0 ? (
            <Calendar
              locale="uk-UA" // Українська локалізація
              tileContent={tileContent}
              onClickDay={(date) => {
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
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <BsCalendar3 size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-xl mb-4">
                Ви ще не берете участі в жодній події.
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
