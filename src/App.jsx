import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginLandingPage from "./pages/LoginLandingPage";
import DoctorLoginLanding from "./pages/DoctorLoginLanding";
import PatientLoginLanding from "./pages/PatientLoginLanding";
import DoctorLoginPage from "./pages/DoctorLoginPage";
import PatientLoginPage from "./pages/PatientLoginPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import BookingPage from "./pages/BookingPage";
import ChatPage from "./pages/ChatPage";
import VideoCallPage from "./pages/VideoCallPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginLandingPage />} />
        <Route path="/login/doctor" element={<DoctorLoginLanding />} />
        <Route path="/login/doctor/form" element={<DoctorLoginPage />} />
        <Route path="/login/patient" element={<PatientLoginLanding />} />
        <Route path="/login/patient/form" element={<PatientLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video"
          element={
            <ProtectedRoute>
              <VideoCallPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppLayout>
  );
}
