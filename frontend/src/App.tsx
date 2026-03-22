import { type ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { LoginPage } from "./pages/Auth/LoginPage";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import { Toaster } from "react-hot-toast";
import { EventsPage } from "./pages/Events/EventsPage";
import { EventDetailsPage } from "./pages/Events/EventDetailsPage";
import { CreateEventPage } from "./pages/Events/CreateEventPage";
import { MyEventsPage } from "./pages/Events/MyEventsPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { AppHeader } from "./components/layout/AppHeader";
import { AppFooter } from "./components/layout/AppFooter";
import AssistantPage from "./pages/Assistant/AssistantPage";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  return token ? (
    <>{children}</>
  ) : (
    <Navigate to="/register" replace state={{ from: location.pathname }} />
  );
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

const AppChrome = () => {
  const location = useLocation();
  const hideHeader =
    location.pathname === "/register" || location.pathname === "/login";

  return <>{!hideHeader && <AppHeader />}</>;
};

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Router>
        <div className="min-h-screen flex flex-col">
          <AppChrome />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<EventsPage />} />

              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route
                path="/assistant"
                element={
                  <PrivateRoute>
                    <AssistantPage />
                  </PrivateRoute>
                }
              />

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

              <Route
                path="/create-event"
                element={
                  <PrivateRoute>
                    <CreateEventPage />
                  </PrivateRoute>
                }
              />

              <Route path="/my-events" element={<MyEventsPage />} />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </main>
          <AppFooter />
        </div>
      </Router>
    </>
  );
}

export default App;
