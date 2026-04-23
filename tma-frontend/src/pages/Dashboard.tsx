import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  BarChart3,
  UsersIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Home,
  Settings,
  LogOut,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Activity,
  Filter,
  RefreshCcw,
  ShieldAlert,
  Target,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import { ticketAPI, userAPI } from "../api/client";
import { clearSession, getSession } from "../utils/auth";

type DashboardTicket = {
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

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getSession();
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const avatarText = (currentUser?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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

  const formatStatusLabel = (status: string) => {
    if (status === "NOUVEAU") return "Nouveau";
    if (status === "EN_ANALYSE") return "En analyse";
    if (status === "AFFECTE") return "Affecte";
    if (status === "RESOLU") return "Resolue";
    return status;
  };

  const fetchDashboardData = async () => {
    try {
      const [ticketsRes, usersRes] = await Promise.all([ticketAPI.list(), userAPI.list()]);

      const normalized = (ticketsRes || []).map((t: DashboardTicket) => ({
        ...t,
        score_difficulte: t?.score_difficulte ?? t?.score,
      }));

      setTickets(normalized);
      setUsersCount((usersRes || []).length);
      setActiveUsersCount((usersRes || []).filter((u) => u.status === "Active").length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setTickets([]);
      setUsersCount(0);
      setActiveUsersCount(0);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const periodOk = isInPeriod(ticket.created_at, timeFilter);
      const statusOk = statusFilter === "ALL" || ticket.statut === statusFilter;
      const query = searchTerm.trim().toLowerCase();
      const searchOk =
        query.length === 0 ||
        ticket.titre?.toLowerCase().includes(query) ||
        ticket.application?.toLowerCase().includes(query) ||
        ticket.priorite?.toLowerCase().includes(query);
      return periodOk && statusOk && searchOk;
    });
  }, [tickets, timeFilter, statusFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    const counts = {
      NOUVEAU: 0,
      EN_ANALYSE: 0,
      AFFECTE: 0,
      RESOLU: 0,
    };
    filteredTickets.forEach((ticket) => {
      if (ticket.statut in counts) {
        counts[ticket.statut as keyof typeof counts] += 1;
      }
    });
    return counts;
  }, [filteredTickets]);

  const kpiValues = useMemo(() => {
    const total = filteredTickets.length;
    const resolved = statusCounts.RESOLU;
    const inProgress = statusCounts.EN_ANALYSE + statusCounts.AFFECTE;
    const pendingAnalysis = filteredTickets.filter((t) => t.score_difficulte === null || t.score_difficulte === undefined).length;
    const highPriority = filteredTickets.filter((t) => t.priorite === "P1" || t.priorite === "P2").length;
    const scored = filteredTickets.filter((t) => t.score_difficulte !== null && t.score_difficulte !== undefined);
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((acc, cur) => acc + Number(cur.score_difficulte || 0), 0) / scored.length) : 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      resolved,
      inProgress,
      pendingAnalysis,
      highPriority,
      avgScore,
      resolutionRate,
    };
  }, [filteredTickets, statusCounts]);

  const stats = [
    {
      label: "Tickets Totaux",
      value: kpiValues.total.toString(),
      icon: BarChart3,
      textColor: "text-blue-700",
      bgClass: "from-blue-50 to-cyan-50 border-blue-100",
      helper: "Volume filtre",
    },
    {
      label: "Nouveaux",
      value: statusCounts.NOUVEAU.toString(),
      icon: AlertCircle,
      textColor: "text-amber-700",
      bgClass: "from-amber-50 to-yellow-50 border-amber-100",
      helper: "A traiter",
    },
    {
      label: "En Cours",
      value: kpiValues.inProgress.toString(),
      icon: Clock,
      textColor: "text-orange-700",
      bgClass: "from-orange-50 to-red-50 border-orange-100",
      helper: "Analyse et affectation",
    },
    {
      label: "Resolus",
      value: kpiValues.resolved.toString(),
      icon: CheckCircle,
      textColor: "text-emerald-700",
      bgClass: "from-emerald-50 to-teal-50 border-emerald-100",
      helper: `${kpiValues.resolutionRate}% taux de resolution`,
    },
    {
      label: "Priorite Haute",
      value: kpiValues.highPriority.toString(),
      icon: ShieldAlert,
      textColor: "text-rose-700",
      bgClass: "from-rose-50 to-pink-50 border-rose-100",
      helper: "P1 + P2",
    },
    {
      label: "Score Moyen",
      value: `${kpiValues.avgScore}/100`,
      icon: Target,
      textColor: "text-violet-700",
      bgClass: "from-violet-50 to-indigo-50 border-violet-100",
      helper: "Complexite moyenne",
    },
  ];

  const statusChartData = [
    { name: "Nouveau", value: statusCounts.NOUVEAU, color: "#2563eb" },
    { name: "En analyse", value: statusCounts.EN_ANALYSE, color: "#f59e0b" },
    { name: "Affecte", value: statusCounts.AFFECTE, color: "#7c3aed" },
    { name: "Resolue", value: statusCounts.RESOLU, color: "#10b981" },
  ];

  const priorityChartData = [
    { name: "P1", value: filteredTickets.filter((t) => t.priorite === "P1").length, color: "#ef4444" },
    { name: "P2", value: filteredTickets.filter((t) => t.priorite === "P2").length, color: "#f97316" },
    { name: "P3", value: filteredTickets.filter((t) => t.priorite === "P3").length, color: "#eab308" },
    { name: "P4", value: filteredTickets.filter((t) => t.priorite === "P4").length, color: "#22c55e" },
  ];

  const trendData = useMemo(() => {
    const days = 7;
    const today = new Date();
    const items = Array.from({ length: days }).map((_, idx) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (days - idx - 1));
      const key = day.toISOString().slice(0, 10);
      const label = day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const count = filteredTickets.filter((ticket) => {
        if (!ticket.created_at) return false;
        const ticketDay = new Date(ticket.created_at).toISOString().slice(0, 10);
        return ticketDay === key;
      }).length;
      return { label, tickets: count };
    });
    return items;
  }, [filteredTickets]);

  const topApps = useMemo(() => {
    const appMap = new Map<string, number>();
    filteredTickets.forEach((ticket) => {
      const appName = ticket.application?.trim() || "Non renseignee";
      appMap.set(appName, (appMap.get(appName) || 0) + 1);
    });
    return Array.from(appMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredTickets]);

  const criticalTickets = useMemo(() => {
    return [...filteredTickets]
      .sort((a, b) => {
        const p = (x: string) => (x === "P1" ? 4 : x === "P2" ? 3 : x === "P3" ? 2 : 1);
        const priorityGap = p(b.priorite) - p(a.priorite);
        if (priorityGap !== 0) return priorityGap;
        return Number(b.score_difficulte || 0) - Number(a.score_difficulte || 0);
      })
      .slice(0, 4);
  }, [filteredTickets]);

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: BarChart3, label: "Tableau de Bord", href: "/dashboard", badge: null },
    { icon: AlertCircle, label: "Tickets Admin", href: "/admin-tickets", badge: tickets.length > 0 ? tickets.length.toString() : null },
    { icon: UsersIcon, label: "Utilisateurs", href: "/users", badge: usersCount > 0 ? usersCount.toString() : null },
    { icon: Settings, label: "Parametres", href: "#", badge: null },
  ];

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

  const chartPalette = {
    fills: ["#0ea5e9", "#16a34a", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"],
    strokes: ["#0369a1", "#15803d", "#d97706", "#6d28d9", "#b91c1c", "#0f766e"],
  };

  const trendChartOptions = useMemo((): AgChartOptions => {
    return {
      data: trendData,
      background: { fill: "transparent" },
      padding: { top: 16, right: 16, bottom: 18, left: 8 },
      theme: { palette: chartPalette },
      series: [
        {
          type: "area",
          xKey: "label",
          yKey: "tickets",
          yName: "Tickets",
          fillOpacity: 0.2,
          strokeWidth: 3,
          marker: {
            enabled: true,
            size: 6,
            fill: "#0ea5e9",
            stroke: "#0369a1",
            strokeWidth: 1,
          },
        },
      ],
      axes: [
        {
          type: "category",
          position: "bottom",
          label: { color: "#475569", fontSize: 11 },
        },
        {
          type: "number",
          position: "left",
          min: 0,
          nice: true,
          label: { color: "#475569", fontSize: 11 },
          gridLine: { style: [{ stroke: "#e2e8f0", lineDash: [5, 4] }] },
        },
      ],
      legend: { enabled: false },
    };
  }, [trendData]);

  const priorityChartOptions = useMemo((): AgChartOptions => {
    return {
      data: priorityChartData.filter((item) => item.value > 0),
      background: { fill: "transparent" },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      theme: {
        palette: {
          fills: ["#dc2626", "#f97316", "#f59e0b", "#16a34a"],
          strokes: ["#991b1b", "#c2410c", "#b45309", "#166534"],
        },
      },
      series: [
        {
          type: "donut",
          angleKey: "value",
          calloutLabelKey: "name",
          sectorLabelKey: "value",
          innerRadiusRatio: 0.62,
          strokeWidth: 2,
        },
      ],
      legend: { enabled: false },
    };
  }, [priorityChartData]);

  const statusChartOptions = useMemo((): AgChartOptions => {
    return {
      data: statusChartData,
      background: { fill: "transparent" },
      padding: { top: 12, right: 18, bottom: 18, left: 8 },
      theme: {
        palette: {
          fills: ["#0284c7", "#d97706", "#7c3aed", "#16a34a"],
          strokes: ["#0c4a6e", "#92400e", "#5b21b6", "#14532d"],
        },
      },
      series: [
        {
          type: "bar",
          xKey: "name",
          yKey: "value",
          yName: "Tickets",
          cornerRadius: 8,
        },
      ],
      axes: [
        {
          type: "category",
          position: "bottom",
          label: { color: "#475569", fontSize: 11 },
        },
        {
          type: "number",
          position: "left",
          min: 0,
          nice: true,
          label: { color: "#475569", fontSize: 11 },
          gridLine: { style: [{ stroke: "#e2e8f0", lineDash: [5, 4] }] },
        },
      ],
      legend: { enabled: false },
    };
  }, [statusChartData]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
      <aside className="w-72 bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto">
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

        <div className="mx-4 my-6 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl text-white font-bold shadow-md flex items-center justify-center" style={{backgroundColor: '#0f0745'}}>
                {avatarText || "US"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name ?? "Utilisateur"}</p>
                <p className="text-xs font-medium" style={{color: '#0f0745'}}>{currentUser?.role ?? "User"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/users")}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90"
                style={{backgroundColor: '#0f0745'}}
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

      <div className="flex-1 overflow-auto">
        <nav className="border-b border-gray-200 bg-white/60 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de Bord
              </h1>
              <p className="text-sm text-gray-600 mt-1">Pilotage admin en temps reel</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Rafraichir
              </button>
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

        <div className="px-8 py-8">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-lg text-gray-700 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Vue d'ensemble complete du systeme TMA
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher ticket, app, priorite..."
                  className="w-72 max-w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white">
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
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
              >
                <option value="ALL">Tous statuts</option>
                <option value="NOUVEAU">Nouveau</option>
                <option value="EN_ANALYSE">En analyse</option>
                <option value="AFFECTE">Affecte</option>
                <option value="RESOLU">Resolue</option>
              </select>
            </div>
          </div>

          {kpiValues.highPriority > 0 && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100">
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-900">Attention operationnelle</p>
                  <p className="text-sm text-rose-700">{kpiValues.highPriority} tickets critiques demandent une priorisation.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchTerm("P1");
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
              >
                Voir les critiques
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`group bg-gradient-to-br ${stat.bgClass} rounded-2xl p-5 border hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
                    <div className="p-2.5 bg-white rounded-xl shadow-sm">
                      <Icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs text-gray-600">{stat.helper}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Flux des tickets (7 derniers jours)
                </h3>
              </div>
              <div className="h-72">
                <AgCharts options={trendChartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 inline-flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-600" />
                Repartition par priorite
              </h3>
              <div className="h-72">
                <AgCharts options={priorityChartOptions} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {priorityChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-700">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Repartition par statut</h3>
              <div className="h-64">
                <AgCharts options={statusChartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Insights pro</h3>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                  <p className="font-semibold text-blue-900">Equipe</p>
                  <p className="text-blue-700">{activeUsersCount}/{usersCount} utilisateurs actifs.</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="font-semibold text-amber-900">Analyse IA</p>
                  <p className="text-amber-700">{kpiValues.pendingAnalysis} tickets sans score final.</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <p className="font-semibold text-emerald-900">Performance</p>
                  <p className="text-emerald-700">{kpiValues.resolutionRate}% de tickets resolus.</p>
                </div>
                <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                  <p className="font-semibold text-violet-900">Recommendation</p>
                  <p className="text-violet-700">
                    {kpiValues.highPriority > 0
                      ? "Renforcer le staffing sur incidents P1/P2 cette semaine."
                      : "Niveau de criticite stable, garder le rythme actuel."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Applications les plus impactees</h3>
              {topApps.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune application sur le filtre courant.</p>
              ) : (
                <div className="space-y-3">
                  {topApps.map((app, index) => {
                    const max = topApps[0]?.count || 1;
                    const percent = Math.round((app.count / max) * 100);
                    return (
                      <div key={app.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <p className="font-semibold text-gray-800">{index + 1}. {app.name}</p>
                          <p className="text-gray-600">{app.count} tickets</p>
                        </div>
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top tickets critiques</h3>
              {criticalTickets.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun ticket pour le filtre courant.</p>
              ) : (
                <div className="space-y-3">
                  {criticalTickets.map((ticket) => {
                    const statusStyle = getStatusStyles(ticket.statut);
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => navigate(`/ticket-details/${ticket.id}`)}
                        className="w-full text-left rounded-xl border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{ticket.titre}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{ticket.application || "Application non renseignee"}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusStyle.bg} ${statusStyle.text}`}>
                            {formatStatusLabel(ticket.statut)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                          <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold">{ticket.priorite}</span>
                          <span>Score: {ticket.score_difficulte ?? "N/A"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyse detaillee des tickets</h3>
                <p className="text-sm text-gray-600 max-w-2xl">
                  Les cards et la vue liste des tickets ont ete deplacees dans une page dediee pour faciliter
                  l'analyse admin sans surcharger le dashboard KPI/charts.
                </p>
              </div>
              <button
                onClick={() => navigate("/admin-tickets")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90"
                style={{ backgroundColor: "#08052e" }}
              >
                Ouvrir la page Tickets Admin
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Dashboard TMA - Pilotage intelligent des tickets et de l'equipe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}