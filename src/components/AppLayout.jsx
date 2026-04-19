import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const publicLinks = [
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" }
];

const protectedLinks = [
  { to: "/doctor", label: "Doctor Dashboard", roles: ["doctor"] },
  { to: "/patient", label: "Patient Dashboard", roles: ["patient"] },
  { to: "/booking", label: "Booking", roles: ["patient"] },
  { to: "/chat", label: "Chat" },
  { to: "/video", label: "Video Call" },
  { to: "/profile", label: "Profile" }
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isPublicRoute = ["/login", "/register", "/login/doctor", "/login/patient"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
          </div>

          <div className="flex items-center gap-3">
            {isPublicRoute ? (
              publicLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })
            ) : (
              <>
                {protectedLinks
                  .filter(link => !link.roles || (user && link.roles.includes(user.role)))
                  .map((link) => {
                    const active = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          active
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                <button
                  onClick={handleLogout}
                  className="rounded-full px-4 py-2 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-sm transition-all"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
