import { Link, useNavigate } from "react-router-dom";
import { Settings, User, Check, ArrowRight, Zap, Users as UsersIcon } from "lucide-react";
import thinkgridLogo from "../assets/Thinkgrid.png";

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
       
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Choisissez votre accès
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connectez-vous en tant qu'administrateur pour gérer le système ou en tant que client pour créer et suivre vos tickets.
            </p>
          </div>
        
      </section>

      {/* Main Content */}
      <section className="py-0 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Access Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Admin Dashboard Card */}
            <div className="group bg-white rounded-2xl border-2 border-[#020331] p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#020331] rounded-2xl flex items-center justify-center group-hover:bg-[#0a0844] transition-colors shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Accès Administrateur</h2>
              <p className="text-gray-600 mb-6 font-medium text-center">
                Gestion complète du système
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {adminFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-3 h-3 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/login?role=admin&next=/users")}
                className="w-full px-6 py-3 bg-[#020331] text-white font-bold rounded-lg hover:bg-[#0a0844] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Settings className="w-5 h-5" />
                Accéder en tant qu'Admin
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Client Portal Card */}
            <div className="group bg-white rounded-2xl border-2 border-[#d7cdfb] p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d7cdfb] to-[#c8b8f0] rounded-2xl flex items-center justify-center group-hover:from-[#c8b8f0] group-hover:to-[#d7cdfb] transition-all shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Accès Client</h2>
              <p className="text-gray-600 mb-6 font-medium text-center">
                Espace client personnel
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {clientFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-3 h-3 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/login?role=client&next=/tickets")}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#d7cdfb] to-[#c8b8f0] text-gray-900 font-bold rounded-lg hover:from-[#c8b8f0] hover:to-[#b9a4e5] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <User className="w-5 h-5" />
                Accéder en tant que Client
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 mb-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#020331] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Rapide</h3>
                <p className="text-sm text-gray-600">Configuration instantanée et accès immédiat à la plateforme</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#d7cdfb] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <UsersIcon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Collaboratif</h3>
                <p className="text-sm text-gray-600">Travaillez ensemble en temps réel avec votre équipe</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#020331] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Sécurisé</h3>
                <p className="text-sm text-gray-600">Authentification sécurisée et données chiffrées</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-gray-600 text-base mb-6">
              Vous n'avez pas encore de compte ?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#020331] text-white font-bold rounded-lg hover:bg-[#0a0844] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Créer un compte
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                ← Retourner à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
