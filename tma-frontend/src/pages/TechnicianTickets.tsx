import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Search,
  ArrowRight,
  RefreshCcw,
  CircleCheckBig,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import PlatformSidebar from "../components/PlatformSidebar";
import { clearSession, getSession } from "../utils/auth";
import { ticketAPI } from "../api/client";

type TechStatus = "OUVERT" | "AFFECTE" | "EN_ANALYSE" | "RESOLU";

type TechnicianTicket = {
  id: string;
  titre: string;
  description?: string;
  priorite: "P1" | "P2" | "P3" | "P4" | string;
  statut: TechStatus | string;
  application?: string;
  environnement?: string;
  created_at?: string | null;
  technicien_assigne_id?: string | null;
};

const statusMeta: Record<string, { label: string; classes: string }> = {
  OUVERT: { label: "Ouvert", classes: "bg-blue-100 text-blue-700" },
  AFFECTE: { label: "Affecté", classes: "bg-indigo-100 text-indigo-700" },
  EN_ANALYSE: { label: "En analyse", classes: "bg-amber-100 text-amber-700" },
  RESOLU: { label: "Résolu", classes: "bg-emerald-100 text-emerald-700" },
};

export default function TechnicianTickets() {
  const navigate = useNavigate();
  const currentUser = getSession();
  const [tickets, setTickets] = useState<TechnicianTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TechStatus>("ALL");

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/", badge: null },
    { icon: LayoutDashboard, label: "Dashboard Tech", href: "/tech/dashboard", badge: null },
    { icon: ListChecks, label: "Mes Tickets", href: "/tech/tickets", badge: tickets.length > 0 ? tickets.length.toString() : null },
  ];

  const fetchTickets = async () => {
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
      console.error("Error loading technician tickets", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const statusOk = statusFilter === "ALL" || ticket.statut === statusFilter;
      const searchOk =
        query.length === 0 ||
        ticket.titre?.toLowerCase().includes(query) ||
        ticket.application?.toLowerCase().includes(query) ||
        ticket.priorite?.toLowerCase().includes(query);
      return statusOk && searchOk;
    });
  }, [tickets, search, statusFilter]);

  const handleStatusChange = async (ticketId: string, nextStatus: "EN_ANALYSE" | "RESOLU") => {
    if (!currentUser?.id || !currentUser.role) return;

    setUpdatingId(ticketId);
    try {
      const result = await ticketAPI.updateStatus(ticketId, nextStatus, {
        requesterRole: currentUser.role,
        requesterUserId: currentUser.id,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, statut: result.statut as TechStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating status", error);
      window.alert("Impossible de mettre à jour le statut pour le moment.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      <PlatformSidebar currentUser={currentUser} menuItems={menuItems} onLogout={logout} />

      <main className="flex-1 bg-[#f6f6f7] p-4 md:p-6">
        <section className="rounded-3xl bg-[linear-gradient(135deg,#08052e_0%,#1f1a5a_48%,#3f2f89_100%)] p-6 text-white mb-5 shadow-[0_22px_52px_-34px_rgba(10,8,38,0.9)]">
          <h1 className="text-3xl font-black mb-2">Mes tickets affectés</h1>
          <p className="text-indigo-100 text-sm md:text-base">
            Gérez vos interventions et changez le statut en temps réel pour synchroniser l'admin et le client.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre, app, priorité"
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | TechStatus)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="AFFECTE">Affecté</option>
              <option value="EN_ANALYSE">En analyse</option>
              <option value="RESOLU">Résolu</option>
            </select>

            <button
              onClick={fetchTickets}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1545]"
            >
              <RefreshCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="lg:col-span-2 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-gray-500 text-sm">
              Chargement des tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="lg:col-span-2 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-gray-500 text-sm">
              Aucun ticket trouvé selon ce filtre.
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const meta = statusMeta[ticket.statut] || { label: ticket.statut, classes: "bg-gray-100 text-gray-700" };
              const isCritical = ticket.priorite === "P1" || ticket.priorite === "P2";

              return (
                <article key={ticket.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{ticket.priorite} • {ticket.application || "General"}</p>
                      <h2 className="text-lg font-bold text-[#1a1545] line-clamp-2">{ticket.titre}</h2>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.classes}`}>
                      {meta.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{ticket.description || "Aucune description disponible."}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                    {isCritical ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock3 className="w-4 h-4" />}
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString("fr-FR") : "Date inconnue"}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <select
                      disabled={updatingId === ticket.id || ticket.statut === "RESOLU"}
                      defaultValue={ticket.statut === "RESOLU" ? "RESOLU" : "EN_ANALYSE"}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value as "EN_ANALYSE" | "RESOLU")}
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm disabled:bg-gray-100"
                    >
                      <option value="EN_ANALYSE">Passer en analyse</option>
                      <option value="RESOLU">Marquer comme résolu</option>
                    </select>

                    <button
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#0f0745] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Détails
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {ticket.statut === "RESOLU" && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CircleCheckBig className="w-3.5 h-3.5" />
                      Ce ticket est résolu et synchronisé.
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
