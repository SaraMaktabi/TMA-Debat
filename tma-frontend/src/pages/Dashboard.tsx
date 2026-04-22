import { Link, useNavigate } from "react-router-dom";
import { Bot, BarChart3, UsersIcon, AlertCircle, CheckCircle, Clock, TrendingUp, Home, Settings, LogOut, Layout, List, MessageSquare, Clock3, CheckCircle2, Zap, Activity, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/tickets");
        setTickets(res.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Calculate stats from tickets
  const stats = [
    { 
      label: "Tickets Totaux", 
      value: tickets.length.toString(), 
      color: "bg-blue-50", 
      icon: BarChart3, 
      textColor: "text-blue-600" 
    },
    { 
      label: "Ouverts", 
      value: "0", 
      color: "bg-red-50", 
      icon: AlertCircle, 
      textColor: "text-red-600" 
    },
    { 
      label: "En Cours", 
      value: "0", 
      color: "bg-yellow-50", 
      icon: Clock, 
      textColor: "text-yellow-600" 
    },
    { 
      label: "Résolus", 
      value: "0", 
      color: "bg-green-50", 
      icon: CheckCircle, 
      textColor: "text-green-600" 
    },
  ];

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: BarChart3, label: "Tableau de Bord", href: "/dashboard", badge: null },
    // { icon: AlertCircle, label: "Tickets", href: "/tickets", badge: tickets.length.toString() },
    { icon: UsersIcon, label: "Utilisateurs", href: "/users", badge: null },
    { icon: Settings, label: "Paramètres", href: "#", badge: null },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return AlertCircle;
      case "In Progress":
        return Clock3;
      case "Resolved":
        return CheckCircle2;
      default:
        return AlertCircle;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "Open":
        return "text-red-600";
      case "In Progress":
        return "text-blue-600";
      case "Resolved":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
      {/* Sidebar - Light */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto">
        {/* Logo Section - Light */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-all duration-300">
            <div className="p-2.5 rounded-xl shadow-md group-hover:shadow-gray-400/50 transition-all duration-300" style={{backgroundColor: '#08052e'}}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">TMA System</span>
           
            </div>
          </Link>
        </div>

        {/* Navigation - Light */}
        <nav className="p-4 space-y-2 mt-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-purple-100/0 group-hover:from-blue-100/50 group-hover:to-purple-100/50 transition-all duration-300"></div>
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="text-sm font-semibold relative z-10">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-md relative z-10" style={{backgroundColor: '#08052e'}}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-6 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

        {/* Quick Stats */}
        {/* <div className="px-4 space-y-2">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider ml-2">Stats Rapides</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Tickets Totaux</span>
                <span className="text-lg font-bold text-black">{tickets.length}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${Math.min(100, tickets.length * 10)}%` }}></div>
              </div>
            </div>
          </div>
        </div> */}

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl text-white font-bold shadow-md flex items-center justify-center" style={{backgroundColor: '#0f0745'}}>
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
                <p className="text-xs font-medium" style={{color: '#0f0745'}}>Admin</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90" style={{backgroundColor: '#0f0745'}}>
                Profile
              </button>
              <button className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation - Light */}
        <nav className="border-b border-gray-200 bg-white/60 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de Bord
              </h1>
              <p className="text-sm text-gray-600 mt-1">Bienvenue sur votre dashboard TMA</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-green-100/60 to-emerald-100/60 rounded-xl border border-green-300/60 backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm font-semibold text-green-700">Système Actif</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Dernière mise à jour</p>
                <p className="text-sm font-semibold text-gray-900">{new Date().toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit"})}</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="px-8 py-8">
          {/* Header Info */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-lg text-gray-700 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Vue d'ensemble complète du système TMA
              </p>
            </div>
            <Link
              to="/tickets"
              className="flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:opacity-90"
              style={{backgroundColor: '#08052e'}}
            >
              <TrendingUp className="w-4 h-4" />
              Tous les Tickets
            </Link>
          </div>

          {/* Stats Grid - Light */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/50 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">{stat.label}</p>
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      <Icon className={`w-5 h-5 ${stat.textColor} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-black mb-2">{stat.value}</h3>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">+12% vs. semaine dernière</p>
                </div>
              );
            })}
          </div>

          {/* Recent Tickets Section - Light */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{backgroundColor: '#08052e'}}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tickets Récents</h2>
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                      viewMode === "cards"
                        ? "text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    style={viewMode === "cards" ? {backgroundColor: '#08052e'} : {}}
                  >
                    <Layout className="w-4 h-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                      viewMode === "list"
                        ? "text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    style={viewMode === "list" ? {backgroundColor: '#08052e'} : {}}
                  >
                    <List className="w-4 h-4" />
                    Liste
                  </button>
                </div>
              </div>
            </div>

            {/* Cards View */}
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600">Chargement des tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Aucun ticket</h3>
                    <p className="text-gray-600 mt-2">Il n'y a actuellement aucun ticket créé.</p>
                  </div>
                ) : (
                  tickets.map((ticket, index) => {
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="group bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-purple-300 hover:shadow-lg hover:shadow-purple-200/50 hover:transform hover:-translate-y-2"
                      >
                        {/* Top Row: Urgency */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className={`flex items-center gap-2 font-semibold group-hover:scale-105 transition-transform ${
                            ticket.urgency === "high" ? "text-red-600" :
                            ticket.urgency === "medium" ? "text-yellow-600" : "text-green-600"
                          }`}>
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{ticket.urgency === "high" ? "Élevé" : ticket.urgency === "medium" ? "Moyen" : "Faible"}</span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                            ticket.urgency === "high" ? "bg-red-100 text-red-700" :
                            ticket.urgency === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                          }`}>
                            {ticket.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{ticket.title}</h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>

                        {/* Company & Email */}
                        <div className="flex flex-col gap-2 text-xs text-gray-500 mb-4 pb-4 border-t border-gray-200">
                          <span className="flex items-center gap-1 mt-2">
                            <strong>Entreprise:</strong> {ticket.company_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <strong>Email:</strong> {ticket.email}
                          </span>
                        </div>

                        {/* Bottom Row: Date and View */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/ticket/${ticket.id}`);
                            }}
                            className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
                          >
                            Détails →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Titre</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Entreprise</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Urgence</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Catégorie</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-600">
                          Chargement des tickets...
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-600">
                          Aucun ticket trouvé
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket, index) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                        >
                          <td className="py-4 px-4">
                            <p className="text-gray-900 font-medium text-sm">{ticket.title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-600 text-sm">{ticket.company_name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                              ticket.urgency === "high" ? "bg-red-100 text-red-700" :
                              ticket.urgency === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                            }`}>
                              {ticket.urgency === "high" ? "Élevé" : ticket.urgency === "medium" ? "Moyen" : "Faible"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-600 text-sm">{ticket.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-600 text-sm">
                              {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => navigate(`/ticket/${ticket.id}`)}
                              className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              ✨ Dashboard TMA - Gestion intelligente des tickets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}