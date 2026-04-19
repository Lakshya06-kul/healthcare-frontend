import { useNavigate } from "react-router-dom";

export default function PatientLoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 py-12">
      <div className="w-full max-w-5xl px-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 md:p-16">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-bold">Patient login</p>
                <h2 className="text-4xl font-bold text-gray-900 mt-4">Prepare your care journey</h2>
                <p className="mt-4 text-gray-600">Access bookings, chat with doctors, and manage your health data from a single dashboard.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-green-50">
                  <p className="text-sm font-semibold text-gray-900">Patient benefits</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    <li>• Book appointments with verified doctors</li>
                    <li>• Track upcoming consultations</li>
                    <li>• Chat and join video calls directly</li>
                    <li>• Manage your personal and medical profile</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">Quick access</p>
                  <p className="mt-3 text-sm text-gray-600">Your patient dashboard includes appointment history, medical notes, and privacy controls.</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/login/patient/form")}
                className="mt-10 w-full rounded-2xl bg-green-600 py-4 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                Proceed to Patient Login
              </button>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  Need a doctor account?{' '}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Return to login selection
                  </button>
                </p>
              </div>
            </div>

            <div className="bg-green-600 text-white p-10 md:p-16">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Patient Portal</h1>
                <p className="text-green-100 text-lg leading-relaxed">
                  Discover fast, secure healthcare access. Schedule appointments, message your doctor, and keep your health records organized.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <h2 className="font-semibold text-xl">Appointments</h2>
                  <p className="text-green-100 mt-2 text-sm">Easily book and manage appointments with top specialists.</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <h2 className="font-semibold text-xl">Health Records</h2>
                  <p className="text-green-100 mt-2 text-sm">Keep your medical details and allergies private and accessible.</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <h2 className="font-semibold text-xl">Secure Chat</h2>
                  <p className="text-green-100 mt-2 text-sm">Connect with doctors safely through in-app messaging and video calls.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
