import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowRight, Bot, Eye } from "lucide-react";
import thinkgridLogo from "../assets/Thinkgrid.png";
import { isAuthenticated, getSession, logout } from "../utils/auth";
import Swal from "sweetalert2";

export default function SiteNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Déconnecté",
      showConfirmButton: false,
      timer: 1400,
      background: "#fff",
    });
    setTimeout(() => navigate("/login"), 500);
  };

  const user = getSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_4px_20px_rgba(215,205,251,0.3)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={thinkgridLogo} alt="Thinkgrid" className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>

          <Link
            to="/demo"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Demo
          </Link>

          {!isAuthenticated() ? (
            <Link
              to="/login"
              className="px-6 py-2.5 text-sm font-semibold bg-[var(--edu-primary)] text-white rounded-lg hover:brightness-95 transition-all duration-200 hover:scale-105"
            >
              Se connecter
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
