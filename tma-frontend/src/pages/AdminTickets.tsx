import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  BarChart3,
  UsersIcon,
  AlertCircle,
  CheckCircle,
  Home,
  Settings,
  LogOut,
  Layout,
  List,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Filter,
  RefreshCcw,
  Brain,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ticketAPI } from "../api/client";
import { clearSession, getSession } from "../utils/auth";
import PlatformSidebar from "../components/PlatformSidebar";

type AdminTicket = {
  id: string;
  titre: string;
  description?: string;
  priorite: "P1" | "P2" | "P3" | "P4" | string;
  statut: "NOUVEAU" | "EN_ANALYSE" | "AFFECTE" | "RESOLU" | string;
  score_difficulte?: number | null;
  score?: number | null;
  created_at?: string | null;
  application?: string;
  environnement?: string;
};

type TimeFilter = "7d" | "30d" | "90d" | "all";

export default function AdminTickets() {
  const navigate = useNavigate();
  const currentUser = getSession();

  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const avatarText = (currentUser?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const isInPeriod = (dateValue: string | null | undefined, period: TimeFilter): boolean => {
    if (!dateValue || period === "all") return true;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const minDate = new Date(now);
    minDate.setDate(now.getDate() - days);
    return date >= minDate;
  };

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.list();
      const normalized = (response || []).map((t: AdminTicket) => ({
        ...t,
        score_difficulte: t.score_difficulte ?? t.score,
      }));
      setTickets(normalized);
    } catch (error) {
      console.error("Error loading admin tickets:", error);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets().then(() => setLoading(false));
  }, []);

  const refreshTickets = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const reanalyzePending = async () => {
    setReanalyzing(true);
    try {
      await ticketAPI.reanalyzeAllPending();
      await fetchTickets();
    } catch (error) {
      console.error("Error reanalyzing pending tickets:", error);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (currentUser?.role !== "Admin") {
      return;
    }

    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce ticket ?");
    if (!confirmed) {
      return;
    }

    try {
      await ticketAPI.delete(ticketId, { requesterRole: currentUser.role });
      await fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      window.alert("Suppression impossible pour le moment.");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const statusOk = statusFilter === "ALL" || ticket.statut === statusFilter;
      const periodOk = isInPeriod(ticket.created_at, timeFilter);
      const query = searchTerm.trim().toLowerCase();
      const searchOk =
        query.length === 0 ||
        ticket.titre?.toLowerCase().includes(query) ||
        ticket.application?.toLowerCase().includes(query) ||
        ticket.priorite?.toLowerCase().includes(query);
      return statusOk && periodOk && searchOk;
    });
  }, [tickets, statusFilter, timeFilter, searchTerm]);

  const counts = useMemo(() => {
    const values = {
      total: filteredTickets.length,
      nouveau: 0,
      enCours: 0,
      resolu: 0,
      pendingScore: 0,
    };

    filteredTickets.forEach((ticket) => {
      if (ticket.statut === "NOUVEAU") values.nouveau += 1;
      if (ticket.statut === "EN_ANALYSE" || ticket.statut === "AFFECTE") values.enCours += 1;
      if (ticket.statut === "RESOLU") values.resolu += 1;
      if (ticket.score_difficulte === null || ticket.score_difficulte === undefined) values.pendingScore += 1;
    });

    return values;
  }, [filteredTickets]);

  const priorityDashboard = useMemo(() => {
    const byPriority = {
      P1: filteredTickets.filter((t) => t.priorite === "P1").length,
      P2: filteredTickets.filter((t) => t.priorite === "P2").length,
      P3: filteredTickets.filter((t) => t.priorite === "P3").length,
      P4: filteredTickets.filter((t) => t.priorite === "P4").length,
    };

    const total = filteredTickets.length || 1;

    return [
      { key: "P1", label: "Critique", count: byPriority.P1, percent: Math.round((byPriority.P1 / total) * 100), tone: "bg-red-100 text-red-700" },
      { key: "P2", label: "Haute", count: byPriority.P2, percent: Math.round((byPriority.P2 / total) * 100), tone: "bg-orange-100 text-orange-700" },
      { key: "P3", label: "Normale", count: byPriority.P3, percent: Math.round((byPriority.P3 / total) * 100), tone: "bg-yellow-100 text-yellow-700" },
      { key: "P4", label: "Faible", count: byPriority.P4, percent: Math.round((byPriority.P4 / total) * 100), tone: "bg-green-100 text-green-700" },
    ];
  }, [filteredTickets]);

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: BarChart3, label: "Tableau de Bord", href: "/dashboard", badge: null },
    { icon: AlertCircle, label: "Tickets Admin", href: "/admin-tickets", badge: counts.total > 0 ? counts.total.toString() : null },
    { icon: UsersIcon, label: "Utilisateurs", href: "/users", badge: null },
    { icon: Settings, label: "Parametres", href: "#", badge: null },
  ];

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "P1":
        return { bg: "bg-red-100", text: "text-red-700", Icon: AlertTriangle };
      case "P2":
        return { bg: "bg-orange-100", text: "text-orange-700", Icon: AlertCircle };
      case "P3":
        return { bg: "bg-yellow-100", text: "text-yellow-700", Icon: AlertCircle };
      case "P4":
        return { bg: "bg-green-100", text: "text-green-700", Icon: CheckCircle };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", Icon: AlertCircle };
    }
  };

  const getStatusStyles = (statut: string) => {
    switch (statut) {
      case "NOUVEAU":
        return { bg: "bg-blue-100", text: "text-blue-700", label: "Nouveau" };
      case "EN_ANALYSE":
        return { bg: "bg-yellow-100", text: "text-yellow-700", label: "En analyse" };
      case "AFFECTE":
        return { bg: "bg-purple-100", text: "text-purple-700", label: "Affecte" };
      case "RESOLU":
        return { bg: "bg-green-100", text: "text-green-700", label: "Resolue" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: statut };
    }
  };

  const getScoreColor = (score?: number | null) => {
    if (score === null || score === undefined) return "text-gray-600";
    if (score >= 80) return "text-red-700";
    if (score >= 60) return "text-orange-700";
    if (score >= 40) return "text-yellow-700";
    return "text-green-700";
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      <PlatformSidebar currentUser={currentUser} menuItems={menuItems} onLogout={logout} />
      <aside className="hidden w-72 bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-all duration-300">
            <div className="p-2.5 rounded-xl shadow-md group-hover:shadow-gray-400/50 transition-all duration-300" style={{ backgroundColor: "#08052e" }}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">TMA System</span>
            </div>
          </Link>
        </div>

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
                  <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-md relative z-10" style={{ backgroundColor: "#08052e" }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 my-6 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl text-white font-bold shadow-md flex items-center justify-center" style={{ backgroundColor: "#0f0745" }}>
                {avatarText || "US"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name ?? "Utilisateur"}</p>
                <p className="text-xs font-medium" style={{ color: "#0f0745" }}>{currentUser?.role ?? "User"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/users")}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: "#0f0745" }}
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto bg-[#f6f6f7]">
        <div className="p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="relative w-full max-w-md">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket, app, priorite"
                className="w-full rounded-xl border border-gray-200 bg-white pl-4 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="text-sm bg-transparent outline-none"
              >
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
                <option value="90d">90 jours</option>
                <option value="all">Tout</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
            >
              <option value="ALL">Tous statuts</option>
              <option value="NOUVEAU">Nouveau</option>
              <option value="EN_ANALYSE">En analyse</option>
              <option value="AFFECTE">Affecte</option>
              <option value="RESOLU">Resolue</option>
            </select>

            <button
              onClick={refreshTickets}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-[#1a1545] hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <section className="rounded-2xl bg-[#020331] text-white p-5 md:p-7 mb-5 overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-4 border-sky-100/50"></div>
            <div className="absolute right-20 bottom-4 w-14 h-14 rounded-full border-2 border-fuchsia-100/50"></div>
            <p className="text-sm text-sky-200 mb-2">Pilotage intelligent</p>
            <h1 className="text-3xl font-extrabold mb-3">Tickets admin</h1>
            <p className="text-sm text-slate-200 max-w-xl">
              Analysez, filtrez et supprimez les tickets critiques depuis un espace unifie.
            </p>
            <button
              onClick={reanalyzePending}
              disabled={reanalyzing}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 text-[#1a1545] text-sm font-semibold hover:bg-white disabled:opacity-60"
            >
              <Brain className={`w-4 h-4 ${reanalyzing ? "animate-spin" : ""}`} />
              Relancer IA en attente
            </button>
          </section>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 font-semibold">Total</p>
              <p className="text-2xl font-bold text-[#1a1545]">{counts.total}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 font-semibold">Nouveaux</p>
              <p className="text-2xl font-bold text-[#1a1545]">{counts.nouveau}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 font-semibold">En cours</p>
              <p className="text-2xl font-bold text-[#1a1545]">{counts.enCours}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 font-semibold">Resolus</p>
              <p className="text-2xl font-bold text-[#1a1545]">{counts.resolu}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 font-semibold">Sans score IA</p>
              <p className="text-2xl font-bold text-[#1a1545]">{counts.pendingScore}</p>
            </div>
          </div>

          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1a1545]">Dashboard priorité</h2>
              <span className="text-sm text-gray-500">Sur tickets filtrés</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              {priorityDashboard.map((item) => (
                <div key={item.key} className="rounded-xl border border-gray-200 p-4 bg-[#fafafe]">
                  <p className="text-xs text-gray-500 mb-2">Priorité {item.key}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.tone}`}>{item.label}</span>
                    <span className="text-lg font-bold text-[#1a1545]">{item.count}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.percent}% du total</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {priorityDashboard.map((item) => (
                <div key={`${item.key}-bar`}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{item.key} - {item.label}</span>
                    <span className="font-bold text-[#1a1545]">{item.percent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.key === "P1" ? "bg-red-400" : item.key === "P2" ? "bg-orange-400" : item.key === "P3" ? "bg-yellow-400" : "bg-green-400"}`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-[#1a1545]">Liste tickets</h2>

            <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                  viewMode === "cards" ? "text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                }`}
                style={viewMode === "cards" ? { backgroundColor: "#08052e" } : {}}
              >
                <Layout className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                  viewMode === "list" ? "text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                }`}
                style={viewMode === "list" ? { backgroundColor: "#08052e" } : {}}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600">Chargement des tickets...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Aucun ticket</h3>
                    <p className="text-gray-600 mt-2">Aucun ticket pour ces filtres.</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const priorityStyle = getPriorityStyles(ticket.priorite);
                    const statusStyle = getStatusStyles(ticket.statut);
                    const PriorityIcon = priorityStyle.Icon;

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => navigate(`/ticket-details/${ticket.id}`)}
                        className="group bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${priorityStyle.bg} ${priorityStyle.text}`}>
                            <span className="inline-flex items-center gap-1">
                              <PriorityIcon className="w-3.5 h-3.5" />
                              {ticket.priorite}
                            </span>
                          </span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#1a1545] mb-2 transition-colors line-clamp-2">{ticket.titre}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ticket.description || "Pas de description disponible."}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteTicket(ticket.id);
                              }}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/ticket-details/${ticket.id}`);
                              }}
                              className="text-sm font-semibold text-[#1a1545] hover:text-[#08052e] transition-all duration-200"
                            >
                              <span className="inline-flex items-center gap-1">
                                Details
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {viewMode === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#f8f8fb]">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Titre</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Priorite</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Statut</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Score</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Application</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-600">Chargement des tickets...</td>
                      </tr>
                    ) : filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-600">Aucun ticket trouve</td>
                      </tr>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const priorityStyle = getPriorityStyles(ticket.priorite);
                        const statusStyle = getStatusStyles(ticket.statut);
                        const PriorityIcon = priorityStyle.Icon;

                        return (
                          <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                            <td className="py-4 px-4">
                              <p className="text-gray-900 font-medium text-sm">{ticket.titre}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${priorityStyle.bg} ${priorityStyle.text}`}>
                                <span className="inline-flex items-center gap-1">
                                  <PriorityIcon className="w-3.5 h-3.5" />
                                  {ticket.priorite}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                                {statusStyle.label}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <p className={`text-sm font-bold ${getScoreColor(ticket.score_difficulte)}`}>
                                {ticket.score_difficulte !== null && ticket.score_difficulte !== undefined ? `${ticket.score_difficulte}/100` : "En attente"}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-600 text-sm">{ticket.application || "N/A"}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-600 text-sm">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => navigate(`/ticket-details/${ticket.id}`)}
                                  className="text-sm font-semibold text-[#1a1545] hover:text-[#08052e] transition-all duration-200"
                                >
                                  Voir
                                </button>
                                <button
                                  onClick={() => {
                                    void handleDeleteTicket(ticket.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
