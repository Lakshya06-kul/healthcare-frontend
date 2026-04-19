import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const doctors = [
  { id: "d1", name: "Dr. Hamza Khan", specialization: "Cardiology", rating: 4.8, patients: 1240, experience: 10, fee: 1200, online: true, image: "👨‍⚕️" },
  { id: "d2", name: "Dr. Areeba Ahmed", specialization: "Dermatology", rating: 4.9, patients: 2100, experience: 8, fee: 1500, online: false, image: "👩‍⚕️" },
  { id: "d3", name: "Dr. Ali Hassan", specialization: "Neurology", rating: 4.7, patients: 890, experience: 12, fee: 1400, online: true, image: "👨‍⚕️" },
  { id: "d4", name: "Dr. Fatima Malik", specialization: "Pediatrics", rating: 4.9, patients: 1560, experience: 9, fee: 1100, online: true, image: "👩‍⚕️" }
];

const upcomingAppointments = [
  { id: "apt1", doctor: "Dr. Hamza Khan", date: "2026-04-20", time: "10:00", status: "confirmed", type: "Consultation" },
  { id: "apt2", doctor: "Dr. Areeba Ahmed", date: "2026-04-22", time: "14:30", status: "pending", type: "Follow-up" }
];

const healthMetrics = [
  { label: "Blood Pressure", value: "120/80", status: "normal" },
  { label: "Heart Rate", value: "72 bpm", status: "normal" },
  { label: "Weight", value: "72 kg", status: "normal" },
  { label: "BMI", value: "24.5", status: "normal" }
];

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const filtered = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(query.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(query.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-blue-100">You're all set for a healthier you. Manage your appointments and health records.</p>
          </div>
          <div className="text-6xl opacity-80">💊</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-lg px-6 py-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "appointments"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "doctors"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Find Doctors
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Health Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            {healthMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Optimal</span>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📅 Upcoming Appointments</h2>
              <button
                onClick={() => setActiveTab("appointments")}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{apt.doctor}</p>
                    <p className="text-sm text-gray-600">{apt.type}</p>
                    <p className="text-sm text-gray-500 mt-1">📅 {apt.date} at {apt.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {apt.status === "confirmed" ? "Confirmed" : "Pending"}
                    </span>
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={() => navigate("/booking")} className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 text-left transition-colors">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-bold text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule a visit with a doctor</p>
            </button>
            <button onClick={() => navigate("/chat")} className="bg-green-50 hover:bg-green-100 rounded-xl p-6 text-left transition-colors">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-bold text-gray-900">Message Doctor</h3>
              <p className="text-sm text-gray-600">Chat with your healthcare provider</p>
            </button>
            <button onClick={() => navigate("/video")} className="bg-purple-50 hover:bg-purple-100 rounded-xl p-6 text-left transition-colors">
              <div className="text-4xl mb-2">🎥</div>
              <h3 className="font-bold text-gray-900">Video Call</h3>
              <p className="text-sm text-gray-600">Start a video consultation</p>
            </button>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold mb-6">Your Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900">{apt.doctor}</p>
                    <p className="text-gray-600 mt-1">{apt.type} Appointment</p>
                    <p className="text-sm text-gray-500 mt-2">📅 {apt.date} | ⏰ {apt.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors" onClick={() => navigate("/video")}>
                      Join Call
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              + Book New Appointment
            </button>
          </div>
        </div>
      )}

      {/* Find Doctors Tab */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctor by name or specialization..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{doctor.image}</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    doctor.online
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {doctor.online ? "🟢 Online" : "🔴 Offline"}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span>⭐ {doctor.rating} ({doctor.patients.toLocaleString()} patients)</span>
                  <span>📅 {doctor.experience} years</span>
                </div>
                <div className="border-t pt-4 mb-4">
                  <p className="text-2xl font-bold text-gray-900">Rs. {doctor.fee}
                    <span className="text-sm text-gray-600 font-normal">/consultation</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors" onClick={() => navigate("/booking")}>
                    Book Now
                  </button>
                  <button className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors" onClick={() => navigate("/chat")}>
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
