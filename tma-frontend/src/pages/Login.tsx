import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { userAPI } from "../api/client";
import { clearSession, isAdminRole, isTechnicianRole, saveSession } from "../utils/auth";
import thinkgridLogo from "../assets/Thinkgrid.png";

interface ApiErrorLike {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const expectedRole = searchParams.get("role");
  const requestedNext = searchParams.get("next");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const response = await userAPI.login(email, password);

      saveSession({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
      });

      const isAdminUser = isAdminRole(response.user.role);
      const isTechnicianUser = isTechnicianRole(response.user.role);

      if (expectedRole === "admin" && !isAdminUser) {
        clearSession();
        setLoginError("Ce compte n'a pas les droits administrateur.");
        setIsLoading(false);
        return;
      }

      if (expectedRole === "client" && (isAdminUser || isTechnicianUser)) {
        clearSession();
        setLoginError("Connectez-vous avec un compte client pour cet acces.");
        setIsLoading(false);
        return;
      }

      if (requestedNext && requestedNext.startsWith("/")) {
        navigate(requestedNext, { replace: true });
        return;
      }

      if (isAdminUser) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (isTechnicianUser) {
        navigate("/tech/dashboard", { replace: true });
        return;
      }

      navigate("/tickets", { replace: true });
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      const detail =
        typeof apiError.response?.data?.detail === "string" ? apiError.response.data.detail : null;
      setLoginError(detail ?? "Connexion echouee. Verifiez vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Left Panel - Fixed */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:w-1/2 lg:h-screen relative overflow-hidden items-center justify-center" style={{ backgroundColor: '#020331' }}>
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white max-w-md px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Bienvenue</h2>
              <p className="text-white/80 text-lg mb-12">
                Gérez vos tickets avec l'IA. 70% plus rapide.
              </p>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <Zap className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white/80 text-sm">Résolution Instantanée</span>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <Shield className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white/80 text-sm">Sécurité Enterprise</span>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <Lock className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white/80 text-sm">Conformité Globale</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-center text-white/60 text-xs">
          Thinkgrid - Gestion de tickets intelligente
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 lg:ml-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col h-screen overflow-y-auto">
        {/* Navigation */}
        <nav className="border-b border-gray-200 bg-white/50 backdrop-blur-sm z-50 lg:border-b-0">
          <div className="max-w-full px-6 py-4 flex items-center justify-between">
            <Link 
              to="/" 
              className="lg:hidden flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={thinkgridLogo} alt="Thinkgrid" className="h-8 w-auto" />
            </Link>
            <Link
              to="/"
              className="hidden lg:block ml-auto px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
            >
              ← Retour
            </Link>
          </div>
        </nav>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Se Connecter</h1>
              <p className="text-gray-600">Accédez à votre tableau de bord</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Adresse E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Mot de Passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-900 focus:ring-2 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Se souvenir</span>
                </label>
                <Link
                  to="#"
                  className="text-sm text-blue-900 hover:text-blue-950 font-semibold transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-5 py-3 bg-[#020331] text-white rounded-xl font-bold hover:bg-[#0a0844] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se Connecter
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            {/* <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">OU</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div> */}

            {/* Sign Up Link */}
            {/* <p className="text-center text-gray-700">
              Vous n'avez pas encore de compte ?{" "}
              <Link
                to="/signup"
                className="text-blue-900 font-bold hover:text-blue-950 transition-colors"
              >
                Créer un compte
              </Link>
            </p> */}
          </div>
        </div>

      </div>
    </div>
  );
}
