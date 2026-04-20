import { useEffect, useMemo, useState } from "react";
import {
  connectSocket,
  offSlotBooked,
  offSlotUpdated,
  onSlotBooked,
  onSlotUpdated
} from "../socket/socket";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function BookingPage() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [form, setForm] = useState({ doctorId: "", date: "", time: "" });
  const [availability, setAvailability] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctors from backend with retry logic
  useEffect(() => {
    const fetchDoctors = async (attempt = 1) => {
      try {
        setLoadingDoctors(true);
        setDoctorError("");

        console.log(`[BookingPage] Fetching doctors from ${API_URL}/doctor (attempt ${attempt})`);
        const response = await fetch(`${API_URL}/doctor`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch doctors`);
        }

        const data = await response.json();
        console.log("[BookingPage] Doctors fetched successfully:", data.length);
        setDoctors(data);
        setDoctorError("");

        // Build availability map from fetched doctors
        const availMap = {};
        data.forEach(doc => {
          availMap[doc._id] = {};
          if (doc.availability && Array.isArray(doc.availability)) {
            doc.availability.forEach(slot => {
              availMap[doc._id][slot.date] = slot.slots;
            });
          }
        });
        setAvailability(availMap);

        // Set first doctor as default if available
        if (data.length > 0 && !form.doctorId) {
          setForm(prev => ({ ...prev, doctorId: data[0]._id }));
        }
      } catch (error) {
        console.error("[BookingPage] Error fetching doctors:", error);

        // Retry logic: retry up to 3 times with exponential backoff
        if (attempt < 3) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[BookingPage] Retrying in ${delayMs}ms...`);
          setDoctorError(`Retrying... (attempt ${attempt + 1}/3)`);
          setTimeout(() => fetchDoctors(attempt + 1), delayMs);
        } else {
          const errorMsg = error?.message || "Failed to load doctors";
          setDoctorError(`${errorMsg}. Please check your internet connection and refresh.`);
          console.error("[BookingPage] All retry attempts failed");
        }
      } finally {
        if (attempt === 1) {
          setLoadingDoctors(false);
        }
      }
    };

    fetchDoctors();
  }, []);

  // Socket listeners
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

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === form.doctorId),
    [doctors, form.doctorId]
  );

  const availableSlots = useMemo(() => {
    if (!form.date) return [];
    return availability[form.doctorId]?.[form.date] || [];
  }, [availability, form.date, form.doctorId]);

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
      const bookingUrl = `${API_URL}/appointments/book`;
      console.log("[BookingPage] Submitting booking to:", bookingUrl);

      const response = await fetch(bookingUrl, {
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
        console.error("[BookingPage] Booking failed:", data);
        const errorMsg = data.msg || `Server error (${response.status})`;
        setErrorMessage(errorMsg);
        return;
      }

      console.log("[BookingPage] Booking successful:", data);

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

      setStatusMessage("✅ Appointment booked successfully!");
      setForm((prev) => ({ ...prev, time: "" }));
    } catch (error) {
      console.error("[BookingPage] Network/fetch error:", error);

      // Provide specific error messages based on error type
      if (error instanceof TypeError) {
        setErrorMessage("Network connection failed. Please check your internet connection and verify VITE_API_URL is set correctly.");
      } else if (error instanceof SyntaxError) {
        setErrorMessage("Invalid response from server. The backend may be down. Please try again later.");
      } else {
        setErrorMessage(`Error: ${error?.message || "Failed to book appointment"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDoctors) {
    return (
      <section className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">📅 Book an Appointment</h1>
          <p className="text-purple-100">Schedule your consultation with our expert doctors</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
          {doctorError && <p className="mt-2 text-red-600 text-sm">{doctorError}</p>}
        </div>
      </section>
    );
  }

  if (doctors.length === 0) {
    return (
      <section className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">📅 Book an Appointment</h1>
          <p className="text-purple-100">Schedule your consultation with our expert doctors</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow">
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-700 font-semibold">❌ {doctorError || "No doctors available at the moment."}</p>
            <p className="text-red-600 text-sm mt-2">Please refresh the page or contact support if the problem persists.</p>
          </div>
        </div>
      </section>
    );
  }

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
                  key={doctor._id}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name: "doctorId", value: doctor._id } });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${form.doctorId === doctor._id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-purple-300"
                    }`}
                >
                  <div className="text-3xl mb-2">👨‍⚕️</div>
                  <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{doctor.specialization}</p>
                  <p className="text-purple-600 font-semibold">Rs. {doctor.price}/consultation</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600">4.8 (1240 patients)</span>
                  </div>
                  {doctor.isOnline && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-green-600 font-medium">Online</span>
                    </div>
                  )}
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
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${form.time === slot
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
          {selectedDoctor && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Consultation Fee:</span>
                <span className="text-2xl font-bold text-purple-600">Rs. {selectedDoctor.price}</span>
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        {form.date && form.time && selectedDoctor && (
          <div className="bg-white rounded-2xl p-8 shadow border-l-4 border-purple-600">
            <h2 className="text-xl font-bold mb-4">✅ Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-semibold">{selectedDoctor.name}</span>
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
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all ${isSubmitting || !form.date || !form.time
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
import { useEffect, useMemo, useState } from "react";
import {
  connectSocket,
  offSlotBooked,
  offSlotUpdated,
  onSlotBooked,
  onSlotUpdated
} from "../socket/socket";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function BookingPage() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [form, setForm] = useState({ doctorId: "", date: "", time: "" });
  const [availability, setAvailability] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async (attempt = 1) => {
      try {
        setLoadingDoctors(true);
        setDoctorError("");

        console.log(`[BookingPage] Fetching doctors from ${API_URL}/doctor (attempt ${attempt})`);
        const response = await fetch(`${API_URL}/doctor`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch doctors`);
        }

        const data = await response.json();
        console.log("[BookingPage] Doctors fetched successfully:", data.length);
        setDoctors(data);
        setDoctorError("");

        // Build availability map from fetched doctors
        const availMap = {};
        data.forEach(doc => {
          availMap[doc._id] = {};
          if (doc.availability && Array.isArray(doc.availability)) {
            doc.availability.forEach(slot => {
              availMap[doc._id][slot.date] = slot.slots;
            });
          }
        });
        setAvailability(availMap);

        // Set first doctor as default if available
        if (data.length > 0 && !form.doctorId) {
          setForm(prev => ({ ...prev, doctorId: data[0]._id }));
        }
      } catch (error) {
        console.error("[BookingPage] Error fetching doctors:", error);

        // Retry logic: retry up to 3 times with exponential backoff
        if (attempt < 3) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[BookingPage] Retrying in ${delayMs}ms...`);
          setDoctorError(`Retrying... (attempt ${attempt + 1}/3)`);
          setTimeout(() => fetchDoctors(attempt + 1), delayMs);
        } else {
          const errorMsg = error?.message || "Failed to load doctors";
          setDoctorError(`${errorMsg}. Please check your internet connection and refresh.`);
          console.error("[BookingPage] All retry attempts failed");
        }
      } finally {
        if (attempt === 1) {
          setLoadingDoctors(false);
        }
      }
    };

    fetchDoctors();
  }, []);

  // Socket listeners
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

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === form.doctorId),
    [doctors, form.doctorId]
  );

  const availableSlots = useMemo(() => {
    if (!form.date) return [];
    return availability[form.doctorId]?.[form.date] || [];
  }, [availability, form.date, form.doctorId]);

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

  if (loadingDoctors) {
    return (
      <section className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">📅 Book an Appointment</h1>
          <p className="text-purple-100">Schedule your consultation with our expert doctors</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </section>
    );
  }

  if (doctors.length === 0) {
    return (
      <section className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 p-8 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">📅 Book an Appointment</h1>
          <p className="text-purple-100">Schedule your consultation with our expert doctors</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow">
          <p className="text-gray-600 text-center">No doctors available at the moment.</p>
        </div>
      </section>
    );
  }

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
                  key={doctor._id}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name: "doctorId", value: doctor._id } });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${form.doctorId === doctor._id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-purple-300"
                    }`}
                >
                  <div className="text-3xl mb-2">👨‍⚕️</div>
                  <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{doctor.specialization}</p>
                  <p className="text-purple-600 font-semibold">Rs. {doctor.price}/consultation</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600">4.8 (1240 patients)</span>
                  </div>
                  {doctor.isOnline && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-green-600 font-medium">Online</span>
                    </div>
                  )}
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
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${form.time === slot
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
          {selectedDoctor && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Consultation Fee:</span>
                <span className="text-2xl font-bold text-purple-600">Rs. {selectedDoctor.price}</span>
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        {form.date && form.time && selectedDoctor && (
          <div className="bg-white rounded-2xl p-8 shadow border-l-4 border-purple-600">
            <h2 className="text-xl font-bold mb-4">✅ Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-semibold">{selectedDoctor.name}</span>
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
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all ${isSubmitting || !form.date || !form.time
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
                className={`p-4 rounded-xl border-2 transition-all text-left ${form.doctorId === doctor.id
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
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${form.time === slot
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
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all ${isSubmitting || !form.date || !form.time
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
