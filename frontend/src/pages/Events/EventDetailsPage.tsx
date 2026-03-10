import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BsArrowLeft,
  BsCalendar4Event,
  BsGeoAlt,
  BsPeople,
  BsPersonCheck,
  BsPersonDash,
} from "react-icons/bs";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../api/baseUrl";

interface Participant {
  id: string;
  fullName: string;
}

interface EventDetails {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: string;
  capacity?: number | null;
  userId: string;
  participants: Participant[];
  _count?: { participants: number };
}

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isParticipant = event?.participants.some((p) => p.id === user.id);
  const isOrganizer = event?.userId === user.id;
  const isFull = Boolean(
    event?.capacity &&
    (event?._count?.participants || event?.participants.length || 0) >=
      event.capacity,
  );

  // Використовуємо useEffect з функцією всередині, щоб уникнути помилки exhaustive-deps
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/events/${id}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setEvent(data);
      } catch {
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]); // Тепер залежність тільки від id

  const handleToggleJoin = async () => {
    if (!user.id) {
      toast.error("Please login to join events");
      return navigate("/login");
    }

    setIsProcessing(true);
    const endpoint = isParticipant ? "leave" : "join";

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/events/${id}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        },
      );

      if (response.ok) {
        toast.success(
          isParticipant ? "You left the event" : "Successfully joined!",
        );

        // Оновлюємо дані вручну після успішної дії
        const updatedResponse = await fetch(
          `${API_BASE_URL}/auth/events/${id}`,
        );
        const updatedData = await updatedResponse.json();
        setEvent(updatedData);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Something went wrong");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !isOrganizer) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this event?",
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/events/${event.id}?userId=${user.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      toast.success("Event deleted");
      navigate("/events");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      toast.error(message);
    }
  };

  const handleEditEvent = async () => {
    if (!event || !isOrganizer) return;

    const nextTitle = window.prompt("Event title", event.title);
    if (nextTitle === null || !nextTitle.trim()) return;

    const nextLocation = window.prompt("Location", event.location || "");
    if (nextLocation === null || !nextLocation.trim()) return;

    const currentDate = new Date(event.startDate);
    const defaultDate = currentDate.toISOString().slice(0, 10);
    const defaultTime = currentDate.toTimeString().slice(0, 5);
    const nextDate = window.prompt("Date (YYYY-MM-DD)", defaultDate);
    const nextTime = window.prompt("Time (HH:MM)", defaultTime);

    if (!nextDate || !nextTime) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: nextTitle.trim(),
          location: nextLocation.trim(),
          date: nextDate,
          time: nextTime,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update event");
      }

      setEvent((prev) => (prev ? { ...prev, ...responseData } : prev));
      toast.success("Event updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse font-bold text-indigo-600 text-xl text-center">
          Loading event details...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Event not found
        </h2>
        <button
          onClick={() => navigate("/events")}
          className="text-indigo-600 font-bold"
        >
          Return to Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-slate-500 mb-8 font-bold hover:text-indigo-600 transition-all"
      >
        <BsArrowLeft /> Back to Events
      </button>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 mb-6">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-6 mb-10">
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
              <BsCalendar4Event className="text-indigo-600 text-xl" />
              <span className="font-bold text-slate-700">
                {new Date(event.startDate).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
              <BsGeoAlt className="text-indigo-600 text-xl" />
              <span className="font-bold text-slate-700">{event.location}</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
              <BsPeople className="text-indigo-600 text-xl" />
              <span className="font-bold text-slate-700">
                {event._count?.participants || event.participants.length} /{" "}
                {event.capacity || "∞"} participants
              </span>
            </div>
          </div>

          <h3 className="text-xl font-black mb-4">About this event</h3>
          <p className="text-slate-600 leading-relaxed text-lg font-medium">
            {event.description ||
              "No additional details provided by the organizer."}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit sticky top-8">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <BsPeople className="text-indigo-600 text-2xl" />
            Participants ({event.participants?.length || 0})
          </h3>

          <div className="space-y-3 mb-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {event.participants && event.participants.length > 0 ? (
              event.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-50"
                >
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs">
                    {p.fullName.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {p.fullName}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 font-medium text-center py-4 italic">
                No one joined yet.
              </p>
            )}
          </div>

          <button
            onClick={handleToggleJoin}
            disabled={isProcessing || (isFull && !isParticipant)}
            // Виправлено: використання rounded-3xl замість довільного значення
            className={`w-full py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
              isFull && !isParticipant
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : isParticipant
                  ? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 shadow-slate-100"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100"
            }`}
          >
            {isFull && !isParticipant ? null : isParticipant ? (
              <BsPersonDash size={22} />
            ) : (
              <BsPersonCheck size={22} />
            )}
            {isProcessing
              ? "Processing..."
              : isFull && !isParticipant
                ? "Full"
                : isParticipant
                  ? "Leave Event"
                  : "Join Event"}
          </button>

          {isOrganizer && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() => void handleEditEvent()}
                className="w-full py-4 rounded-3xl font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all active:scale-95"
              >
                Edit Event
              </button>
              <button
                onClick={() => void handleDeleteEvent()}
                className="w-full py-4 rounded-3xl font-black text-red-600 bg-red-50 hover:bg-red-100 transition-all active:scale-95"
              >
                Delete Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
