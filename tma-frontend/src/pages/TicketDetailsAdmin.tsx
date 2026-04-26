import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader, Zap, TrendingUp, Clock, Tag, MessageCircle, BarChart3, UsersIcon, Home, CheckCircle, Copy, AlertTriangle, Shield, Database, Cpu, Activity, FileText, Target, Award, UserCircle2, Mail, Phone, Building2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { ticketAPI, userAPI, type UserDto } from "../api/client";
import { clearSession, getSession } from "../utils/auth";
import PlatformSidebar from "../components/PlatformSidebar";

interface Ticket {
  id: string;
  titre: string;
  description: string;
  priorite: string;
  statut: string;
  score?: number;
  score_difficulte?: number;
  facteurs?: string[];
  facteurs_score?: string[];
  analyse_nlp?: {
    technologies: string[];
    type_incident: string;
    systemes_impactes: string[];
    urgence_percue: string;
  };
  environnement: string;
  application: string;
  technicien_assigne_id?: string | null;
  created_by_user_id?: string | null;
  created_at?: string;
}

interface Recommendation {
  id: string;
  nom: string;
  email: string;
  competences?: Record<string, number>;
  score_compatibilite: number;
  raisons?: string[];
  top_competences?: string[];
}

export default function TicketDetailsAdmin() {
  const { id: ticketId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getSession();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [ticketClient, setTicketClient] = useState<UserDto | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [assigningTechnicianId, setAssigningTechnicianId] = useState<string | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const normalizeTicket = (data: any): Ticket => ({
    ...data,
    score_difficulte: data?.score_difficulte ?? data?.score,
    facteurs_score: data?.facteurs_score ?? data?.facteurs,
  });

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      try {
        const data = await ticketAPI.getById(ticketId);
        setTicket(normalizeTicket(data));
        setError(null);
      } catch (err: any) {
        console.error("Erreur:", err);
        setError("Impossible de charger le ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    // Polling automatique pour garder le statut et les infos synchro avec le backend
    const interval = setInterval(async () => {
      try {
        const data = await ticketAPI.getById(ticketId);
        const normalized = normalizeTicket(data);
        setTicket(normalized);
      } catch (err) {
        console.error("Erreur polling:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId || !ticket) return;

    const fetchRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        const data = await ticketAPI.getRecommendations(ticketId);
        setRecommendations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur recommandations:", err);
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [ticketId, ticket?.analyse_nlp, ticket?.score_difficulte]);

  useEffect(() => {
    if (!ticket?.created_by_user_id) {
      setTicketClient(null);
      return;
    }

    const fetchClient = async () => {
      try {
        setClientLoading(true);
        const users = await userAPI.list();
        const found = users.find((user) => user.id === ticket.created_by_user_id) || null;
        setTicketClient(found);
      } catch (err) {
        console.error("Erreur chargement client ticket:", err);
        setTicketClient(null);
      } finally {
        setClientLoading(false);
      }
    };

    fetchClient();
  }, [ticket?.created_by_user_id]);

  const getPriorityStyles = (priorite: string) => {
    switch (priorite) {
      case "P1": return { bg: "bg-red-100", text: "text-red-700", label: "CRITIQUE", Icon: AlertTriangle };
      case "P2": return { bg: "bg-orange-100", text: "text-orange-700", label: "HAUTE", Icon: AlertCircle };
      case "P3": return { bg: "bg-yellow-100", text: "text-yellow-700", label: "NORMAL", Icon: AlertCircle };
      case "P4": return { bg: "bg-green-100", text: "text-green-700", label: "FAIBLE", Icon: CheckCircle };
      default: return { bg: "bg-gray-100", text: "text-gray-700", label: "INCONNUE", Icon: AlertCircle };
    }
  };

  const getStatusStyles = (statut: string) => {
    switch (statut) {
      case "OUVERT":
      case "NOUVEAU": return { bg: "bg-blue-100", text: "text-blue-700", label: "OUVERT", Icon: Tag };
      case "EN_ANALYSE": return { bg: "bg-yellow-100", text: "text-yellow-700", label: "EN ANALYSE", Icon: Activity };
      case "AFFECTE": return { bg: "bg-purple-100", text: "text-purple-700", label: "AFFECTÉ", Icon: UsersIcon };
      case "RESOLU": return { bg: "bg-green-100", text: "text-green-700", label: "RÉSOLU", Icon: CheckCircle };
      default: return { bg: "bg-gray-100", text: "text-gray-700", label: statut, Icon: AlertCircle };
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600", label: "En attente" };
    if (score >= 80) return { bg: "bg-red-100", border: "border-red-300", text: "text-red-700", label: "Très haute" };
    if (score >= 60) return { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700", label: "Moyenne-haute" };
    if (score >= 40) return { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700", label: "Moyenne" };
    return { bg: "bg-green-100", border: "border-green-300", text: "text-green-700", label: "Faible" };
  };

  const getIncidentTypeIcon = (type: string) => {
    const mapping: Record<string, any> = {
      "bug": AlertTriangle,
      "performance": Zap,
      "securite": Shield,
      "donnees": Database,
      "question": MessageCircle,
      "autre": AlertCircle
    };
    return mapping[type] || AlertCircle;
  };

  const getIncidentTypeLabel = (type: string) => {
    const mapping: Record<string, string> = {
      "bug": "Bug",
      "performance": "Performance",
      "securite": "Sécurité",
      "donnees": "Données",
      "question": "Question",
      "autre": "Autre"
    };
    return mapping[type] || type;
  };

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/" },
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: AlertCircle, label: "Tickets Admin", href: "/admin-tickets" },
    { icon: UsersIcon, label: "Utilisateurs", href: "/users" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const assignRecommendedTechnician = async (technicien: Recommendation) => {
    if (!ticketId) return;
    setAssignmentMessage(null);
    setAssigningTechnicianId(technicien.id);

    try {
      const result = await ticketAPI.assignTechnician(ticketId, {
        technicien_id: technicien.id,
        admin_nom: currentUser?.name || "admin",
        raison: "Affectation directe depuis la section recommandations",
      });

      setTicket((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          statut: "AFFECTE",
          technicien_assigne_id: technicien.id,
        };
      });
      setAssignmentMessage(result.message || "Ticket affecté avec succès.");
    } catch (err: any) {
      console.error("Erreur affectation directe:", err);
      setAssignmentMessage(err?.response?.data?.detail || "Impossible d'affecter ce technicien pour le moment.");
    } finally {
      setAssigningTechnicianId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-900 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement du ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen w-full flex bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">{error || "Ticket introuvable"}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const priorityStyle = getPriorityStyles(ticket.priorite);
  const statusStyle = getStatusStyles(ticket.statut);
  const scoreStyle = getScoreColor(ticket.score_difficulte);
  const hasScore = ticket.score_difficulte !== null && ticket.score_difficulte !== undefined;
  const analysisDone = !!ticket.analyse_nlp && hasScore;
  const analysisLabel = analysisDone ? "Terminée" : "En cours";

  return (
    <div className="min-h-screen w-full flex bg-white">
      <PlatformSidebar currentUser={currentUser} menuItems={menuItems} onLogout={logout} />
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#f6f6f7]">
        {/* Page Content */}
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <button
              onClick={() => navigate("/admin-tickets")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-[#1a1545] hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
              Retour aux tickets
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-700">Système Actif</span>
            </div>
          </div>

          <section className="rounded-[2rem] bg-[linear-gradient(135deg,#08154a_0%,#102b78_58%,#3b2a79_100%)] text-white p-6 md:p-8 mb-6 overflow-hidden relative shadow-[0_20px_60px_-28px_rgba(8,21,74,0.95)] ring-1 ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.16),transparent_34%)]"></div>
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-4 border-sky-100/20"></div>
            <div className="absolute right-20 bottom-4 w-14 h-14 rounded-full border-2 border-fuchsia-100/20"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wide w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                Détail ticket admin
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight line-clamp-2 max-w-4xl">{ticket.titre}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100/90">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">ID: <button type="button" onClick={() => copyToClipboard(ticket.id)} className="inline-flex items-center gap-2 text-white/95 hover:text-white">{ticket.id}<Copy size={14} className={copied ? "text-emerald-300" : "text-slate-200"} /></button></span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">{statusStyle.label}</span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15">{priorityStyle.label}</span>
              </div>
            </div>
          </section>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#11204f] mb-2">Informations principales</h2>
                <p className="text-gray-600 max-w-2xl">Vue complète du ticket, analyse IA et recommandation technique, avec une lecture plus claire et plus premium.</p>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base shadow-sm ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text}`}>
                <statusStyle.Icon size={22} />
                {statusStyle.label}
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm ring-1 ring-white/70">
                <p className="text-xs text-gray-500 font-semibold mb-2">PRIORITÉ</p>
                <div className={`flex items-center gap-2 text-lg font-bold ${priorityStyle.text}`}>
                  <priorityStyle.Icon size={22} />
                  <span>{priorityStyle.label}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm ring-1 ring-white/70">
                <p className="text-xs text-gray-500 font-semibold mb-2">APPLICATION</p>
                <p className="text-lg font-bold text-[#1a1545]">{ticket.application}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm ring-1 ring-white/70">
                <p className="text-xs text-gray-500 font-semibold mb-2">ENVIRONNEMENT</p>
                <p className="text-lg font-bold text-[#1a1545]">{ticket.environnement}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm ring-1 ring-white/70">
                <p className="text-xs text-gray-500 font-semibold mb-2">CRÉÉ LE</p>
                <p className="text-lg font-bold text-gray-900">
                  {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-8 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                <h2 className="text-2xl font-bold text-[#11204f] mb-6 flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Description du Ticket
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {ticket.description}
                </p>
              </div>

              {/* Score & AI Analysis */}
              {ticket.score_difficulte !== null && ticket.score_difficulte !== undefined ? (
                <div className="bg-white rounded-[1.5rem] border border-gray-200 p-8 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                  <h2 className="text-2xl font-bold text-[#11204f] mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    Score IA & Analyse
                  </h2>

                  <div className={`rounded-[1.5rem] p-8 mb-8 border-2 ${scoreStyle.bg} ${scoreStyle.border} shadow-sm`}>
                    <div className="flex items-center justify-between gap-6 flex-wrap">
                      <div>
                        <p className="text-sm text-gray-700 font-semibold mb-3">SCORE DE DIFFICULTÉ</p>
                        <p className={`text-5xl font-bold ${scoreStyle.text} mb-3`}>
                          {ticket.score_difficulte}
                        </p>
                        <p className={`text-base font-semibold ${scoreStyle.text}`}>
                          Difficulté {scoreStyle.label.toLowerCase()}
                        </p>
                      </div>

                      <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-white/70 backdrop-blur ${scoreStyle.border}`} style={{backgroundColor: scoreStyle.bg}}>
                        <p className={`text-5xl font-bold ${scoreStyle.text}`}>
                          {Math.round(ticket.score_difficulte)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {ticket.facteurs_score && ticket.facteurs_score.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#11204f] mb-4 flex items-center gap-2">
                         Facteurs de Complexité
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {ticket.facteurs_score.map((facteur: string, i: number) => (
                          <span key={i} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition shadow-sm">
                            {facteur}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] border-2 border-blue-200 rounded-[1.5rem] p-8 shadow-sm">
                  <div className="flex items-center gap-4">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-bold text-blue-900 text-lg inline-flex items-center gap-2">
                        {ticket.statut === "RESOLU" ? <CheckCircle className="w-5 h-5" /> : <Loader className="w-5 h-5 animate-spin" />}
                        {ticket.statut === "RESOLU" ? "Analyse résolue" : "Analyse en cours..."}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">{ticket.statut === "RESOLU" ? "Le ticket est marqué résolu." : "Le scorer et l'analyseur traitent le ticket. Cela prendra quelques secondes."}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Details */}
              {ticket.analyse_nlp && (
                <div className="bg-white rounded-[1.5rem] border border-gray-200 p-8 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                  <h2 className="text-2xl font-bold text-[#11204f] mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    Analyse Détaillée
                  </h2>

                  <div className="space-y-6">
                    {ticket.analyse_nlp.type_incident && (
                      <div className="pb-6 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-semibold mb-3">TYPE D'INCIDENT</p>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = getIncidentTypeIcon(ticket.analyse_nlp.type_incident);
                            return <Icon className="w-6 h-6 text-purple-600" />;
                          })()}
                          <p className="text-2xl font-bold text-gray-900">
                            {getIncidentTypeLabel(ticket.analyse_nlp.type_incident)}
                          </p>
                        </div>
                      </div>
                    )}

                    {ticket.analyse_nlp.technologies && ticket.analyse_nlp.technologies.length > 0 && (
                      <div className="pb-6 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2"><Cpu size={16} /> TECHNOLOGIES DÉTECTÉES</p>
                        <div className="flex flex-wrap gap-3">
                          {ticket.analyse_nlp.technologies.map((tech: string, i: number) => (
                            <span key={i} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {ticket.analyse_nlp.systemes_impactes && ticket.analyse_nlp.systemes_impactes.length > 0 && (
                      <div className="pb-6 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2"><Database size={16} /> SYSTÈMES IMPACTÉS</p>
                        <div className="flex flex-wrap gap-3">
                          {ticket.analyse_nlp.systemes_impactes.map((sys: string, i: number) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {ticket.analyse_nlp.urgence_percue && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={16} /> URGENCE PERÇUE</p>
                        <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg shadow-sm ${
                          ticket.analyse_nlp.urgence_percue === "critique" ? "bg-red-100 text-red-700" :
                          ticket.analyse_nlp.urgence_percue === "haute" ? "bg-orange-100 text-orange-700" :
                          ticket.analyse_nlp.urgence_percue === "moyenne" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {ticket.analyse_nlp.urgence_percue.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommandations de profils techniques */}
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-8 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                <h2 className="text-2xl font-bold text-[#11204f] mb-6 flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Recommandation de profil technique
                </h2>

                {assignmentMessage && (
                  <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 shadow-sm">
                    {assignmentMessage}
                  </div>
                )}

                {recommendationsLoading ? (
                  <div className="flex items-center gap-3 text-blue-700">
                    <Loader className="w-5 h-5 animate-spin" />
                    Calcul des recommandations...
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-[linear-gradient(180deg,#fafbff_0%,#f5f7fb_100%)] p-6 text-gray-600">
                    Aucun technicien disponible pour cette analyse.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recommendations.map((technicien) => {
                      const scoreColor =
                        technicien.score_compatibilite >= 80 ? "text-green-700 bg-green-100" :
                        technicien.score_compatibilite >= 60 ? "text-blue-700 bg-blue-100" :
                        technicien.score_compatibilite >= 40 ? "text-yellow-700 bg-yellow-100" :
                        "text-gray-700 bg-gray-100";

                      return (
                        <div key={technicien.id} className="rounded-[1.5rem] border border-gray-200 p-5 hover:shadow-xl transition-all duration-200 bg-white shadow-sm hover:-translate-y-0.5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Award className="w-5 h-5 text-[#1a1545]" />
                                <h3 className="text-lg font-bold text-[#1a1545]">{technicien.nom}</h3>
                              </div>
                              <p className="text-sm text-gray-600">{technicien.email}</p>
                            </div>

                            <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${scoreColor}`}>
                              {technicien.score_compatibilite}/100
                            </div>
                          </div>

                          {technicien.top_competences && technicien.top_competences.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-500 mb-2">COMPÉTENCES CLÉS</p>
                              <div className="flex flex-wrap gap-2">
                                {technicien.top_competences.map((competence, competenceIndex) => (
                                  <span
                                    key={competenceIndex}
                                    className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-semibold shadow-sm"
                                  >
                                    {competence}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {technicien.raisons && technicien.raisons.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-500 mb-2">POURQUOI CE PROFIL</p>
                              <ul className="space-y-1 text-sm text-gray-700">
                                {technicien.raisons.slice(0, 3).map((raison, raisonIndex) => (
                                  <li key={raisonIndex} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                    <span>{raison}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-wrap">
                            {ticket.technicien_assigne_id === technicien.id ? (
                              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold shadow-sm">
                                <CheckCircle className="w-4 h-4" />
                                Déjà affecté à ce ticket
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => assignRecommendedTechnician(technicien)}
                                disabled={assigningTechnicianId === technicien.id}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[linear-gradient(135deg,#08154a_0%,#123b8f_100%)] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 shadow-[0_12px_25px_-16px_rgba(8,21,74,0.75)] transition-all duration-200 hover:-translate-y-0.5"
                              >
                                {assigningTechnicianId === technicien.id ? <Loader className="w-4 h-4 animate-spin" /> : <UsersIcon className="w-4 h-4" />}
                                Affecter ce technicien
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Client Card */}
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                <h3 className="text-lg font-bold text-[#11204f] mb-4 inline-flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5" />
                  Client du ticket
                </h3>

                {clientLoading ? (
                  <div className="flex items-center gap-3 text-[#1a1545]">
                    <Loader className="w-4 h-4 animate-spin" />
                    Chargement du profil client...
                  </div>
                ) : ticketClient ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 bg-[#f8f8fb] p-4 shadow-sm">
                      <p className="text-sm text-gray-500 font-semibold">Nom complet</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{ticketClient.name}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-[#1a1545]" />
                        <span className="font-medium">{ticketClient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-[#1a1545]" />
                        <span>{ticketClient.phone || "Non renseigné"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Building2 className="w-4 h-4 text-[#1a1545]" />
                        <span>{ticketClient.department || "Département non renseigné"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#eef0ff] text-[#1a1545] shadow-sm">
                        {ticketClient.role}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          ticketClient.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ticketClient.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-[#fafafe] p-4 text-sm text-gray-700">
                    {ticket.created_by_user_id
                      ? "Profil client introuvable pour ce ticket."
                      : "Ce ticket n'est pas encore lié à un client."}
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70 sticky top-6">
                <h3 className="text-lg font-bold text-[#11204f] mb-6 inline-flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1a1545]" />
                  Résumé
                </h3>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-2">SCORE IA</p>
                    <p className={`text-3xl font-bold ${scoreStyle.text}`}>
                      {ticket.score_difficulte !== null && ticket.score_difficulte !== undefined ? `${ticket.score_difficulte}/100` : "En attente"}
                    </p>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-2">STATUT</p>
                    <p className="text-base font-bold text-gray-900">{statusStyle.label}</p>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-2">PRIORITÉ</p>
                    <p className={`text-base font-bold ${priorityStyle.text}`}>{priorityStyle.label}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">ANALYSE IA</p>
                    <p className={`text-base font-bold ${analysisDone ? "text-green-600" : "text-yellow-600"}`}>
                      <span className="inline-flex items-center gap-2">
                        {analysisDone ? <CheckCircle className="w-4 h-4" /> : <Loader className="w-4 h-4 animate-spin" />}
                        {analysisLabel}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full mt-6 px-4 py-3 bg-[linear-gradient(135deg,#08154a_0%,#123b8f_100%)] text-white font-semibold rounded-full hover:opacity-95 transition flex items-center justify-center gap-2 shadow-[0_12px_25px_-16px_rgba(8,21,74,0.75)]"
                >
                  <Clock size={18} />
                  Actualiser
                </button>

                <button
                  onClick={() => navigate(`/debat/${ticket.id}`)}
                  className="w-full mt-3 px-4 py-3 bg-white border border-gray-200 text-[#11204f] font-semibold rounded-full hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle size={18} />
                  Ouvrir débat IA
                </button>
              </div>

              {/* AI System Info */}
              {/* <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 shadow-sm">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  Système IA
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Ce ticket a été automatiquement analysé par notre système IA qui utilise:
                </p>
                <ul className="text-sm text-blue-800 space-y-3">
                  <li className="flex items-start gap-2">
                    <MessageCircle size={18} className="mt-1" />
                    <div>
                      <strong>Analyseur NLP</strong>
                      <p className="text-xs text-blue-700">Extraction des technologies et systèmes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 size={18} className="mt-1" />
                    <div>
                      <strong>Scorer IA</strong>
                      <p className="text-xs text-blue-700">Calcul du score de difficulté (0-100)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <UsersIcon size={18} className="mt-1" />
                    <div>
                      <strong>Profil Matcher</strong>
                      <p className="text-xs text-blue-700">Recommandations de techniciens</p>
                    </div>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
               TMA System - Gestion intelligente des tickets | Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
