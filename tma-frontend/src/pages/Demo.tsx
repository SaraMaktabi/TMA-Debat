import { Link, useNavigate } from "react-router-dom";
import { Bot, Settings, User, Check, ArrowRight } from "lucide-react";

export default function Demo() {
  const navigate = useNavigate();

  const adminFeatures = [
    "Gestion complète des tickets",
    "Automatisation IA intelligente",
    "Analytique en temps réel",
    "Configuration système avancée"
  ];

  const clientFeatures = [
    "Création de tickets simple",
    "Support IA pour suggestions",
    "Suivi en temps réel",
    "Interface mobile-optimisée"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Bot className="w-8 h-8 text-blue-900" />
            <span className="font-semibold text-xl text-gray-900">TMA System</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comment souhaitez-vous accéder ?
          </h1>
          <div className="flex justify-center">
            <p className="text-lg text-gray-600 max-w-2xl text-center">
              Connectez-vous en tant qu'administrateur pour gérer le système ou en tant que client pour créer et suivre vos tickets.
            </p>
          </div>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          {/* Admin Dashboard Card */}
          <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-900 hover:shadow-lg transition-all duration-300 cursor-pointer">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-[#08052e] transition-colors">
                <Settings className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-lg font-bold text-gray-900 mb-1">Accès Administrateur</h2>
            <p className="text-gray-600 mb-4 font-medium text-sm">
              Gestion complète du système
            </p>
            <div className="mb-6"></div>

            {/* Features List */}
            <div className="space-y-2 mb-5">
              {adminFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-gray-700 text-xs">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-[#08052e] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Settings className="w-4 h-4" />
              Accéder en tant qu'Admin
            </button>
          </div>

          {/* Client Portal Card */}
          <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                <User className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-lg font-bold text-gray-900 mb-1">Accès Client</h2>
            <p className="text-gray-600 mb-4 font-medium text-sm">
              Espace client personnel
            </p>
            <div className="mb-6"></div>

            {/* Features List */}
            <div className="space-y-2 mb-5">
              {clientFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-gray-700 text-xs">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/tickets")}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <User className="w-4 h-4" />
              Accéder en tant que Client
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">
            Vous n'avez pas encore de compte ? Veuillez d'abord vous inscrire.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 text-[#08052e] hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
            >
              S'inscrire
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
            >
              ← Retourner à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
