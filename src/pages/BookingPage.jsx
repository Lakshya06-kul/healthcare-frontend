import { useEffect, useMemo, useState } from "react";
import {
  connectSocket,
  offSlotBooked,
  offSlotUpdated,
  onSlotBooked,
  onSlotUpdated
} from "../socket/socket";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const doctors = [
  { id: "doc001", name: "Dr. Hamza", fee: 1200 },
  { id: "doc002", name: "Dr. Areeba", fee: 1500 }
];

const initialAvailability = {
  doc001: {
    "2026-04-20": ["10:00", "11:00", "12:00"],
    "2026-04-21": ["09:00", "10:30"]
  },
  doc002: {
    "2026-04-20": ["13:00", "14:00"],
    "2026-04-21": ["15:00", "16:00"]
  }
};

export default function BookingPage() {
  const [form, setForm] = useState({ doctorId: doctors[0].id, date: "", time: "" });
  const [availability, setAvailability] = useState(initialAvailability);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === form.doctorId),
    [form.doctorId]
  );

  const availableSlots = useMemo(() => {
    if (!form.date) return [];
    return availability[form.doctorId]?.[form.date] || [];
  }, [availability, form.date, form.doctorId]);

  useEffect(() => {
    connectSocket();

    const handleSlotUpdated = (payload) => {
      if (!payload?.doctorId || !payload?.date || !Array.isArray(payload.availableSlots)) {
        return;
      }

      setAvailability((prev) => ({
        ...prev,
        [payload.doctorId]: {
          ...(prev[payload.doctorId] || {}),
          [payload.date]: payload.availableSlots
        }
      }));

      if (payload.doctorId === form.doctorId && payload.date === form.date) {
        setStatusMessage(`Live update: slots refreshed for ${payload.date}`);
        setErrorMessage("");
      }
    };

    const handleSlotBooked = (payload) => {
      if (!payload?.doctorId || !payload?.date || !payload?.time) {
        return;
      }

      setAvailability((prev) => {
        const existingSlots = prev[payload.doctorId]?.[payload.date] || [];
        if (existingSlots.length === 0) return prev;

        return {
          ...prev,
          [payload.doctorId]: {
            ...(prev[payload.doctorId] || {}),
            [payload.date]: existingSlots.filter((slot) => slot !== payload.time)
          }
        };
      });

      if (payload.doctorId === form.doctorId && payload.date === form.date) {
        setStatusMessage(`Slot ${payload.time} was booked by another user.`);
        if (form.time === payload.time) {
          setForm((prev) => ({ ...prev, time: "" }));
        }
      }
    };

    onSlotUpdated(handleSlotUpdated);
    onSlotBooked(handleSlotBooked);

    return () => {
      offSlotUpdated(handleSlotUpdated);
      offSlotBooked(handleSlotBooked);
    };
  }, [form.date, form.doctorId, form.time]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage("");
    setStatusMessage("");

    if (name === "doctorId") {
      setForm((prev) => ({ ...prev, doctorId: value, time: "" }));
      return;
    }

    if (name === "date") {
      setForm((prev) => ({ ...prev, date: value, time: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!form.time) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Login required. No token found in localStorage.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: form.doctorId,
          date: form.date,
          time: form.time
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.msg || "Booking failed");
        return;
      }

      setAvailability((prev) => {
        const existingSlots = prev[form.doctorId]?.[form.date] || [];
        return {
          ...prev,
          [form.doctorId]: {
            ...(prev[form.doctorId] || {}),
            [form.date]: existingSlots.filter((slot) => slot !== form.time)
          }
        };
      });

      setStatusMessage("Appointment booked successfully.");
      setForm((prev) => ({ ...prev, time: "" }));
    } catch (error) {
      setErrorMessage("Network error while booking appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">📅 Book an Appointment</h1>
        <p className="text-purple-100">Schedule your consultation with our expert doctors</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow">
          {/* Doctor Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">🏥 Select a Doctor</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name: "doctorId", value: doctor.id } });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    form.doctorId === doctor.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                >
                  <div className="text-3xl mb-2">👨‍⚕️</div>
                  <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                  <p className="text-purple-600 font-semibold">Rs. {doctor.fee}/consultation</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600">4.8 (1240 patients)</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">📆 Select Date</h2>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              required
            />
            {form.date && (
              <p className="text-sm text-gray-600 mt-2">
                📅 Selected: <span className="font-semibold">{new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">⏰ Select Time</h2>
            {!form.date && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700">👆 Select a date first to view available time slots</p>
              </div>
            )}

            {form.date && availableSlots.length === 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">❌ No slots available for this date. Try another date.</p>
              </div>
            )}

            {availableSlots.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      form.time === slot
                        ? "bg-purple-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fee Summary */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Consultation Fee:</span>
              <span className="text-2xl font-bold text-purple-600">Rs. {selectedDoctor?.fee}</span>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        {form.date && form.time && (
          <div className="bg-white rounded-2xl p-8 shadow border-l-4 border-purple-600">
            <h2 className="text-xl font-bold mb-4">✅ Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-semibold">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{new Date(form.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-purple-600 text-lg">{form.time}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {statusMessage && (
          <div className="p-4 bg-green-50 border border-green-300 rounded-lg flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span className="text-green-700 font-medium">{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span className="text-red-700 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !form.date || !form.time}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all ${
            isSubmitting || !form.date || !form.time
              ? "bg-gray-400 cursor-not-allowed opacity-60"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl hover:scale-105"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Booking your appointment...
            </div>
          ) : (
            "💳 Confirm Booking"
          )}
        </button>
      </form>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Need Help?</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• Select your preferred doctor based on specialization and experience</li>
          <li>• Available slots are updated in real-time</li>
          <li>• You'll receive a confirmation email once the appointment is booked</li>
          <li>• Cancel or reschedule up to 24 hours before your appointment</li>
        </ul>
      </div>
    </section>
  );
}
