import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { userAPI } from "../api/client";
import { saveSession } from "../utils/auth";
import thinkgridLogo from "../assets/Thinkgrid.png";

interface ApiErrorLike {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
}

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(password === confirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordMatch) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await userAPI.register({
        email: formData.email,
        password: formData.password,
        nom: formData.lastName,
        prenom: formData.firstName,
      });

      saveSession({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
      });

      navigate("/tickets", { replace: true });
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      const detail =
        typeof apiError.response?.data?.detail === "string"
          ? apiError.response.data.detail
          : null;
      setError(detail ?? "Inscription échouée. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Left Panel - Fixed */}
      <div
        className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:w-1/2 lg:h-screen relative overflow-hidden items-center justify-center"
        style={{ backgroundColor: "#020331" }}
      >
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-10 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white max-w-md px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Créer un compte</h2>
              <p className="text-white/80 text-lg mb-12">
                Rejoignez-nous et commencez à gérer vos tickets avec l'IA.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Rapide</p>
                    <p className="text-white/60 text-sm">Résolvez vos problèmes 70% plus vite</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Sécurisé</p>
                    <p className="text-white/60 text-sm">Vos données sont protégées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Scrollable */}
      <div className="w-full lg:w-1/2 lg:ml-auto overflow-y-auto flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img src={thinkgridLogo} alt="Thinkgrid" className="h-10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-blue-900 transition-colors text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-blue-900 transition-colors text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-blue-900 transition-colors text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-blue-900 transition-colors text-gray-900 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors text-gray-900 placeholder-gray-500 focus:outline-none ${
                    !passwordMatch && formData.confirmPassword
                      ? "border-red-300 focus:border-red-900"
                      : "border-gray-300 focus:border-blue-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordMatch}
              className="w-full px-5 py-3 bg-[#020331] text-white rounded-xl font-bold hover:bg-[#0a0844] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Inscription en cours...
                </>
              ) : (
                <>
                  Créer un compte
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-700 mt-6">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-blue-900 font-bold hover:text-blue-950 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

interface Zap {
  className?: string;
}

const Zap = ({ className }: Zap) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

interface Shield {
  className?: string;
}

const Shield = ({ className }: Shield) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2m4-4l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
