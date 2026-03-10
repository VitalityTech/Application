import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../api/baseUrl";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Інше",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    visibility: "public",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Перевірка на авторизацію
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      toast.error("You must be logged in to create an event");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Валідація дати: не в минулому
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    if (selectedDate < new Date()) {
      toast.error("You cannot create events in the past");
      setLoading(false);
      return;
    }

    // Перевірка обов'язкових полів
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          capacity: formData.capacity ? Number(formData.capacity) : null,
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        toast.success("Event created successfully!");
        navigate(`/events/${newEvent.id}`); // Редірект на сторінку деталей
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || errorData.error || "Failed to create event";
        toast.error(errorMessage);
        console.error("Event creation error:", errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-semibold transition-colors"
      >
        <BsArrowLeft /> Back
      </button>

      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            ✦ New Event
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-linear-to-br from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent mb-3 whitespace-nowrap">
            Create New Event
          </h1>
          <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto leading-relaxed">
            Fill in the details below to bring your event to life
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-2 ml-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Tech Conference 2025"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2 ml-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              placeholder="Describe what makes your event special..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 ml-1">
              Category
            </label>
            <select
              value={formData.category}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="Конференції">Конференції</option>
              <option value="Мітапи">Мітапи</option>
              <option value="Воркшопи">Воркшопи</option>
              <option value="Вебінари">Вебінари</option>
              <option value="Нетворкінг">Нетворкінг</option>
              <option value="Інше">Інше</option>
            </select>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 ml-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch (error) {
                    // Fallback якщо showPicker не підтримується
                    console.log(error);
                  }
                }}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 ml-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                onClick={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch (error) {
                    // Fallback якщо showPicker не підтримується
                    console.log(error);
                  }
                }}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold mb-2 ml-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Convention Center"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-bold mb-2 ml-1">
              Capacity (optional)
            </label>
            <input
              type="number"
              placeholder="Leave empty for unlimited"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
            />
            <p className="text-[11px] text-slate-400 mt-2 ml-1">
              Maximum number of participants. Leave empty for unlimited
              capacity.
            </p>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <label className="block text-sm font-bold ml-1">Visibility</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === "public"}
                  className="w-5 h-5 accent-indigo-600"
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.value })
                  }
                />
                <div>
                  <p className="text-sm font-bold group-hover:text-indigo-600 transition-colors">
                    Public - Anyone can see and join this event
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === "private"}
                  className="w-5 h-5 accent-indigo-600"
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.value })
                  }
                />
                <div>
                  <p className="text-sm font-bold group-hover:text-indigo-600 transition-colors">
                    Private - Only invited people can see this event
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:grid sm:grid-cols-2 gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-4 px-6 border-2 border-slate-200 bg-white text-slate-600 rounded-2xl font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-base hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
