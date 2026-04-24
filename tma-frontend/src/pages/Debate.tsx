import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Bot, CheckCircle2, Loader2, MessageSquare, Play, RefreshCcw, Scale, Send, StopCircle, UserCheck, XCircle } from "lucide-react";
import { debatAPI, type DebateJudgeProposal, type DebateMessage, type DebateMode, type DebateTechnician } from "../api/client";
import { getSession } from "../utils/auth";

interface ApiErrorLike {
  response?: {
    data?: {
      detail?: unknown;
    };
  };
}

const parseApiError = (error: unknown, fallback: string): string => {
  const apiError = error as ApiErrorLike;
  const detail = apiError.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return fallback;
};

export default function Debate() {
  const { id: ticketId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = getSession();

  const [mode, setMode] = useState<DebateMode>("classique");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ticketTitle, setTicketTitle] = useState<string>("");
  const [debateStatus, setDebateStatus] = useState<string>("NON_LANCE");
  const [history, setHistory] = useState<DebateMessage[]>([]);
  const [technicians, setTechnicians] = useState<DebateTechnician[]>([]);
  const [judgeProposal, setJudgeProposal] = useState<DebateJudgeProposal | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canStart = !!ticketId && !isStarting && !isProcessing;
  const canRespond = !!sessionId && !isProcessing && debateStatus === "EN_COURS" && !isFinished;
  const canFinish = !!sessionId && !isProcessing && debateStatus === "EN_COURS" && history.length > 0;
  const canValidate = !!sessionId && !isProcessing && !!judgeProposal?.gagnant_id;
  const canCancel = !!sessionId && !isProcessing && debateStatus !== "VALIDE" && debateStatus !== "ANNULE";

  const groupedScores = useMemo(() => {
    const rawScores = judgeProposal?.scores || {};
    return Object.entries(rawScores).sort((a, b) => Number(b[1]) - Number(a[1]));
  }, [judgeProposal]);

  const resetAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  const launchDebate = async () => {
    if (!ticketId) {
      setError("Ticket introuvable dans l'URL.");
      return;
    }

    resetAlerts();
    setIsStarting(true);

    try {
      const data = await debatAPI.lancer(ticketId, mode);
      setSessionId(data.session_id);
      setTicketTitle(data.ticket_titre || "");
      setHistory(Array.isArray(data.historique) ? data.historique : []);
      setTechnicians(Array.isArray(data.techniciens) ? data.techniciens : []);
      setDebateStatus("EN_COURS");
      setJudgeProposal(null);
      setIsFinished(false);
      setSuccess("Débat lancé avec succès.");
    } catch (err) {
      setError(parseApiError(err, "Impossible de lancer le débat."));
    } finally {
      setIsStarting(false);
    }
  };

  const refreshDebate = async () => {
    if (!sessionId) return;

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.get(sessionId);
      setHistory(Array.isArray(data.historique) ? data.historique : []);
      setDebateStatus(data.statut || "EN_COURS");
      setJudgeProposal((data.proposition_juge as DebateJudgeProposal) || null);
      setIsFinished(!!data.est_termine);
      setSuccess("État du débat mis à jour.");
    } catch (err) {
      setError(parseApiError(err, "Impossible de rafraîchir le débat."));
    } finally {
      setIsProcessing(false);
    }
  };

  const respondNext = async () => {
    if (!sessionId) return;

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.repondre(sessionId, mode);
      setHistory(Array.isArray(data.historique) ? data.historique : []);
      setIsFinished(!!data.est_termine);
      setSuccess("Nouveau message généré.");
    } catch (err) {
      setError(parseApiError(err, "Impossible de générer la réponse suivante."));
    } finally {
      setIsProcessing(false);
    }
  };

  const finishDebate = async () => {
    if (!sessionId) return;

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.terminer(sessionId, mode);
      setHistory(Array.isArray(data.historique) ? data.historique : []);
      setJudgeProposal(data.proposition || null);
      setDebateStatus("EN_ATTENTE_VALIDATION");
      setSuccess("Le juge a rendu sa proposition.");
    } catch (err) {
      setError(parseApiError(err, "Impossible de terminer le débat."));
    } finally {
      setIsProcessing(false);
    }
  };

  const validateDecision = async () => {
    if (!sessionId || !judgeProposal?.gagnant_id) return;

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.valider(
        sessionId,
        {
          technicien_id: judgeProposal.gagnant_id,
          admin_nom: session?.name || "admin",
          raison: "Validation depuis l'interface débat",
        },
        mode
      );
      setDebateStatus("VALIDE");
      setSuccess(data.message || "Décision validée.");
    } catch (err) {
      setError(parseApiError(err, "Impossible de valider la décision."));
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelDebate = async () => {
    if (!sessionId) return;

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.annuler(sessionId, mode);
      setDebateStatus("ANNULE");
      setSuccess(data.message || "Débat annulé.");
    } catch (err) {
      setError(parseApiError(err, "Impossible d'annuler le débat."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-[#1a1545] hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setMode("classique")}
              disabled={!!sessionId}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${mode === "classique" ? "bg-[#08052e] text-white" : "text-gray-700"}`}
            >
              Classique
            </button>
            <button
              type="button"
              onClick={() => setMode("hybride")}
              disabled={!!sessionId}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${mode === "hybride" ? "bg-[#08052e] text-white" : "text-gray-700"}`}
            >
              Hybride
            </button>
          </div>
        </div>

        <section className="rounded-2xl bg-[#020331] text-white p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border-4 border-sky-100/50" />
          <p className="text-sky-200 text-sm mb-2">Débat multi-agent</p>
          <h1 className="text-3xl font-extrabold mb-2">Ticket {ticketId || "inconnu"}</h1>
          <p className="text-slate-200 text-sm">{ticketTitle || "Lancez le débat pour charger le contexte ticket et les techniciens."}</p>
        </section>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 inline-flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1a1545] inline-flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Historique du débat
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">{debateStatus}</span>
            </div>

            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-[#fafafe] p-8 text-center text-gray-600">
                Aucun message pour le moment.
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
                {history.map((msg, index) => (
                  <article key={`${msg.agent_nom}-${index}`} className="rounded-xl border border-gray-200 p-4 bg-[#fcfcff]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="font-bold text-[#1a1545]">{msg.agent_nom}</p>
                      <div className="text-xs text-gray-500 inline-flex items-center gap-2">
                        <span>Tour {msg.tour ?? "-"}</span>
                        {msg.llm && <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">{msg.llm}</span>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.contenu}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-bold text-[#1a1545] mb-3 inline-flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Contrôles
              </h3>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={launchDebate}
                  disabled={!canStart}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#08052e] text-white text-sm font-semibold disabled:opacity-50"
                >
                  {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Lancer le débat
                </button>

                <button
                  type="button"
                  onClick={respondNext}
                  disabled={!canRespond}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1545] disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Tour suivant
                </button>

                <button
                  type="button"
                  onClick={finishDebate}
                  disabled={!canFinish}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1545] disabled:opacity-50"
                >
                  <StopCircle className="w-4 h-4" />
                  Terminer + Juge
                </button>

                <button
                  type="button"
                  onClick={validateDecision}
                  disabled={!canValidate}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  Valider affectation
                </button>

                <button
                  type="button"
                  onClick={cancelDebate}
                  disabled={!canCancel}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler débat
                </button>

                <button
                  type="button"
                  onClick={refreshDebate}
                  disabled={!sessionId || isProcessing}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1545] disabled:opacity-50"
                >
                  <RefreshCcw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  Rafraîchir
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-bold text-[#1a1545] mb-3">Techniciens</h3>
              {technicians.length === 0 ? (
                <p className="text-sm text-gray-600">Aucun technicien chargé.</p>
              ) : (
                <div className="space-y-2">
                  {technicians.map((tech) => (
                    <div key={tech.id} className="rounded-xl bg-[#f6f7fb] p-3 border border-gray-200">
                      <p className="text-sm font-semibold text-[#1a1545]">{tech.nom}</p>
                      <p className="text-xs text-gray-600 mt-1">{tech.llm || "LLM non spécifié"}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a1545] inline-flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5" />
            Proposition du juge
          </h2>

          {!judgeProposal ? (
            <p className="text-sm text-gray-600">Aucune proposition pour le moment. Termine le débat pour lancer l'évaluation.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-sm text-gray-600">Gagnant proposé</p>
                <p className="text-lg font-bold text-emerald-700">{judgeProposal.gagnant_nom || "Non défini"}</p>
              </div>

              {groupedScores.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#1a1545] mb-2">Scores</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupedScores.map(([name, score]) => (
                      <div key={name} className="rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <span className="text-sm font-bold text-[#1a1545]">{score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {judgeProposal.justification && (
                <div>
                  <p className="text-sm font-semibold text-[#1a1545] mb-1">Justification</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{judgeProposal.justification}</p>
                </div>
              )}

              {judgeProposal.recommandation && (
                <div>
                  <p className="text-sm font-semibold text-[#1a1545] mb-1">Recommandation</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{judgeProposal.recommandation}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}