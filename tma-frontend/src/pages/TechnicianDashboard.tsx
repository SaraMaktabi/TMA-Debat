import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import {
  Home,
  LayoutDashboard,
  ListChecks,
  RefreshCcw,
  ArrowRight,
  CheckCircle2,
  Wrench,
  ShieldAlert,
  CircleDot,
  ChartNoAxesCombined,
} from "lucide-react";
import PlatformSidebar from "../components/PlatformSidebar";
import { clearSession, getSession } from "../utils/auth";
import { ticketAPI } from "../api/client";

type TechnicianTicket = {
  id: string;
  titre: string;
  description?: string;
  priorite: "P1" | "P2" | "P3" | "P4" | string;
  statut: "OUVERT" | "EN_ANALYSE" | "AFFECTE" | "RESOLU" | string;
  score?: number | null;
  application?: string;
  created_at?: string | null;
  technicien_assigne_id?: string | null;
};

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const currentUser = getSession();
  const [tickets, setTickets] = useState<TechnicianTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const fetchAssignedTickets = async () => {
    if (!currentUser?.id) {
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      const all = await ticketAPI.list();
      const mine = (all || []).filter(
        (ticket: TechnicianTicket) => ticket.technicien_assigne_id === currentUser.id
      );
      setTickets(mine);
    } catch (error) {
      console.error("Error while loading technician dashboard", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: LayoutDashboard, label: "Dashboard Tech", href: "/tech/dashboard", badge: null },
    {
      icon: ListChecks,
      label: "Mes Tickets",
      href: "/tech/tickets",
      badge: tickets.length > 0 ? tickets.length.toString() : null,
    },
  ];

  const kpis = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter((t) => t.statut === "EN_ANALYSE" || t.statut === "AFFECTE").length;
    const resolved = tickets.filter((t) => t.statut === "RESOLU").length;
    const urgent = tickets.filter((t) => t.priorite === "P1" || t.priorite === "P2").length;

    return {
      total,
      inProgress,
      resolved,
      urgent,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }, [tickets]);

  const statusData = useMemo(
    () => [
      {
        label: "En cours",
        value: tickets.filter((t) => t.statut === "AFFECTE" || t.statut === "EN_ANALYSE").length,
      },
      { label: "Résolu", value: tickets.filter((t) => t.statut === "RESOLU").length },
      { label: "Ouvert", value: tickets.filter((t) => t.statut === "OUVERT").length },
    ],
    [tickets]
  );

  const priorityData = useMemo(
    () => [
      { priority: "P1", count: tickets.filter((t) => t.priorite === "P1").length },
      { priority: "P2", count: tickets.filter((t) => t.priorite === "P2").length },
      { priority: "P3", count: tickets.filter((t) => t.priorite === "P3").length },
      { priority: "P4", count: tickets.filter((t) => t.priorite === "P4").length },
    ],
    [tickets]
  );

  const statusChartOptions = useMemo((): AgChartOptions => {
    return {
      data: statusData,
      background: { fill: "transparent" },
      legend: { position: "bottom", item: { label: { color: "#1f2140" } } },
      series: [
        {
          type: "donut",
          angleKey: "value",
          calloutLabelKey: "label",
          innerRadiusRatio: 0.68,
          fills: ["#08052e", "#94a3ff", "#d7cdfb"],
          strokes: ["#ffffff"],
        },
      ],
      padding: { top: 12, right: 12, bottom: 12, left: 12 },
    };
  }, [statusData]);

  const priorityChartOptions = useMemo((): AgChartOptions => {
    return {
      data: priorityData,
      background: { fill: "transparent" },
      legend: { position: "bottom", item: { label: { color: "#1f2140" } } },
      series: [
        {
          type: "donut",
          angleKey: "count",
          calloutLabelKey: "priority",
          innerRadiusRatio: 0.66,
          fills: ["#0f0745", "#332b7d", "#8a7ad6", "#d7cdfb"],
          strokes: ["#ffffff"],
        },
      ],
      padding: { top: 12, right: 12, bottom: 12, left: 12 },
    };
  }, [priorityData]);

  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => {
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        })
        .slice(0, 4),
    [tickets]
  );

  return (
    <div className="min-h-screen w-full flex bg-white">
      <PlatformSidebar currentUser={currentUser} menuItems={menuItems} onLogout={logout} />

      <main className="flex-1 bg-[#f6f6f7] p-4 md:p-6">
        <section className="rounded-3xl bg-[linear-gradient(135deg,#08052e_0%,#1f1a5a_48%,#3f2f89_100%)] p-6 md:p-8 text-white relative overflow-hidden mb-5 shadow-[0_24px_55px_-35px_rgba(10,8,38,0.9)]">
          <div className="absolute -right-10 -top-8 w-44 h-44 rounded-full border border-white/20" />
          <div className="absolute right-16 bottom-3 w-20 h-20 rounded-full border border-white/20" />
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200 mb-2">Technician Space</p>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Pilotage de vos interventions</h1>
              <p className="text-indigo-100 max-w-2xl text-sm md:text-base">
                Suivez vos tickets affectés, visualisez la charge et avancez rapidement vers la résolution.
              </p>
            </div>
            <button
              onClick={fetchAssignedTickets}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-semibold"
            >
              <RefreshCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Tickets affectés</p>
            <p className="text-3xl font-black text-[#0f0745] mt-2">{kpis.total}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">En cours</p>
            <p className="text-3xl font-black text-[#0f0745] mt-2">{kpis.inProgress}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Résolus</p>
            <p className="text-3xl font-black text-[#0f0745] mt-2">{kpis.resolved}</p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Taux de résolution</p>
            <p className="text-3xl font-black text-[#0f0745] mt-2">{kpis.resolutionRate}%</p>
          </article>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 mb-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#1a1545] inline-flex items-center gap-2">
                <ChartNoAxesCombined className="w-5 h-5" />
                Répartition des statuts
              </h2>
            </div>
            <div className="h-64">
              <AgCharts options={statusChartOptions} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a1545] mb-2 inline-flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Distribution des priorités
            </h2>
            <div className="h-64">
              <AgCharts options={priorityChartOptions} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#1a1545] inline-flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Derniers tickets affectés
            </h2>
            <button
              onClick={() => navigate("/tech/tickets")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a1545]"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Chargement des tickets...
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Aucun ticket n'est encore affecté à votre profil.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                  className="text-left rounded-xl border border-gray-200 bg-[#fcfcff] p-4 hover:shadow-md transition"
                >
                  <p className="text-xs text-gray-500 mb-2">{ticket.priorite} • {ticket.application || "General"}</p>
                  <p className="font-bold text-[#1a1545] mb-1 line-clamp-2">{ticket.titre}</p>
                  <div className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#0f0745]">
                    <CircleDot className="w-3.5 h-3.5" />
                    {ticket.statut}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-xl bg-[#f7f5ff] border border-[#e4dcff] p-3 text-sm text-[#2c265a] inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Les changements de statut sont synchronisés avec les vues admin et client.
          </div>
        </section>
      </main>
    </div>
  );
}
