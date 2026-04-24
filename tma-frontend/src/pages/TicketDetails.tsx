import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader, Zap, TrendingUp, Clock, Tag, MessageCircle, AlertTriangle, CheckCircle, Search, Users, HelpCircle, Bug, Shield, Database, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { ticketAPI } from "../api/client";
import { getSession } from "../utils/auth";

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
  const [autoRefresh, setAutoRefresh] = useState(true);

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

    let interval: any;
    if (autoRefresh && !loading && ticket && !ticket.score) {
      interval = setInterval(() => {
        fetchTicket();
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [ticketId, autoRefresh, ticket?.score]);

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
      case "NOUVEAU": return { Icon: Tag, label: "Nouveau", color: "bg-blue-100 text-blue-700" };
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du ticket...</p>
          {!ticket?.score && <p className="text-sm text-gray-500 mt-2">L'analyse IA est en cours...</p>}
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-2 text-blue-900 hover:text-blue-950 font-medium"
            >
              <ArrowLeft size={20} />
              Retour aux tickets
            </button>
          </div>
        </nav>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">{error || "Ticket introuvable"}</p>
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
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/tickets")}
            className="flex items-center gap-2 text-blue-900 hover:text-blue-950 font-medium transition"
          >
            <ArrowLeft size={20} />
            Retour aux tickets
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{ticket.titre}</h1>
              <p className="text-gray-600 mt-2">ID: <span className="font-mono text-blue-900">{ticket.id}</span></p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Priorité</p>
              <p className={`font-bold text-lg ${priorityInfo.color} inline-flex items-center gap-2`}>
                <PriorityIcon className="w-5 h-5" />
                {priorityInfo.label}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Environnement</p>
              <p className="font-bold text-lg text-blue-900">{ticket.environnement}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Application</p>
              <p className="font-bold text-lg text-blue-900">{ticket.application}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Créé le</p>
              <p className="font-bold text-sm text-blue-900">
                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle size={20} />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.score !== null && ticket.score !== undefined ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-600" />
                  Analyse IA & Score
                </h2>

                <div className={`${scoreInfo?.bg} rounded-lg p-6 mb-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Score de Difficulté</p>
                      <p className={`text-4xl font-bold ${scoreInfo?.text}`}>{ticket.score}/100</p>
                      <p className={`text-sm font-medium mt-2 ${scoreInfo?.text}`}>{scoreInfo?.label}</p>
                    </div>
                    <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center" style={{
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
                    <h3 className="font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Facteurs de complexité
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.facteurs.map((facteur: string, i: number) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {facteur}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
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
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                          <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
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
                          <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
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
                      <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Informations</h3>
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh && !ticket.score}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    disabled={!!ticket.score}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    {ticket.score ? "Analyse terminée" : "Actualiser automatiquement"}
                  </span>
                </label>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950 font-medium transition flex items-center justify-center gap-2"
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