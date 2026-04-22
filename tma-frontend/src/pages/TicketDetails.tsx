import { Link } from "react-router-dom";
import { Bot, Home, AlertCircle, Check, Settings, LogOut, ArrowLeft, MessageSquare, Play, CheckCircle2, MessageCircle, TrendingUp, Download, User, Calendar, Clock, Award, Zap } from "lucide-react";
import { useState } from "react";

interface Profile {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  score: number;
  matchPercentage: number;
  description: string;
  avatar: string;
}

interface DebateMessage {
  agentName: string;
  role: string;
  message: string;
  timestamp: string;
  roleColor: string;
}

export default function TicketDetails() {
  const [debateStarted, setDebateStarted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const ticket = {
    id: "TKT-001",
    title: "Database connection timeout",
    priority: "High",
    status: "In Progress",
    created: "2026-04-19 10:30",
    reporter: "John Doe",
    description: "Users are experiencing slow response times when accessing the dashboard. The database connection appears to be timing out intermittently, affecting approximately 30% of user requests. This issue started at 10:00 AM today and has been progressively worsening.",
    attachments: [
      { name: "error_logs.txt", size: "24 KB" },
      { name: "database_metrics.png", size: "156 KB" }
    ]
  };

  const recommendedProfiles: Profile[] = [
    {
      id: "PROF-001",
      name: "Database Expert",
      specialty: "Database Optimization & Tuning",
      experience: 12,
      score: 98,
      matchPercentage: 98,
      description: "Expert in database performance optimization with extensive experience in connection pooling.",
      avatar: "DE"
    },
    {
      id: "PROF-002",
      name: "Backend Specialist",
      specialty: "Backend Infrastructure",
      experience: 10,
      score: 92,
      matchPercentage: 92,
      description: "Specialized in high-performance backend systems and scalability issues.",
      avatar: "BS"
    },
    {
      id: "PROF-003",
      name: "Performance Engineer",
      specialty: "System Performance",
      experience: 8,
      score: 85,
      matchPercentage: 85,
      description: "Dedicated to analyzing and fixing performance bottlenecks in distributed systems.",
      avatar: "PE"
    },
    {
      id: "PROF-004",
      name: "DevOps Engineer",
      specialty: "Infrastructure & Monitoring",
      experience: 9,
      score: 78,
      matchPercentage: 78,
      description: "Expert in system monitoring, diagnostics, and infrastructure troubleshooting.",
      avatar: "DO"
    },
    {
      id: "PROF-005",
      name: "Cloud Architect",
      specialty: "Cloud Infrastructure",
      experience: 11,
      score: 74,
      matchPercentage: 74,
      description: "Experienced in diagnosing and resolving cloud-based performance issues.",
      avatar: "CA"
    }
  ];

  const debateMessages: DebateMessage[] = [
    {
      agentName: "Database Expert",
      role: "Primary Analyst",
      message: "The issue signature matches connection pool exhaustion. We need immediate analysis of database logs and connection metrics.",
      timestamp: "10:31 AM",
      roleColor: "bg-blue-50 border-blue-200"
    },
    {
      agentName: "Performance Engineer",
      role: "Validator",
      message: "Confirmed. I'm seeing 30% impact rate which aligns with pool capacity being hit. Recommend checking for long-running queries.",
      timestamp: "10:32 AM",
      roleColor: "bg-purple-50 border-purple-200"
    },
    {
      agentName: "Backend Specialist",
      role: "Context Provider",
      message: "Recent deployment 2 hours ago might be related. The query optimization changes could be causing lock contention.",
      timestamp: "10:33 AM",
      roleColor: "bg-orange-50 border-orange-200"
    },
    {
      agentName: "Database Expert",
      role: "Solution Proposer",
      message: "Recommended: 1) Increase pool size, 2) Optimize recent queries, 3) Add query timeouts. Priority: Pool size first.",
      timestamp: "10:34 AM",
      roleColor: "bg-green-50 border-green-200"
    }
  ];

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/dashboard" },
    { icon: AlertCircle, label: "Tickets", href: "/tickets" },
    { icon: Settings, label: "Paramètres", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Bot className="w-8 h-8 text-blue-900" />
            <span className="font-semibold text-lg text-gray-900">TMA System</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <Icon className="w-5 h-5 group-hover:text-blue-600" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
            <LogOut className="w-5 h-5 group-hover:text-red-600" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
        <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour au Tableau de Bord</span>
            </Link>
            {selectedProfile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{selectedProfile.name} sélectionné</span>
              </div>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <div className="px-8 py-8">
          {/* Ticket Header - Enhanced */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
                  <span className="text-lg text-gray-500 font-semibold">#{ticket.id}</span>
                </div>
                <p className="text-gray-600">Gérez et analysez ce ticket avec l'aide de nos experts IA</p>
              </div>
              {!debateStarted && (
                <button
                  onClick={() => setDebateStarted(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-5 h-5" />
                  Lancer Débat IA
                </button>
              )}
            </div>

            {/* Meta Info - Improved */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Priorité</p>
                  <p className="text-lg font-bold text-gray-900">{ticket.priority}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Statut</p>
                  <p className="text-lg font-bold text-gray-900">{ticket.status}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Créé</p>
                  <p className="text-lg font-bold text-gray-900">{ticket.created}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Signalé par</p>
                  <p className="text-lg font-bold text-gray-900">{ticket.reporter}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Description & Attachments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Description du problème</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">{ticket.description}</p>
              </div>

              {/* Attachments */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  Pièces jointes
                </h3>
                <div className="space-y-3">
                  {ticket.attachments.map((att, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all">
                        <span className="text-white font-bold text-lg"></span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{att.name}</p>
                        <p className="text-sm text-gray-500">{att.size}</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Recommended Profiles */}
            <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm h-fit sticky top-24">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Profils Recommandés</h2>
                <p className="text-sm text-gray-600">Top 5 meilleurs profils pour ce ticket</p>
              </div>

              <div className="space-y-3">
                {recommendedProfiles.map((profile, idx) => (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedProfile?.id === profile.id
                        ? "border-purple-500 bg-purple-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all ${
                          selectedProfile?.id === profile.id 
                            ? "bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg" 
                            : "bg-gradient-to-br from-blue-500 to-blue-600"
                        }`}>
                          {profile.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{profile.name}</p>
                          <p className="text-xs text-gray-600 truncate">{profile.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{profile.matchPercentage}%</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <Award className="w-3 h-3" /> Match
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" /> Score: {profile.score}/100
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500" /> {profile.experience} ans
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProfile && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg transform animate-pulse">
                  <p className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Profil sélectionné
                  </p>
                  <p className="text-xs text-blue-800">{selectedProfile.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Agent Debate Section - Enhanced */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Débat Multi-Agents IA</h2>
                    <p className="text-purple-100 text-sm">Analyse collaborative en temps réel</p>
                  </div>
                </div>
                {!debateStarted && (
                  <button
                    onClick={() => setDebateStarted(true)}
                    className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Démarrer
                  </button>
                )}
              </div>
            </div>

            <div className="px-8 py-8">
              {debateStarted ? (
                <div className="space-y-4">
                  {debateMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`border-l-4 border-purple-500 pl-6 py-4 rounded-r-lg transition-all duration-500 transform hover:translate-x-1 ${msg.roleColor}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 text-lg">{msg.agentName}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            msg.role === "Primary Analyst" ? "bg-blue-200 text-blue-700" :
                            msg.role === "Validator" ? "bg-purple-200 text-purple-700" :
                            msg.role === "Context Provider" ? "bg-orange-200 text-orange-700" :
                            "bg-green-200 text-green-700"
                          }`}>
                            {msg.role}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{msg.message}</p>
                    </div>
                  ))}

                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg transform">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-green-900 mb-3"> Consensus Obtenu</p>
                        <div className="space-y-2 text-green-800 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-lg">→</span>
                            <div>
                              <span className="font-bold">Meilleur Profil :</span> Database Expert (98% correspondance)
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-lg">→</span>
                            <div>
                              <span className="font-bold">Actions Recommandées :</span> 
                              <ul className="list-disc list-inside mt-1 ml-2">
                                <li>Augmenter la taille du pool de connexions</li>
                                <li>Optimiser les requêtes récentes</li>
                                <li>Ajouter des délais d'attente aux requêtes</li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-lg">→</span>
                            <div>
                              <span className="font-bold">Score de Confiance :</span> 98/100
                            </div>
                          </div>
                        </div>
                        <button className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all">
                          Assigner au Profil Sélectionné
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 font-semibold mb-2 text-lg">Prêt pour le débat IA ?</p>
                  <p className="text-gray-500 mb-6 max-w-md text-center">Lancez un débat multi-agents pour obtenir les meilleures recommandations</p>
                  <button
                    onClick={() => setDebateStarted(true)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play className="w-6 h-6" />
                    Lancer le Débat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}