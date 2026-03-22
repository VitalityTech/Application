import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../api/baseUrl";

const getCategoryBadgeClass = (category: string) => {
  switch (category.toLowerCase()) {
    case "tech":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "music":
      return "bg-purple-100 text-purple-600 border-purple-200";
    case "art":
      return "bg-pink-100 text-pink-600 border-pink-200";
    case "sports":
      return "bg-orange-100 text-orange-600 border-orange-200";
    case "workshop":
      return "bg-green-100 text-green-600 border-green-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const CATEGORIES = [
  { id: "tech", label: "Tech", color: "bg-blue-500" },
  { id: "music", label: "Music", color: "bg-purple-500" },
  { id: "art", label: "Art", color: "bg-pink-500" },
  { id: "sports", label: "Sports", color: "bg-orange-500" },
  { id: "workshop", label: "Workshop", color: "bg-green-500" },
  { id: "other", label: "Other", color: "bg-slate-500" },
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "tech",
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

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      toast.error("You must be logged in to create an event");
      setLoading(false);
      navigate("/login");
      return;
    }

    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    now.setMinutes(now.getMinutes() - 10); // Запас 10 хвилин

    if (selectedDate < now) {
      toast.error("You cannot create events in the past");
      setLoading(false);
      return;
    }

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
          tags: [formData.category],
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        toast.success("Event created successfully!");
        navigate(`/events/${newEvent.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-15%] w-150 h-150 rounded-full bg-purple-200/40 blur-[130px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-150 h-150 rounded-full bg-blue-200/40 blur-[130px] -z-10 animate-pulse"></div>

      <div className="absolute top-[20%] right-[10%] text-6xl text-purple-100 -z-10 opacity-70">
        ✨
      </div>
      <div className="absolute bottom-[20%] left-[10%] text-6xl text-blue-100 -z-10 opacity-70">
        ⚡
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-semibold transition-colors relative z-10"
      >
        <BsArrowLeft /> Back
      </button>

      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative z-10">
        <div className="text-center mb-10">
          <div
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 border transition-all duration-300 ${getCategoryBadgeClass(formData.category)}`}
          >
            ✦ {formData.category}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-linear-to-br from-slate-900 via-indigo-700 to-violet-600 bg-clip-text text-transparent mb-3 whitespace-nowrap">
            Create New Event
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 ml-1 text-slate-700">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., CyberPunk Night 2077"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Category / Tags Selector */}
          <div>
            <label className="block text-sm font-bold mb-4 ml-1 text-slate-700">
              Category (Event Tag) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                    formData.category === cat.id
                      ? `border-indigo-600 bg-indigo-50 text-indigo-600`
                      : `border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200`
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2 ml-1 text-slate-700">
              Description *
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

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 ml-1 text-slate-700">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 ml-1 text-slate-700">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold mb-2 ml-1 text-slate-700">
              Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Secret Bunker"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-base hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
