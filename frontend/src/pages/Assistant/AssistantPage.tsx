import { useState } from "react";
import axios from "axios";

const AssistantPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Отримуємо дані користувача з localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || "8b06d2e4-bcf0-428e-b45b-38706d2e4bcf";

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await axios.post("http://localhost:3000/ai/ask", {
        question: question,
        userId: userId,
      });

      setAnswer(response.data.answer);
    } catch (error) {
      console.error("AI Error:", error);
      setAnswer(
        "Sorry, I didn’t understand that. Please try rephrasing your question.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-linear-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
            ✨
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              AI Event Assistant
            </h2>
            <p className="text-sm text-gray-500">Я знаю все про твої події</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Наприклад: Які події в мене заплановані на березень?"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all resize-none text-gray-700"
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Thinking...
              </span>
            ) : (
              "Запитати асистента"
            )}
          </button>

          {answer && (
            <div className="mt-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-indigo-900 leading-relaxed font-medium italic">
                "{answer}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
