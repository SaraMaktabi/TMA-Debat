import { useEffect, useState } from "react";
import { ticketAPI } from "../api/client";
import { Plus, Search, AlertCircle, Clock, User, FileText, Zap, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getSession } from "../utils/auth";

export default function Tickets() {
  const navigate = useNavigate();
  const session = getSession();
  const isAdminUser = session?.role === "Admin";

  // Data
  const [tickets, setTickets] = useState<any[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<"create" | "track">("track");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState("P3");
  const [environnement, setEnvironnement] = useState("PROD");
  const [application, setApplication] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prioriteOptions = [
    { value: "P1", label: "Critique - Intervention immédiate", color: "text-red-600" },
    { value: "P2", label: "Élevée - Priorité haute", color: "text-orange-600" },
    { value: "P3", label: "Normale - Traitement standard", color: "text-yellow-600" },
    { value: "P4", label: "Faible - Peut attendre", color: "text-green-600" }
  ];

  const environnementOptions = [
    { value: "PROD", label: "Impact direct utilisateurs", color: "text-red-600" },
    { value: "RECETTE", label: "Test avant production", color: "text-orange-600" },
    { value: "DEV", label: "Environnement de dev", color: "text-blue-600" }
  ];

  const applicationOptions = [
    "API Gateway",
    "Backend Service",
    "Frontend Web",
    "Base de données",
    "Mobile App",
    "Infrastructure",
    "Sécurité",
    "DevOps",
    "General"
  ];

  const fetchTickets = async () => {
    try {
      const data = await ticketAPI.list(isAdminUser ? undefined : { createdByUserId: session?.id });
      setTickets(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
      Swal.fire({ icon: "error", title: "Erreur!", text: "Impossible de charger les tickets", confirmButtonColor: "#001f3f" });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchTickets(), 10000);
    const handleFocus = () => fetchTickets();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const getUrgencyFromPriorite = (priorite: string): string => {
    switch (priorite) {
      case "P1": return "high";
      case "P2": return "high";
      case "P3": return "medium";
      case "P4": return "low";
      default: return "medium";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "OUVERT":
      case "NOUVEAU": return { label: "Ouvert", color: "bg-blue-100 text-blue-700" };
      case "EN_ANALYSE": return { label: "En analyse", color: "bg-yellow-100 text-yellow-700" };
      case "AFFECTE": return { label: "Affecté", color: "bg-green-100 text-green-700" };
      case "RESOLU": return { label: "Résolu", color: "bg-gray-100 text-gray-700" };
      default: return { label: statut, color: "bg-gray-100 text-gray-700" };
    }
  };

  const getPriorityClass = (urgency: string) => {
    if (urgency === "high") return "bg-red-100 text-red-700";
    if (urgency === "medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getPriorityLabel = (urgency: string) => {
    if (urgency === "high") return "Priorité haute";
    if (urgency === "medium") return "Priorité normale";
    return "Priorité faible";
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || !description.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Veuillez remplir tous les champs obligatoires", confirmButtonColor: "#001f3f" });
      setIsSubmitting(false);
      return;
    }

    const ticketData = {
      titre: title,
      description,
      priorite,
      environnement,
      application,
      created_by_user_id: session?.id,
    };

    try {
      const response = await ticketAPI.create(ticketData);

      Swal.fire({
        icon: "success",
        title: "Ticket créé avec succès!",
        html: `
          <div style="text-align: left;">
            <p><strong>ID:</strong> ${response.id}</p>
            <p><strong>Titre:</strong> ${title}</p>
            <p><strong>Priorité:</strong> ${prioriteOptions.find(p => p.value === priorite)?.label}</p>
            <p><strong>Environnement:</strong> ${environnementOptions.find(e => e.value === environnement)?.label}</p>
            <p><strong>Application:</strong> ${application}</p>
            <hr class="my-2">
            <p class="text-sm text-gray-600">L'analyse IA est en cours. Le score et les recommandations seront disponibles dans quelques secondes.</p>
          </div>
        `,
        confirmButtonColor: "#001f3f",
        confirmButtonText: "OK",
      });

      setTitle("");
      setDescription("");
      setPriorite("P3");
      setEnvironnement("PROD");
      setApplication("General");
      setActiveTab("track");

      setTimeout(() => fetchTickets(), 2000);
    } catch (error: any) {
      console.error("Erreur:", error);
      Swal.fire({ icon: "error", title: "Erreur!", text: error.response?.data?.detail || "Une erreur s'est produite lors de la création du ticket.", confirmButtonColor: "#001f3f" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filters
  const filteredTickets = tickets.filter((ticket) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm = !term || (
      (ticket.id && String(ticket.id).toLowerCase().includes(term)) ||
      (ticket.titre && String(ticket.titre).toLowerCase().includes(term)) ||
      (ticket.description && String(ticket.description).toLowerCase().includes(term))
    );

    const matchesStatus = !statusFilter || (ticket.statut && ticket.statut === statusFilter);
    const matchesPriority = !priorityFilter || (ticket.priorite && ticket.priorite === priorityFilter);

    return matchesTerm && matchesStatus && matchesPriority;
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => ["OUVERT", "NOUVEAU", "EN_ANALYSE"].includes(String(t.statut))).length;
  const resolvedTickets = tickets.filter((t) => String(t.statut) === "RESOLU").length;
  const displayName = session?.name?.split(" ")[0] || "Client";

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#f4f8ff_0%,#f8fbff_42%,#ffffff_100%)]">
      <div className="overflow-auto pb-10">
        <div className="max-w-7xl mx-auto px-4 pt-20 lg:pt-24">
          <section className="mb-6">
            <p className="text-sm text-[#35507f] mb-2 inline-flex items-center gap-2 font-semibold">
              <User size={15} /> Bonjour {displayName}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-[#f2f6ff] text-[#1f3b70] border border-[#dbe5f5] font-semibold">Total: {totalTickets}</span>
              <span className="px-3 py-1.5 rounded-full bg-[#f2f6ff] text-[#1f3b70] border border-[#dbe5f5] font-semibold">En cours: {openTickets}</span>
              <span className="px-3 py-1.5 rounded-full bg-[#f2f6ff] text-[#1f3b70] border border-[#dbe5f5] font-semibold">Résolus: {resolvedTickets}</span>
            </div>
          </section>

          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e4f8] bg-white p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab("create")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                  activeTab === "create"
                    ? "bg-[var(--edu-primary)] text-white shadow"
                    : "text-[#22325a] hover:bg-[#f2f7ff]"
                }`}
              >
                <Plus size={16} /> Nouveau ticket
              </button>
              <button
                onClick={() => setActiveTab("track")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                  activeTab === "track"
                    ? "bg-[var(--edu-primary)] text-white shadow"
                    : "text-[#22325a] hover:bg-[#f2f7ff]"
                }`}
              >
                <Search size={16} /> Suivre mes tickets
              </button>
            </div>
          </div>

          {activeTab === "create" && (
            <section className="max-w-3xl mx-auto ticket-card">
              <div className="card-header">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#25457a]">
                  <MessageCircle size={16} /> Création d'un ticket
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#122955] mt-2">Décrire un incident ou une demande</h2>
                <p className="text-sm text-gray-600 mt-1">Plus votre description est précise, plus les recommandations IA seront pertinentes.</p>
              </div>

              <div className="card-body">
                <form onSubmit={createTicket} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-2">
                      <FileText size={15} className="text-[#315da0]" /> Titre du problème *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl focus:ring-2 focus:ring-[#9ec5ff] focus:border-[#5b8ddd] outline-none transition"
                      placeholder="Ex: L'API retourne des erreurs 500"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 inline-flex items-center gap-2">
                        <AlertCircle size={15} className="text-[#315da0]" /> Priorité *
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl focus:ring-2 focus:ring-[#9ec5ff] outline-none"
                        value={priorite}
                        onChange={(e) => setPriorite(e.target.value)}
                        required
                      >
                        {prioriteOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Environnement *</label>
                      <select
                        className="w-full px-4 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl focus:ring-2 focus:ring-[#9ec5ff] outline-none"
                        value={environnement}
                        onChange={(e) => setEnvironnement(e.target.value)}
                        required
                      >
                        {environnementOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Application / Service concerné *</label>
                    <select
                      className="w-full px-4 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl focus:ring-2 focus:ring-[#9ec5ff] outline-none"
                      value={application}
                      onChange={(e) => setApplication(e.target.value)}
                      required
                    >
                      {applicationOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Description détaillée *</label>
                    <textarea
                      className="w-full px-4 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl focus:ring-2 focus:ring-[#9ec5ff] outline-none"
                      rows={5}
                      placeholder="Décrivez votre problème..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="rounded-xl bg-[#f0f7ff] border border-[#d6e9ff] p-4 flex gap-3">
                    <Zap size={19} className="text-[#0f4b8a] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#122955]">Analyse IA activée</p>
                      <p className="text-sm text-gray-600 mt-1">Le système évalue automatiquement la criticité et propose des recommandations de traitement.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="card-cta w-full bg-[var(--edu-primary)] hover:brightness-95 disabled:bg-gray-400 text-white py-3.5 px-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Zap size={17} /> {isSubmitting ? "Création en cours..." : "Créer le ticket"}
                  </button>
                </form>
              </div>
            </section>
          )}

          {activeTab === "track" && (
            <section className="space-y-5">
              <div className="ticket-card">
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-[1.1fr_auto_auto_auto] gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par ID, titre ou description..."
                        className="w-full pl-10 pr-4 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl text-sm"
                    >
                      <option value="">Tous statuts</option>
                      <option value="OUVERT">Ouvert</option>
                      <option value="EN_ANALYSE">En analyse</option>
                      <option value="AFFECTE">Affecté</option>
                      <option value="RESOLU">Résolu</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-3 py-3 bg-[#f7faff] border border-[#d8e4f8] rounded-xl text-sm"
                    >
                      <option value="">Toutes priorités</option>
                      <option value="P1">P1 - Critique</option>
                      <option value="P2">P2 - Élevée</option>
                      <option value="P3">P3 - Normale</option>
                      <option value="P4">P4 - Faible</option>
                    </select>

                    <button
                      onClick={() => {
                        setActiveTab("create");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-[var(--edu-primary)] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:brightness-95"
                    >
                      Créer
                    </button>
                  </div>
                </div>
              </div>

              {tickets.length === 0 ? (
                <div className="ticket-card">
                  <div className="card-body text-center py-12">
                    <div className="w-14 h-14 bg-[#eef4ff] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock size={28} className="text-[#4f6da8]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#142b57]">Aucun ticket pour le moment</h3>
                    <p className="text-gray-600 mt-2">Créez votre premier ticket pour démarrer le suivi.</p>
                  </div>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="ticket-card">
                  <div className="card-body text-center py-10">
                    <h3 className="text-xl font-bold text-[#142b57]">Aucun résultat</h3>
                    <p className="text-gray-600 mt-2">Aucun ticket ne correspond aux filtres actuels.</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("");
                        setPriorityFilter("");
                      }}
                      className="mt-4 px-4 py-2 bg-[#eef4ff] text-[#244a86] rounded-lg text-sm font-semibold"
                    >
                      Effacer les filtres
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {filteredTickets.map((ticket, index) => {
                    const ticketId = `TK-${String(index + 1).padStart(3, "0")}`;
                    const urgency = getUrgencyFromPriorite(ticket.priorite);
                    const status = getStatusLabel(ticket.statut);
                    const scoreValue = ticket.score ?? ticket.score_difficulte;

                    return (
                      <article key={ticket.id} className="ticket-card">
                        <div className="card-header">
                          <div className="flex items-center justify-between gap-3">
                            <span className="ticket-badge">{ticketId}</span>
                            <div className="flex items-center gap-2">
                              <span className={`ticket-chip ${status.color}`}>{status.label}</span>
                              <span className={`ticket-chip ${getPriorityClass(urgency)}`}>{getPriorityLabel(urgency)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-body">
                          <h3 className="text-lg font-bold text-[#122955] line-clamp-2">{ticket.titre}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed mt-2 line-clamp-3">{ticket.description}</p>

                          <div className="mt-4 pt-4 border-t border-[#e4ecfb] space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">Créé le</span>
                              <span className="text-[#1d3970] font-medium text-right">
                                {ticket.created_at
                                  ? new Date(ticket.created_at).toLocaleDateString("fr-FR") +
                                    " à " +
                                    new Date(ticket.created_at).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">Application</span>
                              <span className="text-[#1d3970] font-medium">{ticket.application || application}</span>
                            </div>
                            {scoreValue !== null && scoreValue !== undefined && (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-500">Score IA</span>
                                <span className="text-[#1d3970] font-bold">{scoreValue}/100</span>
                              </div>
                            )}
                          </div>

                          {ticket.analyse_nlp?.technologies?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-500 mb-2">Technologies détectées</p>
                              <div className="flex flex-wrap gap-2">
                                {ticket.analyse_nlp.technologies.map((tech: string, i: number) => (
                                  <span key={i} className="ticket-chip bg-[#edf3ff] text-[#335a98]">{tech}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 rounded-xl bg-[#f0f7ff] border border-[#d6e9ff] p-3 flex gap-2">
                            <Zap size={17} className="text-[#0f4b8a] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {ticket.priorite === "P1"
                                ? "Problème critique détecté: investigation immédiate recommandée."
                                : ticket.priorite === "P2"
                                  ? "Priorité élevée: vérifiez les changements récents et la configuration."
                                  : ticket.priorite === "P3"
                                    ? "Traitement standard: analyse automatique en cours."
                                    : "Priorité faible: planification de maintenance recommandée."}
                            </p>
                          </div>

                          <button
                            onClick={() => navigate(`/ticket/${ticket.id}`)}
                            className="card-cta w-full bg-[var(--edu-primary)] hover:brightness-95 text-white py-2.5 px-4 rounded-xl font-semibold transition inline-flex items-center justify-center gap-2 mt-4"
                          >
                            <Search size={15} /> Voir les détails
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
