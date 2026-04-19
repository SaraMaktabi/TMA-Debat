import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Eye, EyeOff, ArrowRight, Check, Zap, Shield, Lock } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      // Here you would typically handle the signup logic
      console.log("Signup attempt with:", formData);
    }, 1500);
  };

  const passwordStrength = formData.password.length >= 8 ? "strong" : formData.password.length >= 5 ? "medium" : "weak";
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Left Panel - Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ backgroundImage: 'linear-gradient(135deg, #020412 0%, #0a1628 50%, #132a52 100%)' }}>
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mb-6 hover:bg-white/20 transition-all duration-300 mx-auto">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Commencez Dès Maintenant</h2>
            <p className="text-blue-100 text-base mb-8">
              Optimisez votre gestion de tickets avec l'IA.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-center">
                <Zap className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-blue-100 text-sm">Configuration Rapide</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Shield className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-blue-100 text-sm">Sécurité Maximale</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Lock className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-blue-100 text-sm">Essai Gratuit 30j</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-center text-blue-100 text-xs">
          TMA System - Solution Intelligente
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col h-screen overflow-y-auto">
        {/* Navigation */}
        <nav className="border-b border-gray-200 bg-white/50 backdrop-blur-sm z-50 lg:border-b-0">
          <div className="max-w-full px-6 py-4 flex items-center justify-between">
            <Link 
              to="/" 
              className="lg:hidden flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Bot className="w-8 h-8 text-blue-900" />
              <span className="font-semibold text-xl text-gray-900">TMA</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un Compte</h1>
              <p className="text-gray-600">Rejoignez TMA System gratuitement</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Nom Complet
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900 text-sm"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Adresse E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@exemple.com"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900 text-sm"
                  required
                />
              </div>

              {/* Company Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Entreprise <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Votre Entreprise"
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900 text-sm"
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900 text-sm"
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
                {/* Password Strength Indicator */}
                <div className="mt-3 flex gap-1">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        index < (passwordStrength === "strong" ? 3 : passwordStrength === "medium" ? 2 : 1)
                          ? passwordStrength === "strong"
                            ? "bg-green-500"
                            : passwordStrength === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  {passwordStrength === "strong" && "✓ Mot de passe fort"}
                  {passwordStrength === "medium" && "◐ Mot de passe moyen"}
                  {passwordStrength === "weak" && "✗ Min 8 caractères requis"}
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-900 mb-2 text-left">
                  Confirmer le Mot de Passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white/50 backdrop-blur text-gray-900 placeholder:text-gray-500 group-focus-within:border-blue-900 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                    <Check className="w-4 h-4" />
                    {passwordsMatch ? "Les mots de passe correspondent ✓" : "Les mots de passe ne correspondent pas"}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-900 focus:ring-2 focus:ring-blue-900 accent-blue-900 cursor-pointer mt-1"
                    required
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                    J'accepte les{" "}
                    <a href="#" className="text-blue-900 hover:underline font-semibold">
                      conditions d'utilisation
                    </a>{" "}
                    et la{" "}
                    <a href="#" className="text-blue-900 hover:underline font-semibold">
                      politique de confidentialité
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.agreedToTerms || !passwordsMatch}
                className="w-full px-5 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl font-bold hover:from-blue-950 hover:to-blue-900 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-blue-900/30 mt-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer un Compte
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">OU</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-700">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-blue-900 font-bold hover:text-blue-950 transition-colors"
              >
                Se Connecter
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
