import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Zap, Shield, BarChart3, Wrench, UserCheck, Eye, Lock, X, ChevronLeft, ChevronRight, Check, Sparkles, TrendingUp, Code2, Users } from "lucide-react";
import agentTmaImage from "../assets/agentTma.jpg";
import thinkgridLogo from "../assets/Thinkgrid.png";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [visibleElements, setVisibleElements] = useState({});
  const [showAgentImage, setShowAgentImage] = useState(false);
  const observerRef = useRef(null);

  // Intersection Observer Hook for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  // Observe all elements with data-scroll attribute
  useEffect(() => {
    const elements = document.querySelectorAll("[data-scroll]");
    elements.forEach((el) => {
      observerRef.current?.observe(el);
    });
  }, []);

  const features = [
    { icon: Bot, title: "Multi-Agent IA", description: "Analyse intelligente des tickets par agents IA spécialisés", gradient: "from-blue-700 to-cyan-700" },
    { icon: Zap, title: "Résolution Instantanée", description: "Triage automatique et propositions de solutions", gradient: "from-purple-500 to-pink-500" },
    { icon: Shield, title: "Prêt pour l'Entreprise", description: "Gestion sécurisée et scalable", gradient: "from-green-500 to-emerald-500" },
    { icon: BarChart3, title: "Analytique Avancée", description: "Insights en temps réel et métriques", gradient: "from-orange-500 to-red-500" },
  ];

  const detailedFeatures = [
    {
      icon: Bot,
      title: "Automatisation alimentée par IA",
      subtitle: "Traitement de tickets intelligent de nouvelle génération",
      description: "Nos agents IA avancés analysent automatiquement chaque ticket, les classifient par priorité et génèrent des solutions précises basées sur votre historique.",
      benefits: ["Jusqu'à 70% réduction du travail manuel", "Classification automatique prioritaire", "Solutions intelligentes proposées"]
    },
    {
      icon: Zap,
      title: "Résolution Instantanée",
      subtitle: "Solutions rapides et efficaces",
      description: "Proposez des solutions immédiates basées sur l'historique et les meilleures pratiques. Chaque ticket est traité en minutes, pas en heures.",
      benefits: ["Temps de réponse réduit", "Satisfaction client augmentée", "Eficacité maximale"]
    },
    {
      icon: Shield,
      title: "Entreprise Prête",
      subtitle: "Sécurité et Scalabilité",
      description: "Infrastructure sécurisée et scalable pour les entreprises de toute taille. Conformité avec les normes industrielles et chiffrement des données.",
      benefits: ["Sécurité de niveau entreprise", "99.9% de disponibilité", "Compliance certifiée"]
    },
    {
      icon: BarChart3,
      title: "Analytique Avancée",
      subtitle: "Insights en temps réel",
      description: "Tableaux de bord détaillés avec métriques clés de performance. Suivez les tendances, identifiez les goulots d'étranglement et optimisez vos workflows.",
      benefits: ["Rapports personnalisables", "Prévisions intelligentes", "Dashboards en temps réel"]
    },
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
    <div className="min-h-screen bg-white">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                Gestion de tickets <br />
                <span className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 bg-clip-text text-transparent">alimentée par l'IA</span>
              </h1>

              <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
                Automatisez votre support IT avec des agents IA intelligents. Réduisez les temps de traitement, augmentez la satisfaction client et optimisez vos ressources.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--edu-primary)] text-white font-bold rounded-xl hover:brightness-95 transition-all duration-300 transform hover:scale-105 group"
                >
                  <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Démarrer Maintenant
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-black font-bold rounded-xl border border-blue/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                >
                  <Eye className="w-5 h-5" />
                  Voir les Fonctionnalités
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-800">99.9%</div>
                  <div className="text-sm text-gray-600">Disponibilité</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-800">70%</div>
                  <div className="text-sm text-gray-600">Temps économisé</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-blue-800">500+</div>
                  <div className="text-sm text-gray-600">Clients</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:block hidden">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse"></div>
                
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-slideInUpMorph">
                  <img 
                    src={showAgentImage ? "https://images.pexels.com/photos/6153343/pexels-photo-6153343.jpeg?auto=compress&cs=tinysrgb&w=800" : agentTmaImage}
                    alt={showAgentImage ? "AI-Powered Ticket Management" : "Thinkgrid Dashboard"}
                    className="w-full h-auto object-cover brightness-90 hover:brightness-100 transition-all duration-300"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION - Cards sliding from sides */}
      <section className="py-24 px-6 bg-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 -left-96 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-96 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Cas d'usage en action
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Découvrez comment nos clients transforment leur support IT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Automatisation complète",
                description: "Réduisez les tickets manuels de 70% avec l'IA",
                icon: Zap
              },
              {
                title: "Réponses rapides",
                description: "Proposez des solutions en secondes, pas en jours",
                icon: TrendingUp
              },
              {
                title: "Satisfaction client",
                description: "Augmentez vos scores de satisfaction client",
                icon: Users
              },
              {
                title: "Analytics avancée",
                description: "Tableaux de bord détaillés et insights profonds",
                icon: BarChart3
              },
              {
                title: "Intégration facile",
                description: "Connectez-vous à vos systèmes en minutes",
                icon: Code2
              },
              {
                title: "Support 24/7",
                description: "Équipe d'experts toujours disponible pour vous",
                icon: UserCheck
              }
            ].map((item, index) => {
              const elementId = `showcase-${index}`;
              const isVisible = visibleElements[elementId];
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  id={elementId}
                  data-scroll
                  className={`group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-transparent hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 transform ${
                    isVisible
                      ? index % 2 === 0
                        ? "animate-slideInLeft"
                        : "animate-slideInRight"
                      : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${(index % 3) * 100}ms` : "0ms"
                  }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-950 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>

                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-transparent group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                      {item.description}
                    </p>
                    <div className="pt-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION - Creative Analytics */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-100 via-white to-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Optimisez votre support avec l'IA
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transformez votre gestion du support avec des données en temps réel
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Tickets résolus", value: "99.2%", icon: Check },
              { label: "Temps de réponse", value: "-75%", icon: Zap },
              { label: "Satisfaction client", value: "4.9/5", icon: Users },
              { label: "Automatisation", value: "70%", icon: Bot }
            ].map((stat, index) => {
              const elementId = `stat-${index}`;
              const isVisible = visibleElements[elementId];
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  id={elementId}
                  data-scroll
                  className={`relative group transform transition-all duration-500 ${
                    isVisible
                      ? "animate-slideInUp opacity-100"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-950 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-2xl p-8 border border-gray-200 group-hover:border-transparent group-hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-transparent mb-4 shadow-lg">
                      <Icon className="w-6 h-6 text-blue-900" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-4xl font-black text-blue-800">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Performance maximale",
                desc: "Augmentez votre productivité jusqu'à 70%",
                icon: TrendingUp,
                bar: 70
              },
              {
                title: "Intégration facile",
                desc: "Compatible avec vos systèmes existants",
                icon: Code2,
                bar: 95
              },
              {
                title: "Support dédié",
                desc: "Équipe d'experts disponible 24/7",
                icon: Users,
                bar: 100
              }
            ].map((item, index) => {
              const elementId = `feature-benefit-${index}`;
              const isVisible = visibleElements[elementId];
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  id={elementId}
                  data-scroll
                  className={`transform transition-all duration-500 ${
                    isVisible
                      ? index % 2 === 0 
                        ? "animate-slideInLeft opacity-100"
                        : "animate-slideInRight opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 100}ms` : "0ms"
                  }}
                >
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:border-blue-600 transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-900" />
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-800">Efficacité</span>
                        <span className="text-sm font-bold text-gray-900">{item.bar}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-800 to-blue-950 rounded-full transition-all duration-700"
                          style={{
                            width: isVisible ? `${item.bar}%` : "0%"
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Link
              to="/login?role=client&next=/tickets"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-800 to-blue-950 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-300 transform hover:scale-105 group"
            >
              <Zap className="w-5 h-5 group-hover:animate-bounce" />
              Essayer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* DASHBOARD SECTION WITH agentTmaImage */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Voir Thinkgrid en action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tableau de bord intuitif et puissant pour gérer tous vos tickets
            </p>
          </div>

          <div 
            id="dashboard-card"
            data-scroll
            className={`relative group rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-700 ${
              visibleElements["dashboard-card"] 
                ? "animate-slideInUp opacity-100" 
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
            
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/6153343/pexels-photo-6153343.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="AI-Powered Ticket Management"
                className="w-full h-auto object-cover brightness-90 hover:brightness-100 transition-all duration-300"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
              
              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Gestion Complète des Tickets</h3>
                    <p className="text-gray-300">Interface moderne et responsive pour tous vos besoins IT</p>
                  </div>
                  <Link to="/demo" className="edu-cta flex items-center gap-2 whitespace-nowrap">
                    <Eye className="w-5 h-5" />
                    Voir la démo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 px-6 bg-gray-900 relative overflow-hidden border-t border-gray-800">
        <div className="relative max-w-7xl mx-auto">
          {/* CTA Banner */}
          <div className="text-center mb-16 pb-16 border-b border-gray-800">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Prêt à révolutionner votre support ?
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Rejoignez plus de 500 entreprises qui font confiance à Thinkgrid pour optimiser leur gestion du support avec l'IA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <Link
                to="/login?role=admin&next=/users"
                className="px-8 py-4 bg-transparent text-white border-2 border-white font-bold rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
              >
               Commencer
              </Link>
              <Link
                to="/login?role=admin&next=/users"
                className="px-8 py-4 bg-transparent text-white border-2 border-white font-bold rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>

          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-black text-white mb-4">Thinkgrid</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Plateforme IA pour gestion intelligente du support IT
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 11-20 0 10 10 0 0120 0z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-white mb-4">Produit</h4>
              <ul className="space-y-3">
                <li><Link to="/demo" className="text-gray-400 hover:text-white transition-colors">Démo</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-4">Entreprise</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Presse</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aide & FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Statut</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">Légal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Thinkgrid. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Conditions d'utilisation</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Préférences</a>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-200 to-blue-300 border-b border-gray-200 p-7 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-transparent rounded-xl flex items-center justify-center relative shadow-lg">
                  <CurrentIcon className="w-8 h-8 text-blue-900" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Fonctionnalités Thinkgrid</h2>
                  <p className="text-sm text-gray-600 font-medium">{currentFeatureIndex + 1} sur {detailedFeatures.length}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg p-2 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Divider */}
            <div className="h-1 bg-gradient-to-r from-blue-900 via-blue-800 to-transparent"></div>

            {/* Modal Content */}
            <div className="p-10">
              
              {/* Feature Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-transparent rounded-3xl flex items-center justify-center relative shadow-lg">
                  <CurrentIcon className="w-12 h-12 text-blue-900" />
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
              <div className="space-y-4 mb-10 bg-gray-50 rounded-xl p-6">
                {currentFeature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  onClick={prevFeature}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium hover:scale-105 transform"
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
                      className={`rounded-full transition-all duration-300 transform hover:scale-125 ${
                        index === currentFeatureIndex ? "bg-blue-900 w-8 h-2.5" : "bg-gray-300 w-2.5 h-2.5"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextFeature}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium hover:scale-105 transform"
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