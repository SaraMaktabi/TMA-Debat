import { Link } from "react-router-dom";
import { Bot, BarChart3, Users, AlertCircle, CheckCircle, Clock, TrendingUp, Home, Settings, LogOut, Layout, List, MessageSquare, Clock3, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");

  const stats = [
    { label: "Tickets Totaux", value: "156", color: "bg-blue-50", icon: BarChart3, textColor: "text-blue-600" },
    { label: "Ouverts", value: "42", color: "bg-red-50", icon: AlertCircle, textColor: "text-red-600" },
    { label: "En Cours", value: "28", color: "bg-yellow-50", icon: Clock, textColor: "text-yellow-600" },
    { label: "Résolus", value: "86", color: "bg-green-50", icon: CheckCircle, textColor: "text-green-600" },
  ];

  const recentTickets = [
    {
      id: "TKT-001",
      title: "Database connection timeout",
      description: "Users experiencing slow response times when accessing the dashboard...",
      status: "In Progress",
      priority: "High",
      date: "2026-04-19 10:30",
    },
    {
      id: "TKT-002",
      title: "Email notification system down",
      description: "Automated emails not being sent to users after registration...",
      status: "Open",
      priority: "High",
      date: "2026-04-19 09:15",
    },
    {
      id: "TKT-003",
      title: "Mobile app login issue",
      description: "Users unable to login via mobile app, web login works fine...",
      status: "In Progress",
      priority: "Medium",
      date: "2026-04-18 16:45",
    },
    {
      id: "TKT-004",
      title: "PDF export feature broken",
      description: "Export button returns 500 error when generating PDF reports...",
      status: "Open",
      priority: "Medium",
      date: "2026-04-18 14:20",
    },
    {
      id: "TKT-005",
      title: "Dark mode toggle not working",
      description: "Theme preference not persisting after page reload...",
      status: "Resolved",
      priority: "Low",
      date: "2026-04-17 11:00",
    },
  ];

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/dashboard" },
    { icon: BarChart3, label: "Tableau de Bord", href: "/dashboard" },
    { icon: AlertCircle, label: "Tickets", href: "/tickets" },
    { icon: Users, label: "Utilisateurs", href: "/team" },
    { icon: Settings, label: "Paramètres", href: "#" },
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Bot className="w-8 h-8 text-blue-900" />
            <span className="font-semibold text-lg text-gray-900">TMA System</span>
          </Link>
        </div>

        {/* Navigation */}
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

        {/* Footer */}
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
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Système Actif</span>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="text-lg text-gray-600">
              Vue d'ensemble du système TMA et gestion des incidents
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300"
                >
                  <p className="text-gray-600 text-sm font-medium mb-3">{stat.label}</p>
                  <h3 className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Recent Tickets Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Tickets Récents</h2>
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === "cards"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Liste
                  </button>
                </div>

                <Link
                  to="/tickets"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <TrendingUp className="w-4 h-4" />
                  Voir tous
                </Link>
              </div>
            </div>

            {/* Cards View */}
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTickets.map((ticket, index) => {
                  const StatusIcon = getStatusIcon(ticket.status);
                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300"
                    >
                      {/* Top Row: Status and Priority */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className={`flex items-center gap-2 ${getStatusBadgeStyles(ticket.status)}`}>
                          <StatusIcon className="w-5 h-5" />
                          <span className="text-sm font-semibold">{ticket.status}</span>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getPriorityStyles(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-900 mb-2 text-left">{ticket.title}</h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 text-left">{ticket.description}</p>

                      {/* Bottom Row: Date and View Analysis */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500 text-left">{ticket.date}</span>
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          View Analysis
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Titre</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Priorité</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-semibold text-blue-600">{ticket.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900 font-medium text-sm">{ticket.title}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyles(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600 text-sm">{ticket.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 text-sm">
              Dernière mise à jour: {new Date().toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}