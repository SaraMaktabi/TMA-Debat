import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Zap, Shield, BarChart3, Wrench, UserCheck, Play, Eye, Lock, X, ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const features = [
    { icon: Bot, title: "Multi-Agent AI", description: "Intelligent ticket analysis by specialized AI agents" },
    { icon: Zap, title: "Instant Resolution", description: "Automated incident triage and solution proposals" },
    { icon: Shield, title: "Enterprise Ready", description: "Secure, scalable incident management" },
    { icon: BarChart3, title: "Analytics", description: "Real-time insights and performance metrics" },
  ];

  const detailedFeatures = [
    {
      icon: Bot,
      title: "Automatisation alimentée par IA",
      subtitle: "Traitement de tickets intelligent de nouvelle génération",
      description: "Unsere fortschrittliche KI analysiert eingehende Tickets automatisch und klassifiziert sie nach Priorität, Kategorie und Dringlichkeit. Machine Learning-Algorithmen lernen kontinuierlich aus vergangenen Lösungen und bieten präzise Lösungsvorschläge.",
      benefits: ["Bis zu 70% Reduzierung der manuellen", "Automatische Prioritätsbewertung"]
    },
    {
      icon: Zap,
      title: "Résolution Instantanée",
      subtitle: "Solutions rapides et efficaces",
      description: "Notre système propose des solutions immédiates basées sur l'historique et les meilleures pratiques. Chaque ticket est traité en minutes, pas en heures.",
      benefits: ["Temps de réponse réduit", "Satisfaction client augmentée"]
    },
    {
      icon: Shield,
      title: "Entreprise Prête",
      subtitle: "Sécurité et Scalabilité",
      description: "Infrastructure sécurisée et scalable pour les entreprises de toute taille. Conformité avec les normes industrielles et chiffrement des données.",
      benefits: ["Sécurité de niveau entreprise", "99.9% de disponibilité"]
    },
    {
      icon: BarChart3,
      title: "Analytique Avancée",
      subtitle: "Insights en temps réel",
      description: "Tableaux de bord détaillés avec métriques clés de performance. Suivez les tendances, identifiez les goulots d'étranglement et optimisez vos workflows.",
      benefits: ["Rapports personnalisables", "Prévisions intelligentes"]
    },
    {
      icon: Wrench,
      title: "Integration Facile",
      subtitle: "Compatible avec vos outils existants",
      description: "Se connecte facilement avec vos systèmes existants. API robuste et webhooks pour l'automatisation complète.",
      benefits: ["Configuration rapide", "Support API complet"]
    },
    {
      icon: UserCheck,
      title: "Support Dédié",
      subtitle: "Équipe d'experts disponible 24/7",
      description: "Notre équipe de support technique est disponible 24/7 pour vous aider. Documentation complète et formation personnalisée.",
      benefits: ["Support en plusieurs langues", "Premium assistance incluse"]
    }
  ];

  const currentFeature = detailedFeatures[currentFeatureIndex];
  const CurrentIcon = currentFeature.icon;

  const nextFeature = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % detailedFeatures.length);
  };

  const prevFeature = () => {
    setCurrentFeatureIndex((prev) => (prev - 1 + detailedFeatures.length) % detailedFeatures.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white">
     <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-900" />
            <span className="font-semibold text-xl text-gray-900">TMA System</span>
          </div>
          <Link
            to="/tickets"
            className="px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

     <div className="max-w-7xl mx-auto px-6 py-28 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-8">
            <Lock className="w-4 h-4" />
            Maintenant avec intégration IA
          </div>

          {/* Main Title */}
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Le système de tickets intelligent pour <br />
            les services IT <span className="text-blue-900">modernes</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Révolutionnez votre gestion du support avec des workflows alimentés par IA, des solutions automatisées et une analyse intelligente. Pas de frais d'installation, pas de frais cachés.
          </p>

         {/* CTA Buttons */}
         <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/tickets"
              className="px-8 py-3.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-950 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Lock className="w-5 h-5" />
             Démarrer la démo gratuitement
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3.5 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Voir les fonctionnalités
            </button>
            <button
              className="w-12 h-12 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Play className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 mb-20">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

       <div className="bg-white rounded-3xl p-10 lg:p-14 border border-gray-200 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">How It Works</h2>
          <p className="text-center text-gray-600 mb-10">Three specialized AI agents collaborate to resolve incidents automatically</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-blue-900">1</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Analyst Agent</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Analyzes incident details, identifies patterns, and determines root causes using advanced diagnostics</p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-green-600">2</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Technician Agent</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Proposes technical solutions, creates action plans, and provides implementation guidance</p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-purple-600">3</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Manager Agent</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Reviews proposals, makes final decisions, and allocates resources for optimal resolution</p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
              <Zap className="w-5 h-5 text-blue-900" />
              <span className="font-semibold text-gray-900">Average resolution time: 8 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center relative">
                  <CurrentIcon className="w-6 h-6 text-blue-900" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">TMA System Features</h2>
                  <p className="text-sm text-gray-500">{currentFeatureIndex + 1} von {detailedFeatures.length} Features</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Divider */}
            <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-transparent"></div>

            {/* Modal Content */}
            <div className="p-8">
              
              {/* Feature Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center relative">
                  <CurrentIcon className="w-12 h-12 text-blue-900" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Feature Title */}
              <h3 className="text-3xl font-bold text-gray-900 text-center mb-2">
                {currentFeature.title}
              </h3>

              {/* Feature Subtitle */}
              <p className="text-center text-gray-600 font-medium mb-6">
                {currentFeature.subtitle}
              </p>

              {/* Feature Description */}
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                {currentFeature.description}
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {currentFeature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={prevFeature}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Précédent
                </button>
                
                {/* Indicators */}
                <div className="flex gap-2">
                  {detailedFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeatureIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentFeatureIndex ? "bg-blue-900" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextFeature}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}