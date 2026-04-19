import { useState, useEffect } from "react";

const initialAppointments = [
  { id: "A-101", patient: "Ali Khan", date: "2026-04-18", time: "10:00", status: "completed", type: "Consultation" },
  { id: "A-102", patient: "Sara Noor", date: "2026-04-18", time: "11:00", status: "confirmed", type: "Follow-up" },
  { id: "A-103", patient: "Ahmed Hassan", date: "2026-04-19", time: "14:00", status: "pending", type: "Check-up" }
];

const patientHistory = [
  { id: "P-001", name: "Ali Khan", visits: 5, lastVisit: "2026-04-18", condition: "Hypertension" },
  { id: "P-002", name: "Sara Noor", visits: 3, lastVisit: "2026-04-18", condition: "Diabetes" },
  { id: "P-003", name: "Ahmed Hassan", visits: 8, lastVisit: "2026-04-17", condition: "Heart Disease" }
];

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isOnline, setIsOnline] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [consultationDuration, setConsultationDuration] = useState("30 minutes");
  const [consultationFee, setConsultationFee] = useState("Rs. 1,200");
  const [breakTime, setBreakTime] = useState("1:00 PM - 2:00 PM");
  const [weeklyAvailability, setWeeklyAvailability] = useState([
    { day: "Monday", time: "9:00 AM - 5:00 PM" },
    { day: "Tuesday", time: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", time: "9:00 AM - 5:00 PM" },
    { day: "Thursday", time: "9:00 AM - 5:00 PM" },
    { day: "Friday", time: "9:00 AM - 5:00 PM" },
    { day: "Saturday", time: "9:00 AM - 5:00 PM" }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const savedAvailability = localStorage.getItem("doctorAvailability");
    if (savedAvailability) {
      const parsed = JSON.parse(savedAvailability);
      setConsultationDuration(parsed.consultationDuration || "30 minutes");
      setConsultationFee(parsed.consultationFee || "Rs. 1,200");
      setBreakTime(parsed.breakTime || "1:00 PM - 2:00 PM");
      if (parsed.weeklyAvailability?.length) {
        setWeeklyAvailability(parsed.weeklyAvailability);
      }
    }
  }, []);

  const handleAvailabilitySave = () => {
    localStorage.setItem(
      "doctorAvailability",
      JSON.stringify({ consultationDuration, consultationFee, breakTime, weeklyAvailability })
    );
  };

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

  if (user.role === "doctor" && !user.isVerified) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Account Pending Verification</h2>
          <p className="text-yellow-700 mb-6">
            Your doctor account is currently under review. Our team is verifying your credentials and documents.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Verification Status</h3>
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-yellow-700 font-medium">
                  {user.verificationStatus === "pending" ? "Under Review" : user.verificationStatus}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-yellow-600">
            This process typically takes 24-48 hours. You'll receive an email notification once verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, Dr. {user.name.split(" ")[0]}! 👨‍⚕️</h1>
            <p className="text-blue-100">Manage your appointments, patients, and availability</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Your Status</p>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`mt-2 rounded-full px-6 py-2 font-bold text-white transition-all ${
                  isOnline ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {isOnline ? "🟢 Online" : "🔴 Offline"}
              </button>
            </div>
          </div>
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
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "appointments"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📅 Appointments
        </button>
        <button
          onClick={() => setActiveTab("patients")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "patients"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          👥 My Patients
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "availability"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ⏰ Availability
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Today's Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">2</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">1 confirmed, 1 pending</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{patientHistory.length}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Active & regular</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Earnings (This Month)</p>
                  <p className="text-3xl font-bold text-gray-900">Rs. 45K</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">From 16 consultations</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Rating</p>
                  <p className="text-3xl font-bold text-gray-900">4.8⭐</p>
                </div>
                <div className="text-4xl">✨</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">From 124 reviews</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 text-left transition-colors border border-blue-200">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-bold text-gray-900">Manage Schedule</h3>
              <p className="text-sm text-gray-600">Set your availability hours</p>
            </button>
            <button className="bg-green-50 hover:bg-green-100 rounded-xl p-6 text-left transition-colors border border-green-200">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-bold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600">5 new patient messages</p>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 rounded-xl p-6 text-left transition-colors border border-purple-200">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Patient & earnings reports</p>
            </button>
          </div>

          {/* Upcoming Appointments Preview */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📅 Next Appointments</h2>
              <button onClick={() => setActiveTab("appointments")} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {appointments.slice(0, 2).map((apt) => (
                <div key={apt.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{apt.patient}</p>
                    <p className="text-sm text-gray-600">{apt.type}</p>
                    <p className="text-sm text-gray-500 mt-1">📅 {apt.date} at {apt.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    <button className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="bg-white rounded-2xl p-6 shadow space-y-4">
          <h2 className="text-xl font-bold mb-6">📅 All Appointments</h2>
          
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className={`border-l-4 rounded-lg p-6 ${
                apt.status === "confirmed"
                  ? "border-green-500 bg-green-50"
                  : apt.status === "pending"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-500 bg-gray-50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900">{apt.patient}</p>
                    <p className="text-gray-600 mt-1">{apt.type} • {apt.date} at {apt.time}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "confirmed"
                          ? "bg-green-200 text-green-800"
                          : apt.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200 text-gray-800"
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                      {apt.status !== "completed" && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                          📋 Consultation
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                      Join Call
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === "patients" && (
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold mb-6">👥 My Patients</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Visits</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Visit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Condition</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientHistory.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{patient.name}</td>
                    <td className="py-4 px-4 text-gray-600">{patient.visits} visits</td>
                    <td className="py-4 px-4 text-gray-600">{patient.lastVisit}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {patient.condition}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">📝 Records</button>
                        <button className="text-green-600 hover:text-green-800 font-medium text-sm">💬 Message</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === "availability" && (
        <div className="bg-white rounded-2xl p-6 shadow space-y-6">
          <h2 className="text-xl font-bold mb-6">⏰ My Availability</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Weekly Schedule</h3>
              <div className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{day}</span>
                    <span className="text-sm text-gray-600">9:00 AM - 5:00 PM</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Quick Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900">Consultation Duration</p>
                  <select
                    value={consultationDuration}
                    onChange={(e) => setConsultationDuration(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <p className="font-semibold text-gray-900">Consultation Fee</p>
                  <input
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    type="text"
                    placeholder="Rs. 1,200"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                  <p className="font-semibold text-gray-900">Break Time</p>
                  <input
                    value={breakTime}
                    onChange={(e) => setBreakTime(e.target.value)}
                    type="text"
                    placeholder="1:00 PM - 2:00 PM"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleAvailabilitySave}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  💾 Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
