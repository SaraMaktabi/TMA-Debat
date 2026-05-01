import { useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  AlertCircle,
  Settings,
  Search,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Sparkles,
  UsersIcon,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import { ticketAPI, userAPI } from "../api/client";
import { clearSession, getSession } from "../utils/auth";
import PlatformSidebar from "../components/PlatformSidebar";

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
};

type TimeFilter = "7d" | "30d" | "90d" | "all";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getSession();

  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [searchTerm, setSearchTerm] = useState("");

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: BarChart3, label: "Tableau de Bord", href: "/dashboard", badge: null },
    { icon: AlertCircle, label: "Tickets Admin", href: "/admin-tickets", badge: tickets.length > 0 ? tickets.length.toString() : null },
    { icon: UsersIcon, label: "Utilisateurs", href: "/users", badge: usersCount > 0 ? usersCount.toString() : null },
    { icon: Settings, label: "Parametres", href: "#", badge: null },
  ];

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

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const periodOk = isInPeriod(ticket.created_at, timeFilter);
      const searchOk =
        query.length === 0 ||
        ticket.titre?.toLowerCase().includes(query) ||
        ticket.application?.toLowerCase().includes(query) ||
        ticket.priorite?.toLowerCase().includes(query);
      return periodOk && searchOk;
    });
  }, [tickets, timeFilter, searchTerm]);

  const kpis = useMemo(() => {
    const total = filteredTickets.length;
    const resolved = filteredTickets.filter((t) => t.statut === "RESOLU").length;
    const inProgress = filteredTickets.filter((t) => t.statut === "EN_ANALYSE" || t.statut === "AFFECTE").length;
    const critical = filteredTickets.filter((t) => t.priorite === "P1" || t.priorite === "P2").length;
    const pendingAI = filteredTickets.filter((t) => t.score_difficulte === null || t.score_difficulte === undefined).length;

    return {
      total,
      resolved,
      inProgress,
      critical,
      pendingAI,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }, [filteredTickets]);

  const trendData = useMemo(() => {
    const days = 7;
    const today = new Date();
    return Array.from({ length: days }).map((_, idx) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (days - idx - 1));
      const key = day.toISOString().slice(0, 10);
      const label = day.toLocaleDateString("fr-FR", { weekday: "short" });
      const count = filteredTickets.filter((ticket) => {
        if (!ticket.created_at) return false;
        return new Date(ticket.created_at).toISOString().slice(0, 10) === key;
      }).length;
      return { day: label, tickets: count };
    });
  }, [filteredTickets]);

  const trendChartOptions = useMemo((): AgChartOptions => {
    return {
      data: trendData,
      background: { fill: "transparent" },
      series: [
        {
          type: "line",
          xKey: "day",
          yKey: "tickets",
          stroke: "#7dd3fc",
          strokeWidth: 3,
          marker: { enabled: true, fill: "#dbeafe", stroke: "#0f172a", size: 6 },
        },
      ],
      legend: { enabled: false },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
    };
  }, [trendData]);

  const topTickets = useMemo(() => {
    return [...filteredTickets]
      .sort((a, b) => {
        const rank = (p: string) => (p === "P1" ? 4 : p === "P2" ? 3 : p === "P3" ? 2 : 1);
        const diff = rank(b.priorite) - rank(a.priorite);
        if (diff !== 0) return diff;
        return Number(b.score_difficulte || 0) - Number(a.score_difficulte || 0);
      })
      .slice(0, 4);
  }, [filteredTickets]);

  const appDistribution = useMemo(() => {
    const map = new Map<string, number>();
    filteredTickets.forEach((ticket) => {
      const app = ticket.application?.trim() || "General";
      map.set(app, (map.get(app) || 0) + 1);
    });
    const values = Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const max = values[0]?.count || 1;
    return values.map((item) => ({ ...item, percent: Math.round((item.count / max) * 100) }));
  }, [filteredTickets]);

  return (
    <div className="min-h-screen w-full flex bg-white">
      <PlatformSidebar currentUser={currentUser} menuItems={menuItems} onLogout={logout} />
      <div className="grid min-h-screen flex-1 grid-cols-1 xl:grid-cols-[1fr_310px] gap-0">
            <main className="bg-[#f6f6f7] p-4 md:p-6 min-h-screen">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ticket, app, priorite"
                    className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="7d">7 jours</option>
                  <option value="30d">30 jours</option>
                  <option value="90d">90 jours</option>
                  <option value="all">Tout</option>
                </select>
              </div>

              <section className="rounded-2xl bg-[#020331] text-white p-5 md:p-7 mb-5 overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-4 border-sky-100/50"></div>
                <div className="absolute right-20 bottom-4 w-14 h-14 rounded-full border-2 border-fuchsia-100/50"></div>
                <p className="text-sm text-sky-200 mb-2">Pilotage intelligent</p>
                <h1 className="text-3xl font-extrabold mb-3">Vue globale Thinkgrid</h1>
                <p className="text-sm text-slate-200 max-w-xl">
                  Supervisez vos tickets, l'activite equipe et les priorites critiques en un seul espace.
                </p>
              </section>

              <section className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-[#1a1545]">Tickets critiques</h2>
                  <button onClick={() => navigate("/admin-tickets")} className="text-sm font-semibold text-[#1a1545] inline-flex items-center gap-1">
                    Voir plus
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {topTickets.length === 0 ? (
                    <div className="md:col-span-3 rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-600">
                      Aucun ticket sur ce filtre.
                    </div>
                  ) : (
                    topTickets.slice(0, 3).map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => navigate(`/ticket-details/${ticket.id}`)}
                        className="text-left rounded-xl bg-white border border-gray-200 p-4 hover:shadow-md transition"
                      >
                        <p className="text-xs text-gray-500 mb-2">{ticket.priorite} • {ticket.application || "General"}</p>
                        <p className="font-bold text-[#1a1545] line-clamp-2 mb-2">{ticket.titre}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{ticket.description || "Pas de description"}</p>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-[#1a1545]">Timing & progress</h2>
                  <button onClick={() => fetchDashboardData()} className="text-sm font-semibold text-[#1a1545] inline-flex items-center gap-1">
                    Refresh
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white border border-gray-200 p-3">
                    <div className="h-44">
                      <AgCharts options={trendChartOptions} />
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-4">
                    {appDistribution.length === 0 ? (
                      <p className="text-sm text-gray-600">Aucune repartition disponible.</p>
                    ) : (
                      appDistribution.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <p className="font-semibold text-gray-800">{item.label}</p>
                            <p className="font-bold text-[#1a1545]">{item.count}</p>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-cyan-200" style={{ width: `${item.percent}%` }}></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </main>

            <aside className="bg-[#f7f7f8] border-l border-gray-200 p-4 md:p-5 min-h-screen">
              <div className="flex items-center justify-between mb-6">
                <button className="p-2 rounded-lg hover:bg-white">
                  <Bell className="w-4 h-4 text-[#1a1545]" />
                </button>
                <div className="flex items-center gap-2 bg-white rounded-full px-2.5 py-1.5 border border-gray-200">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#08052e" }}>
                    {avatarText || "AD"}
                  </div>
                  <span className="text-sm font-semibold text-[#1a1545]">{currentUser?.name || "Admin"}</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-[#1a1545]">System overview</h3>
                  <span className="text-sm text-gray-500">Live</span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl bg-white border border-gray-200 p-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-bold text-[#1a1545]">Resolus</p>
                        <p className="text-xs text-gray-500">Tickets fermes</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1a1545]">{kpis.resolved}</span>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-bold text-[#1a1545]">En cours</p>
                        <p className="text-xs text-gray-500">Analyse + affectation</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1a1545]">{kpis.inProgress}</span>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <div>
                        <p className="font-bold text-[#1a1545]">Critiques</p>
                        <p className="text-xs text-gray-500">P1 + P2</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1a1545]">{kpis.critical}</span>
                  </div>

                  <div className="rounded-xl bg-white border border-gray-200 p-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-bold text-[#1a1545]">Equipe active</p>
                        <p className="text-xs text-gray-500">Utilisateurs connectables</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#1a1545]">{activeUsersCount}/{usersCount}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#050626] text-white p-4 relative overflow-hidden">
                <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full border-4 border-sky-100/40"></div>
                <div className="absolute right-3 top-3 w-3 h-3 bg-white/80 rounded-full"></div>
                <p className="text-xs text-sky-200 mb-1">Action rapide</p>
                <p className="font-bold text-lg mb-2">Tickets admin</p>
                <p className="text-xs text-slate-200 mb-4">Accedez aux details, debat IA et decisions d'affectation.</p>
                <button
                  onClick={() => navigate("/admin-tickets")}
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                >
                  Ouvrir
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-white border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  AI insight
                </p>
                <p className="text-sm font-semibold text-[#1a1545]">
                  {kpis.pendingAI > 0
                    ? `${kpis.pendingAI} tickets attendent encore un score IA.`
                    : "Tous les tickets recents ont deja un score IA."}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-white border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1 inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
                  Taux de resolution
                </p>
                <p className="text-sm font-semibold text-[#1a1545]">{kpis.resolutionRate}% sur la periode selectionnee</p>
              </div>

              <button
                onClick={() => navigate("/users")}
                className="mt-4 w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm font-semibold text-[#1a1545] hover:bg-gray-50 transition"
              >
                Gérer les utilisateurs
              </button>
            </aside>
      </div>
    </div>
  );
}
