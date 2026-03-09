import { type ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/Auth/LoginPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import { Toaster } from "react-hot-toast";
import { EventsPage } from "./pages/Events/EventsPage";
import { EventDetailsPage } from "./pages/Events/EventDetailsPage";
import { CreateEventPage } from "./pages/Events/CreateEventPage";
import { MyEventsPage } from "./pages/Events/MyEventsPage"; 

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  // Якщо токена немає — редірект на реєстрацію (згідно з твоїм вибором)
  return token ? <>{children}</> : <Navigate to="/register" replace />;
};

/**
 * 🔓 PublicRoute - запобігає доступу залогінених користувачів до сторінок входу/реєстрації.
 */
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/events" replace /> : <>{children}</>;
};

function App() {
  const googleClientId =
    "976945532072-rllahg5pldtrm2f0gcpr72n0avh61qtj.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Контейнер для сповіщень (toast) */}
      <Toaster position="top-center" reverseOrder={false} />

      <Router>
        <Routes>
          {/* Автоматичний перехід на головну при відкритті сайту */}
          <Route path="/" element={<Navigate to="/events" replace />} />

          {/* Публічні маршрути: перегляд подій доступний усім */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />

          {/* Сторінки авторизації: закриті для тих, хто вже увійшов */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Приватні маршрути: створення подій та календар */}
          <Route
            path="/create-event"
            element={
              <PrivateRoute>
                <CreateEventPage />
              </PrivateRoute>
            }
          />

          {/* ПІДКЛЮЧЕНО: Календар тепер доступний тільки залогіненим */}
          <Route
            path="/my-events"
            element={
              <PrivateRoute>
                <MyEventsPage />
              </PrivateRoute>
            }
          />

          {/* Обробка неіснуючих шляхів: повернення на головну */}
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
