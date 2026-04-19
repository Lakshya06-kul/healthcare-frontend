import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [privacy, setPrivacy] = useState({
    email: true,
    phone: true,
    address: true,
    medicalHistory: false,
    age: true,
    allergies: false
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "+92-300-0000000",
        address: parsed.address || "123 Health Street, Karachi",
        age: parsed.age || 25,
        bloodType: parsed.bloodType || "O+",
        medicalHistory: parsed.medicalHistory || "No major conditions",
        allergies: parsed.allergies || "None reported"
      });
    }

    const savedPrivacy = localStorage.getItem("privacy");
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("privacy", JSON.stringify(privacy));
  }, [privacy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivacyToggle = (field) => {
    setPrivacy(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify({
      ...user,
      ...formData
    }));
    localStorage.setItem("privacy", JSON.stringify(privacy));
    setUser(prev => ({ ...prev, ...formData }));
    setIsEditing(false);
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

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-5xl border-2 border-white">
              👤
            </div>
            <div>
              <h1 className="text-4xl font-bold">{user.name}</h1>
              <p className="text-blue-100 mt-1">{user.role === "patient" ? "Patient" : "Doctor"} Account</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isEditing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white text-blue-600 hover:bg-gray-100"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-8 shadow">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              👤 Personal Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900 py-3 font-medium">{formData.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900 py-3 font-medium">{formData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900 py-3 font-medium">{formData.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-gray-900 py-3 font-medium">{formData.address}</p>
                )}
              </div>

              {/* Age */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 py-3 font-medium">{formData.age} years</p>
                  )}
                </div>

                {/* Blood Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type</label>
                  {isEditing ? (
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-3 font-medium">{formData.bloodType}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-2xl p-8 shadow">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              🏥 Medical Information
            </h2>

            <div className="space-y-4">
              {/* Medical History */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                {isEditing ? (
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Any previous conditions, surgeries, etc."
                  />
                ) : (
                  <p className="text-gray-900 py-3 font-medium">{formData.medicalHistory}</p>
                )}
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                {isEditing ? (
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="List any known allergies"
                  />
                ) : (
                  <p className="text-gray-900 py-3 font-medium">{formData.allergies}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              💾 Save Changes
            </button>
          )}
        </div>

        {/* Privacy Settings Sidebar */}
        <div className="bg-white rounded-2xl p-8 shadow h-fit">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔒 Privacy Settings
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Choose which information is visible to doctors and other users
          </p>

          <div className="space-y-4">
            {/* Email Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">📧 Email</p>
                <p className="text-xs text-gray-500 mt-1">{privacy.email ? "Visible" : "Hidden"}</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle("email")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacy.email ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacy.email ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Phone Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">📱 Phone</p>
                <p className="text-xs text-gray-500 mt-1">{privacy.phone ? "Visible" : "Hidden"}</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle("phone")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacy.phone ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacy.phone ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Address Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">🏠 Address</p>
                <p className="text-xs text-gray-500 mt-1">{privacy.address ? "Visible" : "Hidden"}</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle("address")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacy.address ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacy.address ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Age Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">🎂 Age</p>
                <p className="text-xs text-gray-500 mt-1">{privacy.age ? "Visible" : "Hidden"}</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle("age")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacy.age ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacy.age ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Medical History Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">🏥 Medical History</p>
                <p className="text-xs text-gray-500 mt-1">{privacy.medicalHistory ? "Visible" : "Hidden"}</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle("medicalHistory")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacy.medicalHistory ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacy.medicalHistory ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Allergies Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-900">⚠️ Allergies</p>
                <p className="text-xs text-gray-500 mt-1">{privacy.allergies ? "Visible" : "Hidden"}</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle("allergies")}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacy.allergies ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacy.allergies ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>💡 Tip:</strong> Toggle to control who can see your information on your public profile. Doctors will always see critical medical information during consultations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
