import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Auth/LoginPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import { Toaster } from "react-hot-toast";
import { EventsPage } from "./pages/Events/EventsPage";
// import { MainLayout } from './layouts/MainLayout'; // Розкоментуємо пізніше

function App() {
  const googleClientId =
    "976945532072-rllahg5pldtrm2f0gcpr72n0avh61qtj.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* 1. Toaster має бути ТУТ (зовні Routes) */}
      <Toaster position="top-center" reverseOrder={false} />

      <Router>
        <Routes>
          {/* 1. Головна сторінка зі списком подій (Discovery Events) */}
          <Route path="/events" element={<EventsPage />} />
          {/* 2. Всередині Routes — ТІЛЬКИ Route */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RegisterPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
