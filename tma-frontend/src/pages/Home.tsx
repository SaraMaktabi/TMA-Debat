import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Zap, Shield, BarChart3, Wrench, UserCheck, Eye, Lock, X, ChevronLeft, ChevronRight, Check, Play } from "lucide-react";
import agentTmaImage from "../assets/agentTma.jpg";

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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50/50 via-blue-50/30 to-white">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center justify-center gap-2 rounded-md border bg-blue-100 text-blue-900 mb-6 text-sm px-4 py-2 border-blue-200 font-medium">
            <Lock className="w-4 h-4" />
            Maintenant avec intégration IA
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl mb-8 leading-tight font-bold text-gray-900">
            Le système de tickets intelligent pour <br />
            <span className="text-blue-900 bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">les services IT modernes</span>
          </h1>

         

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 flex-wrap">
            <Link
              to="/tickets"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-all duration-200 shadow-lg"
            >
              <Bot className="w-5 h-5" />
              Démarrer la gestion des tickets
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <Eye className="w-5 h-5" />
              Voir les fonctionnalités
            </button>
           
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-4xl font-bold mb-2 text-blue-900">99.9%</div>
              <div className="text-gray-600">Disponibilité</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-4xl font-bold mb-2 text-blue-900">70%</div>
              <div className="text-gray-600">Temps économisé</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-4xl font-bold mb-2 text-blue-900">500+</div>
              <div className="text-gray-600">Entreprises</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200">
              <div className="text-4xl font-bold mb-2 text-blue-900">4.9/5</div>
              <div className="text-gray-600">Note client</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="group bg-white rounded-2xl p-7 border border-gray-200 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <feature.icon className="w-7 h-7 text-blue-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-base">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Voir TMA System en action</h2>
          <p className="text-lg text-gray-600">Découvrez la puissance de la gestion du support pilotée par IA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Dashboard Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">AI-Powered Dashboard</h3>
              <p className="text-gray-600 text-lg">Real-time insights with intelligent automation</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <BarChart3 className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Métriques en temps réel</h4>
                    <p className="text-sm text-gray-600">Suivi instantané de tous vos indicateurs clés de performance</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Automatisation intelligente</h4>
                    <p className="text-sm text-gray-600">Workflow automatisés qui s'adaptent à vos besoins</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sécurité d'entreprise</h4>
                    <p className="text-sm text-gray-600">Conformité complète et protection des données</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                to="/tickets"
                className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
               Voir tickets
              </Link>
              <button
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition-all duration-200"
              >
                En savoir plus
              </button>
            </div>
          </div>

          {/* Right Side - Dashboard Image */}
          <div className="hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative">
              <img 
                src={agentTmaImage} 
                alt="AI-Powered Dashboard" 
                className="w-full h-auto object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black-900/30 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24" style={{ backgroundColor: "#020412" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Prêt pour le niveau suivant ?</h2>
          <p className="text-xl text-white mb-12 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/tickets"
              className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Voir tickets
            </Link>
            <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-200">
              En savoir plus
            </button>
          </div>
          
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-7 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center relative shadow-sm">
                  <CurrentIcon className="w-7 h-7 text-blue-900" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Fonctionnalités TMA</h2>
                  <p className="text-sm text-gray-500">{currentFeatureIndex + 1} de {detailedFeatures.length} fonctionnalités</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Divider */}
            <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-transparent"></div>

            {/* Modal Content */}
            <div className="p-10">
              
              {/* Feature Icon */}
              <div className="flex justify-center mb-10">
                <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center relative shadow-lg">
                  <CurrentIcon className="w-12 h-12 text-blue-900" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Feature Title */}
              <h3 className="text-3xl font-bold text-gray-900 text-center mb-3">
                {currentFeature.title}
              </h3>

              {/* Feature Subtitle */}
              <p className="text-center text-gray-600 font-medium mb-8 text-lg">
                {currentFeature.subtitle}
              </p>

              {/* Feature Description */}
              <p className="text-gray-600 text-center mb-10 leading-relaxed">
                {currentFeature.description}
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-10">
                {currentFeature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  onClick={prevFeature}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
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
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentFeatureIndex ? "bg-blue-900 w-8" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextFeature}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
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