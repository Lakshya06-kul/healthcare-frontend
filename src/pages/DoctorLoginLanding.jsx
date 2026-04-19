import { useNavigate } from "react-router-dom";

export default function DoctorLoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="w-full max-w-5xl px-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-blue-600 text-white p-10 md:p-16">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Doctor Dashboard</h1>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Welcome to the secure doctor portal. Manage your practice, verify patient consultations, and stay connected with your patients in one place.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-blue-500/20 p-5">
                  <h2 className="font-semibold text-xl">Practice Management</h2>
                  <p className="text-blue-100 mt-2 text-sm">View upcoming appointments, confirm patient consultations, and organize your weekly schedule.</p>
                </div>

                <div className="rounded-2xl bg-blue-500/20 p-5">
                  <h2 className="font-semibold text-xl">Patient Communication</h2>
                  <p className="text-blue-100 mt-2 text-sm">Chat securely with your patients and run video consultations with one click.</p>
                </div>

                <div className="rounded-2xl bg-blue-500/20 p-5">
                  <h2 className="font-semibold text-xl">Verified Access</h2>
                  <p className="text-blue-100 mt-2 text-sm">Only verified doctors can sign in. Keep your profile and documents up to date for approval.</p>
                </div>
              </div>
            </div>

            <div className="p-10 md:p-16">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-bold">Doctor login</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-4">Sign in with your doctor account</h2>
                <p className="mt-4 text-gray-600">Enter your verified email and password to access appointments, patient records, and practice tools.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">What you can do:</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    <li>• Manage daily appointments and patient queue</li>
                    <li>• Set availability and consultation windows</li>
                    <li>• View verification status and account details</li>
                    <li>• Launch chat and video calls safely</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-slate-50">
                  <p className="text-sm font-semibold text-gray-900">Important:</p>
                  <p className="mt-3 text-sm text-gray-600">Your doctor account must be verified before dashboard access is permitted.</p>
                </div>
              </div>

              <button
                onClick={() => navigate("/login/doctor/form")}
                className="mt-10 w-full rounded-2xl bg-blue-600 py-4 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Proceed to Doctor Login
              </button>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  Not a doctor?{' '}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Return to login selection
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
