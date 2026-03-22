import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../api/baseUrl";

const COPILOT_ACTIONS = [
  {
    title: "План на тиждень",
    subtitle: "3-5 подій під твій темп",
    prompt:
      "Склади мені план на цей тиждень: обери 3-5 найкращих подій з моїх даних, коротко поясни чому, і розподіли за днями.",
  },
  {
    title: "Події за інтересами",
    subtitle: "Те, що підходить саме мені",
    prompt:
      "Проаналізуй мої події і запропонуй, на які варто зробити фокус за інтересами та категоріями.",
  },
  {
    title: "Швидкий нетворкінг",
    subtitle: "Де більше знайомств",
    prompt:
      "Покажи події, де найкраще підійде нетворкінг цього місяця, і дай короткий план дій перед кожною.",
  },
  {
    title: "Тижневий дайджест",
    subtitle: "Що не пропустити",
    prompt:
      "Зроби мені тижневий дайджест найважливіших подій у форматі короткого списку пріоритетів.",
  },
];

const AssistantPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?.id;

  const ask = async (prompt: string) => {
    if (!prompt.trim()) return;
    if (!userId) {
      toast.error("Будь ласка, увійдіть в систему");
      return;
    }

    setLoading(true);
    setAnswer("");
    setQuestion(prompt);

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/ask`, {
        question: prompt,
        userId: userId,
      });

      // Перевіряємо, чи повернув бекенд об'єкт з полем answer або просто рядок
      const aiResponse = response.data.answer || response.data;
      setAnswer(aiResponse);
    } catch (error) {
      console.error("AI Error:", error);

      let errorMsg = "Не вдалося зв'язатися з асистентом.";

      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      }

      setAnswer(`Ой! ${errorMsg}`);
      toast.error("Помилка запиту");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    await ask(question);
  };

  const handleCopilotAction = async (prompt: string) => {
    await ask(prompt);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-xl w-full bg-white rounded-4xl shadow-sm border border-slate-100 p-8 md:p-10 transition-all">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">
            ✨
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              AI Event Assistant
            </h2>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">
              Твій помічник
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COPILOT_ACTIONS.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => void handleCopilotAction(action.prompt)}
                disabled={loading}
                className="text-left rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:border-indigo-200 hover:bg-indigo-50/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <p className="text-slate-800 font-bold text-sm">
                  {action.title}
                </p>
                <p className="text-slate-400 font-medium text-xs mt-1">
                  {action.subtitle}
                </p>
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Які події в мене заплановані на березень?"
            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none text-slate-600 placeholder-slate-300"
          />

          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Аналізую..." : "Запитати асистента ✦"}
          </button>

          {answer && (
            <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnswer("")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Очистити
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
