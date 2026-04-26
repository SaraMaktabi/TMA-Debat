import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader, Zap, TrendingUp, Clock, Tag, MessageCircle, AlertTriangle, CheckCircle, Search, Users, HelpCircle, Bug, Shield, Database, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { ticketAPI } from "../api/client";
import { getSession, isTechnicianRole } from "../utils/auth";

interface Ticket {
  id: string;
  titre: string;
  description: string;
  priorite: string;
  statut: string;
  score?: number;
  facteurs?: string[];
  analyse_nlp?: {
    technologies: string[];
    type_incident: string;
    systemes_impactes: string[];
    urgence_percue: string;
  };
  environnement: string;
  application: string;
  created_at?: string;
}

export default function TicketDetails() {
  const { id: ticketId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = getSession();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backPath = isTechnicianRole(session?.role) ? "/tech/tickets" : "/tickets";

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      try {
        const data = await ticketAPI.getById(ticketId, {
          requesterUserId: session?.id,
          requesterRole: session?.role,
        });
        setTicket(data);
        setError(null);
      } catch (err: any) {
        console.error("Erreur:", err);
        setError("Impossible de charger le ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();

    const interval = setInterval(() => {
      fetchTicket();
    }, 10000);

    const handleFocus = () => {
      fetchTicket();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [ticketId, session?.id, session?.role]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-red-100", text: "text-red-700", label: "Très haute difficulté" };
    if (score >= 60) return { bg: "bg-orange-100", text: "text-orange-700", label: "Difficulté moyenne-haute" };
    if (score >= 40) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Difficulté moyenne" };
    return { bg: "bg-green-100", text: "text-green-700", label: "Faible difficulté" };
  };

  const getPriorityLabel = (priorite: string) => {
    switch (priorite) {
      case "P1": return { Icon: AlertTriangle, label: "Critique", color: "text-red-600" };
      case "P2": return { Icon: AlertCircle, label: "Haute", color: "text-orange-600" };
      case "P3": return { Icon: AlertCircle, label: "Normal", color: "text-yellow-600" };
      case "P4": return { Icon: CheckCircle, label: "Faible", color: "text-green-600" };
      default: return { Icon: HelpCircle, label: "Inconnue", color: "text-gray-600" };
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "OUVERT":
      case "NOUVEAU": return { Icon: Tag, label: "Ouvert", color: "bg-blue-100 text-blue-700" };
      case "EN_ANALYSE": return { Icon: Search, label: "En analyse", color: "bg-yellow-100 text-yellow-700" };
      case "AFFECTE": return { Icon: Users, label: "Affecté", color: "bg-purple-100 text-purple-700" };
      case "RESOLU": return { Icon: CheckCircle, label: "Résolu", color: "bg-green-100 text-green-700" };
      default: return { Icon: HelpCircle, label: statut, color: "bg-gray-100 text-gray-700" };
    }
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

  const getIncidentTypeIcon = (type: string) => {
    const mapping: Record<string, any> = {
      "bug": Bug,
      "performance": Zap,
      "securite": Shield,
      "donnees": Database,
      "question": HelpCircle,
      "autre": HelpCircle,
    };
    return mapping[type] || HelpCircle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6ff_0%,#f7f9fc_40%,#eef2ef_100%)] flex items-center justify-center px-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur px-8 py-10 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)] text-center max-w-sm w-full">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#08154a_0%,#0a3a2f_100%)] text-white shadow-lg shadow-[#08154a]/20">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-lg font-bold text-[#11204f] mb-2">Chargement du ticket</p>
          <p className="text-sm text-gray-600">{!ticket?.score ? "L'analyse IA est en cours..." : "Préparation de la vue détaillée."}</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fdf2f2_0%,#fff7f7_35%,#f5f7fb_100%)]">
        <nav className="border-b border-white/70 bg-white/70 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(backPath)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 text-blue-900 hover:bg-gray-50 font-medium shadow-sm"
            >
              <ArrowLeft size={20} />
              Retour aux tickets
            </button>
          </div>
        </nav>
        <div className="flex items-center justify-center pt-20 px-4">
          <div className="rounded-[2rem] border border-red-100 bg-white/85 backdrop-blur px-8 py-10 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] text-center max-w-sm w-full">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-[#11204f] mb-2">Impossible de charger le ticket</p>
            <p className="text-sm text-gray-600">{error || "Ticket introuvable"}</p>
          </div>
        </div>
      </div>
    );
  }

  const scoreInfo = ticket.score ? getScoreColor(ticket.score) : null;
  const priorityInfo = getPriorityLabel(ticket.priorite);
  const statusInfo = getStatusLabel(ticket.statut);
  const PriorityIcon = priorityInfo.Icon;
  const StatusIcon = statusInfo.Icon;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef6ff_0%,#f7f9fc_40%,#eef2ef_100%)]">
      <nav className="border-b border-white/70 bg-white/70 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 text-blue-900 hover:bg-gray-50 font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} />
            Retour aux tickets
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#08154a_0%,#102b78_58%,#3b2a79_100%)] text-white p-6 md:p-8 relative overflow-hidden shadow-[0_20px_60px_-28px_rgba(8,21,74,0.95)] ring-1 ring-white/10 mb-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.16),transparent_34%)]"></div>
            <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black leading-tight">{ticket.titre}</h1>
                <p className="text-slate-100/90 mt-3">Analyse, priorisation et contexte complet du ticket dans une interface plus lisible et plus premium.</p>
                <p className="text-slate-200 mt-3 text-sm">ID: <span className="font-mono text-white">{ticket.id}</span></p>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusInfo.color} bg-white/10 border border-white/15`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm ring-1 ring-white/70">
              <p className="text-xs text-gray-500 mb-1">Priorité</p>
              <p className={`font-bold text-lg ${priorityInfo.color} inline-flex items-center gap-2`}>
                <PriorityIcon className="w-5 h-5" />
                {priorityInfo.label}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm ring-1 ring-white/70">
              <p className="text-xs text-gray-500 mb-1">Environnement</p>
              <p className="font-bold text-lg text-blue-900">{ticket.environnement}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm ring-1 ring-white/70">
              <p className="text-xs text-gray-500 mb-1">Application</p>
              <p className="font-bold text-lg text-blue-900">{ticket.application}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm ring-1 ring-white/70">
              <p className="text-xs text-gray-500 mb-1">Créé le</p>
              <p className="font-bold text-sm text-blue-900">
                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
              <h2 className="text-xl font-bold text-[#11204f] mb-4 flex items-center gap-2">
                <MessageCircle size={20} />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.score !== null && ticket.score !== undefined ? (
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                <h2 className="text-xl font-bold text-[#11204f] mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-600" />
                  Analyse IA & Score
                </h2>

                <div className={`${scoreInfo?.bg} rounded-[1.5rem] p-6 mb-6 shadow-sm`}>
                  <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Score de Difficulté</p>
                      <p className={`text-4xl font-bold ${scoreInfo?.text}`}>{ticket.score}/100</p>
                      <p className={`text-sm font-medium mt-2 ${scoreInfo?.text}`}>{scoreInfo?.label}</p>
                    </div>
                    <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center bg-white/70 backdrop-blur" style={{
                      borderColor: scoreInfo?.text === "text-red-700" ? "#dc2626" : 
                                   scoreInfo?.text === "text-orange-700" ? "#ea580c" :
                                   scoreInfo?.text === "text-yellow-700" ? "#ca8a04" : "#16a34a"
                    }}>
                      <p className="text-2xl font-bold">{Math.round(ticket.score)}%</p>
                    </div>
                  </div>
                </div>

                {ticket.facteurs && ticket.facteurs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-[#11204f] mb-3 inline-flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Facteurs de complexité
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.facteurs.map((facteur: string, i: number) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          {facteur}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] border border-blue-200 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                      <p className="font-semibold text-blue-900">Analyse en cours...</p>
                    <p className="text-sm text-blue-700 mt-1">Le scorer et l'analyseur traitent ton ticket. Cela prendra quelques secondes.</p>
                  </div>
                </div>
              </div>
            )}

            {ticket.analyse_nlp && (
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
                <h2 className="text-xl font-bold text-[#11204f] mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-600" />
                  Analyse Détaillée
                </h2>

                <div className="space-y-4">
                  {ticket.analyse_nlp.type_incident && (
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                      {(() => {
                        const IncidentIcon = getIncidentTypeIcon(ticket.analyse_nlp?.type_incident || "autre");
                        return <IncidentIcon size={20} className="text-purple-600 flex-shrink-0 mt-1" />;
                      })()}
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Type d'Incident</p>
                        <p className="text-gray-900 font-semibold">{getIncidentTypeLabel(ticket.analyse_nlp.type_incident)}</p>
                      </div>
                    </div>
                  )}

                  {ticket.analyse_nlp.technologies && ticket.analyse_nlp.technologies.length > 0 && (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-2 inline-flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Technologies Détectées
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ticket.analyse_nlp.technologies.map((tech: string, i: number) => (
                            <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ticket.analyse_nlp.systemes_impactes && ticket.analyse_nlp.systemes_impactes.length > 0 && (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-2 inline-flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Systèmes Impactés
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ticket.analyse_nlp.systemes_impactes.map((sys: string, i: number) => (
                            <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                            {sys}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ticket.analyse_nlp.urgence_percue && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2 inline-flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Urgence Perçue
                      </p>
                      <div className={`inline-block px-4 py-2 rounded-full font-semibold shadow-sm ${
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
          </div>

          <div className="space-y-6">
              <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70 sticky top-24">
              <h3 className="font-bold text-[#11204f] mb-4">Informations</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-bold text-blue-900">
                    {ticket.score ? `${ticket.score}/100` : "En cours..."}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500">Statut</p>
                  <p className="font-semibold text-gray-900">{statusInfo.label}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500">Application</p>
                  <p className="font-semibold text-gray-900">{ticket.application}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500">Environnement</p>
                  <p className="font-semibold text-gray-900">{ticket.environnement}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                  <Clock size={14} />
                  Synchronisation automatique active
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full mt-4 px-4 py-2 bg-[linear-gradient(135deg,#08154a_0%,#123b8f_100%)] text-white rounded-full hover:opacity-95 font-medium transition flex items-center justify-center gap-2 shadow-[0_12px_25px_-16px_rgba(8,21,74,0.75)]"
              >
                <Clock size={16} />
                Actualiser
              </button>
            </div>

            {/* <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 shadow-sm">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Zap size={18} />
                Système IA
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Ce ticket a été automatiquement analysé par notre système IA qui utilise:
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li><strong>Analyseur NLP</strong> - Extraction des technologies</li>
                <li><strong>Scorer IA</strong> - Calcul du score de difficulté</li>
                <li><strong>Profil Matcher</strong> - Recommandations de techniciens</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}