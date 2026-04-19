import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    doctorInfo: {
      licenseNumber: "",
      specialization: "",
      experience: "",
      hospital: "",
      graduationYear: "",
      documents: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("doctorInfo.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        doctorInfo: {
          ...prev.doctorInfo,
          [field]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a server and get a URL back
      // For demo purposes, we'll simulate document upload
      const mockUrl = `uploaded_${type}_${Date.now()}.${file.name.split('.').pop()}`;
      
      setForm((prev) => ({
        ...prev,
        doctorInfo: {
          ...prev.doctorInfo,
          documents: [
            ...prev.doctorInfo.documents.filter(doc => doc.type !== type),
            {
              type,
              filename: file.name,
              url: mockUrl,
              verified: false
            }
          ]
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log('Form data:', form);

    try {
      setLoading(true);

      const requestData = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        role: form.role
      };

      if (form.role === "doctor") {
        requestData.doctorInfo = {
          ...form.doctorInfo,
          experience: parseInt(form.doctorInfo.experience),
          graduationYear: parseInt(form.doctorInfo.graduationYear)
        };
      }

      console.log('Sending request to:', `${API_URL}/auth/register`);
      console.log('Request data:', requestData);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        setError(data.msg || "Registration failed");
        return;
      }

      setSuccess("Registration successful. Redirecting to login...");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "patient",
        doctorInfo: {
          licenseNumber: "",
          specialization: "",
          experience: "",
          hospital: "",
          graduationYear: "",
          documents: []
        }
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join our healthcare platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            {form.role === "doctor" && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Verification Information</h3>
                <p className="text-sm text-gray-600 mb-6">
                  To verify your medical credentials, please provide the following information and upload required documents.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Medical License Number *
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="doctorInfo.licenseNumber"
                      value={form.doctorInfo.licenseNumber}
                      onChange={handleChange}
                      placeholder="e.g., MD123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required={form.role === "doctor"}
                    />
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <select
                      id="specialization"
                      name="doctorInfo.specialization"
                      value={form.doctorInfo.specialization}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required={form.role === "doctor"}
                    >
                      <option value="">Select specialization</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="neurology">Neurology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="psychiatry">Psychiatry</option>
                      <option value="radiology">Radiology</option>
                      <option value="surgery">Surgery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      id="experience"
                      name="doctorInfo.experience"
                      value={form.doctorInfo.experience}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required={form.role === "doctor"}
                    />
                  </div>

                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      id="graduationYear"
                      name="doctorInfo.graduationYear"
                      value={form.doctorInfo.graduationYear}
                      onChange={handleChange}
                      placeholder="e.g., 2015"
                      min="1950"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required={form.role === "doctor"}
                    />
                  </div>

                  <div>
                    <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Hospital/Clinic *
                    </label>
                    <input
                      type="text"
                      id="hospital"
                      name="doctorInfo.hospital"
                      value={form.doctorInfo.hospital}
                      onChange={handleChange}
                      placeholder="Hospital name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required={form.role === "doctor"}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Required Documents *</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Please upload the following documents to verify your medical credentials. All documents are required for verification.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'license')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required={form.role === "doctor"}
                      />
                      {form.doctorInfo.documents.find(doc => doc.type === 'license') && (
                        <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Degree
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'degree')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required={form.role === "doctor"}
                      />
                      {form.doctorInfo.documents.find(doc => doc.type === 'degree') && (
                        <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Certificate
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'certificate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required={form.role === "doctor"}
                      />
                      {form.doctorInfo.documents.find(doc => doc.type === 'certificate') && (
                        <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
