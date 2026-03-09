import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import toast from "react-hot-toast";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
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

    // Валідація дати: не в минулому
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    if (selectedDate < new Date()) {
      toast.error("You cannot create events in the past");
      setLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const response = await fetch("http://localhost:3000/auth/events", {
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
        toast.error("Failed to create event");
      }
    } catch {
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
          <h1 className="text-3xl font-black mb-2">Create New Event</h1>
          <p className="text-slate-500 font-medium">
            Fill in the details to create an amazing event
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
              placeholder="e.g., Convention Center, San Francisco"
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
          <div className="grid grid-cols-2 gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-4 bg-slate-50 text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="p-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
