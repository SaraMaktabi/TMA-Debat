import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Bot, CheckCircle2, Expand, Loader2, MessageSquare, Minimize2, Play, RefreshCcw, Scale, Send, Sparkles, StopCircle, UserCheck, UsersIcon, XCircle } from "lucide-react";
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
  const isAdmin = session?.role === "Admin";

  const [mode, setMode] = useState<DebateMode>(isAdmin ? "hybride" : "classique");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ticketTitle, setTicketTitle] = useState<string>("");
  const [debateStatus, setDebateStatus] = useState<string>("NON_LANCE");
  const [history, setHistory] = useState<DebateMessage[]>([]);
  const [technicians, setTechnicians] = useState<DebateTechnician[]>([]);
  const [judgeProposal, setJudgeProposal] = useState<DebateJudgeProposal | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminQuestion, setAdminQuestion] = useState("");
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);

  const winnerTechnicianId = useMemo(() => {
    const winnerId = judgeProposal?.gagnant_id;
    if (winnerId) return winnerId;

    const winnerName = judgeProposal?.gagnant_nom?.trim().toLowerCase();
    if (!winnerName) return null;

    const byName = technicians.find((tech) => tech.nom.trim().toLowerCase() === winnerName);
    return byName?.id ?? null;
  }, [judgeProposal, technicians]);

  const canStart = !!ticketId && !sessionId && !isStarting && !isProcessing;
  const canRespond = !!sessionId && !isProcessing && debateStatus === "EN_COURS" && !isFinished;
  const canFinish = !!sessionId && !isProcessing && debateStatus === "EN_COURS" && history.length > 0;
  const canValidate = !!sessionId && !isProcessing && debateStatus === "EN_ATTENTE_VALIDATION" && !!judgeProposal && (!!winnerTechnicianId || !!judgeProposal.gagnant_nom);
  const canCancel = !!sessionId && !isProcessing && debateStatus !== "VALIDE" && debateStatus !== "ANNULE";
  const canStartWithQuestion = isAdmin && mode === "hybride" && !sessionId && !!ticketId && !isStarting && !isProcessing && adminQuestion.trim().length > 0;
  const canAskQuestion = isAdmin && mode === "hybride" && !!sessionId && !isProcessing && debateStatus === "EN_COURS" && adminQuestion.trim().length > 0;
  const canUseAdminComposer = isAdmin && mode === "hybride" && !isProcessing && !isStarting && (!sessionId ? !!ticketId : debateStatus === "EN_COURS");

  const groupedScores = useMemo(() => {
    const rawScores = judgeProposal?.scores || {};
    return Object.entries(rawScores).sort((a, b) => Number(b[1]) - Number(a[1]));
  }, [judgeProposal]);

  const debateStats = useMemo(() => {
    const adminQuestions = history.filter((msg) => msg.type === "admin_question").length;
    const agentResponses = history.filter((msg) => msg.type === "agent_reponse").length;
    const latestMessage = history.at(-1);

    return {
      totalMessages: history.length,
      adminQuestions,
      agentResponses,
      latestMessageLabel: latestMessage?.agent_nom || "Aucun message",
      latestMessageTime: latestMessage?.timestamp ? new Date(latestMessage.timestamp).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : null,
    };
  }, [history]);

  const statusTone = useMemo(() => {
    if (debateStatus === "EN_COURS") return "emerald";
    if (debateStatus === "EN_ATTENTE_VALIDATION") return "amber";
    if (debateStatus === "VALIDE") return "sky";
    if (debateStatus === "ANNULE") return "rose";
    return "slate";
  }, [debateStatus]);

  const resetAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsChatFullscreen(document.fullscreenElement === chatPanelRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleChatFullscreen = async () => {
    if (!chatPanelRef.current) return;

    if (document.fullscreenElement === chatPanelRef.current) {
      await document.exitFullscreen();
      return;
    }

    try {
      if (chatPanelRef.current.requestFullscreen) {
        await chatPanelRef.current.requestFullscreen();
        return;
      }
    } catch {
      // Fallback to in-app fullscreen below.
    }

    setIsChatFullscreen((current) => !current);
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

  const startDebateWithAdminQuestion = async () => {
    if (!ticketId) {
      setError("Ticket introuvable dans l'URL.");
      return;
    }

    if (mode !== "hybride") {
      setError("Le démarrage avec question admin est disponible en mode hybride.");
      return;
    }

    const questionText = adminQuestion.trim();
    if (!questionText) {
      setError("Ajoute une question avant de démarrer le débat.");
      return;
    }

    resetAlerts();
    setIsStarting(true);

    try {
      const launched = await debatAPI.lancer(ticketId, "hybride", { skipInitialMessage: true });
      setSessionId(launched.session_id);
      setTicketTitle(launched.ticket_titre || "");
      setHistory(Array.isArray(launched.historique) ? launched.historique : []);
      setTechnicians(Array.isArray(launched.techniciens) ? launched.techniciens : []);
      setDebateStatus("EN_COURS");
      setJudgeProposal(null);
      setIsFinished(false);

      const withQuestion = await debatAPI.question(launched.session_id, { question: questionText }, "hybride");
      setHistory(Array.isArray(withQuestion.historique) ? withQuestion.historique : []);
      setAdminQuestion("");
      setSuccess("Débat lancé et première question admin envoyée.");
    } catch (err) {
      setError(parseApiError(err, "Impossible de démarrer le débat avec la question admin."));
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

  const submitAdminQuestion = async () => {
    if (!sessionId || !canAskQuestion) return;

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.question(sessionId, { question: adminQuestion.trim() }, mode);
      setHistory(Array.isArray(data.historique) ? data.historique : history);
      setAdminQuestion("");
      setSuccess("Question admin envoyée aux techniciens.");
    } catch (err) {
      setError(parseApiError(err, "Impossible d'envoyer la question admin."));
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
      const judgeHistory = Array.isArray(data.historique) ? data.historique : Array.isArray(data.historique_complet) ? data.historique_complet : [];
      setHistory(judgeHistory);
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
    if (!sessionId || !judgeProposal) return;

    const technicienNom =
      judgeProposal.gagnant_nom ||
      technicians.find((tech) => tech.id === winnerTechnicianId)?.nom ||
      "";

    if (!winnerTechnicianId && !technicienNom) {
      setError("Impossible d'identifier le technicien gagnant pour valider l'affectation.");
      return;
    }

    resetAlerts();
    setIsProcessing(true);
    try {
      const data = await debatAPI.valider(
        sessionId,
        {
          technicien_id: winnerTechnicianId || undefined,
          technicien_nom: technicienNom,
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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#eef6ff_0%,#f7f9fc_35%,#f4f7f5_100%)] px-4 py-6 md:px-8 md:py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-white/70 bg-white/70 px-3 py-2 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.45)] backdrop-blur">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-[#132655] hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/85 border border-gray-200 p-1.5 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setMode("classique")}
              disabled={!!sessionId}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${mode === "classique" ? "bg-[#08154a] text-white shadow-md shadow-[#08154a]/20" : "text-gray-700 hover:bg-gray-100"}`}
            >
              Classique
            </button>
            <button
              type="button"
              onClick={() => setMode("hybride")}
              disabled={!!sessionId}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${mode === "hybride" ? "bg-[#0a3a2f] text-white shadow-md shadow-emerald-900/15" : "text-gray-700 hover:bg-gray-100"}`}
            >
              Hybride
            </button>
          </div>
        </div>

        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#08154a_0%,#102b78_42%,#0a3a2f_100%)] text-white p-6 md:p-8 mb-6 relative overflow-hidden shadow-[0_20px_60px_-28px_rgba(8,21,74,0.95)] ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(55,211,182,0.14),transparent_32%)]" />
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-4 border-cyan-100/20" />
          <div className="absolute left-10 bottom-0 w-36 h-36 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide uppercase shadow-inner">
                  <Sparkles className="w-3.5 h-3.5" />
                  Salle de débat pilotée par IA
                </div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">Ticket {ticketId || "inconnu"}</h1>
                <p className="text-slate-100/90 text-sm md:text-base max-w-2xl">
                  {ticketTitle || "Lancez le débat pour charger le contexte ticket et les techniciens."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-semibold backdrop-blur">Mode {mode}</span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-semibold backdrop-blur">{technicians.length} technicien(s)</span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-semibold backdrop-blur">{debateStats.totalMessages} messages</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3 shadow-inner">
                <p className="text-[11px] uppercase tracking-wide text-cyan-100/80 mb-1">Messages</p>
                <p className="text-2xl font-extrabold">{debateStats.totalMessages}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3 shadow-inner">
                <p className="text-[11px] uppercase tracking-wide text-cyan-100/80 mb-1">Questions admin</p>
                <p className="text-2xl font-extrabold">{debateStats.adminQuestions}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3 shadow-inner">
                <p className="text-[11px] uppercase tracking-wide text-cyan-100/80 mb-1">Réponses agents</p>
                <p className="text-2xl font-extrabold">{debateStats.agentResponses}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 inline-flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 inline-flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 items-start ${isChatFullscreen ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}>
          <section
            ref={chatPanelRef}
            className={`rounded-3xl border border-gray-200/80 bg-white/92 backdrop-blur p-4 md:p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ${
              isChatFullscreen
                ? "fixed inset-4 md:inset-6 z-50 flex h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex-col border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_25px_80px_-20px_rgba(15,23,42,0.55)]"
                : "lg:col-span-2"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-4 px-1">
              <h2 className="text-xl font-bold text-[#11204f] inline-flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Salle de débat
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ring-1 ring-inset ${
                    statusTone === "emerald"
                      ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
                      : statusTone === "amber"
                        ? "bg-amber-100 text-amber-800 ring-amber-200"
                        : statusTone === "sky"
                          ? "bg-sky-100 text-sky-800 ring-sky-200"
                          : statusTone === "rose"
                            ? "bg-rose-100 text-rose-700 ring-rose-200"
                            : "bg-gray-100 text-gray-700 ring-gray-200"
                  }`}
                >
                  {debateStatus}
                </span>
                <button
                  type="button"
                  onClick={toggleChatFullscreen}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-[#11204f] hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                >
                  {isChatFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
                  {isChatFullscreen ? "Quitter plein écran" : "Plein écran"}
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Dernier émetteur</p>
                <p className="text-sm font-semibold text-[#11204f] mt-1 truncate">{debateStats.latestMessageLabel}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Dernière activité</p>
                <p className="text-sm font-semibold text-[#11204f] mt-1 truncate">{debateStats.latestMessageTime || "Aucune"}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Contexte</p>
                <p className="text-sm font-semibold text-[#11204f] mt-1 truncate">{mode === "hybride" ? "Chat stratégique" : "Débat classique"}</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {technicians.length === 0 ? (
                <span className="text-xs text-gray-500">Techniciens en attente...</span>
              ) : (
                technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d6e4ff] bg-[#f4f8ff] text-xs font-semibold text-[#17306d] shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2e7be8]" />
                    {tech.nom}
                    <span className="text-[#4c669e] font-medium">{tech.llm || "LLM"}</span>
                  </div>
                ))
              )}
            </div>

            <div className={`rounded-2xl border border-gray-200 bg-[linear-gradient(180deg,#f9fbff_0%,#ffffff_100%)] ${isChatFullscreen ? "flex-1 min-h-0 flex flex-col" : ""}`}>
              <div className={`overflow-auto p-4 md:p-5 space-y-3 ${isChatFullscreen ? "flex-1 min-h-0" : "h-[54vh] md:h-[58vh]"}`}>
                {history.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="max-w-md rounded-2xl border border-dashed border-[#c8d9ff] bg-[#f4f8ff] p-8 text-center text-gray-600">
                      <p className="font-semibold text-[#18306f] mb-2">Conversation vide</p>
                      <p className="text-sm">Lance le débat classique, ou démarre en hybride avec ta question admin depuis la zone en bas.</p>
                    </div>
                  </div>
                ) : (
                  history.map((msg, index) => {
                    const isAdminMsg = msg.type === "admin_question";
                    const isAgentResponse = msg.type === "agent_reponse";
                    const isRight = isAdminMsg;
                    const initials = (msg.agent_nom || "?")
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p.charAt(0).toUpperCase())
                      .join("");

                    return (
                      <article key={`${msg.agent_nom}-${msg.timestamp || index}`} className={`flex gap-3 ${isRight ? "justify-end" : "justify-start"}`}>
                        {!isRight && (
                          <div className="w-8 h-8 rounded-full bg-[#e6efff] text-[#1c3d88] border border-[#cfe0ff] flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">
                            {initials}
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] md:max-w-[75%] rounded-2xl border px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            isAdminMsg
                              ? "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 ring-1 ring-amber-100"
                              : isAgentResponse
                                ? "border-sky-200 bg-gradient-to-br from-sky-50 to-white ring-1 ring-sky-100"
                                : "border-gray-200 bg-white ring-1 ring-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-[#14244f] text-sm">{msg.agent_nom}</p>
                              {isAdminMsg && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold shadow-sm">Admin</span>}
                              {isAgentResponse && <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold shadow-sm">Réponse</span>}
                            </div>
                            <div className="text-[11px] text-gray-500 inline-flex items-center gap-2">
                              <span>Tour {msg.tour ?? "-"}</span>
                              {msg.llm && <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">{msg.llm}</span>}
                            </div>
                          </div>
                          {msg.en_reponse_a && <p className="text-xs text-gray-500 mb-1.5">En réponse à: {msg.en_reponse_a}</p>}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.contenu}</p>
                        </div>

                        {isRight && (
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center text-[11px] font-bold shrink-0 mt-1 shadow-sm">
                            AD
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>

              {isAdmin && (
                <div className="border-t border-gray-200 p-3 md:p-4 bg-white rounded-b-2xl">
                  <div className="rounded-2xl border border-[#c9d9ff] bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_55%,#f0fff8_100%)] p-3 shadow-sm ring-1 ring-[#e5efff]">
                    <label className="text-xs font-semibold text-[#17306d] inline-flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Question admin
                    </label>
                    <div className="flex flex-col md:flex-row gap-2">
                      <textarea
                        value={adminQuestion}
                        onChange={(e) => setAdminQuestion(e.target.value)}
                        placeholder={
                          mode === "hybride"
                            ? "Tape ta question stratégique pour les techniciens..."
                            : "Passe en mode hybride pour poser une question admin dans le chat"
                        }
                        rows={2}
                        disabled={mode !== "hybride" || !canUseAdminComposer}
                        className="flex-1 rounded-xl border border-[#bfd4ff] bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#a8c4ff] resize-none disabled:opacity-60 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!sessionId) {
                            startDebateWithAdminQuestion();
                            return;
                          }
                          submitAdminQuestion();
                        }}
                        disabled={sessionId ? !canAskQuestion : !canStartWithQuestion}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[linear-gradient(135deg,#0b3a2f_0%,#0f6a56_100%)] text-white text-sm font-semibold disabled:opacity-50 min-w-[220px] shadow-[0_12px_25px_-16px_rgba(11,58,47,0.75)] transition-all duration-200 hover:-translate-y-0.5"
                      >
                        {(isProcessing || isStarting) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {!sessionId ? "Démarrer avec ma question" : "Envoyer la question"}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#4966a3] mt-2">
                      {!sessionId
                        ? "La première question sera affichée en premier message du chat."
                        : "La question sera ajoutée en bas du fil et les réponses suivront."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {!isChatFullscreen && (
            <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-white/70">
              <h3 className="font-bold text-[#11204f] mb-3 inline-flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Pilotage
              </h3>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={launchDebate}
                  disabled={!canStart}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[linear-gradient(135deg,#08154a_0%,#123b8f_100%)] text-white text-sm font-semibold disabled:opacity-50 shadow-[0_12px_25px_-16px_rgba(8,21,74,0.75)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Lancer le débat
                </button>

                <button
                  type="button"
                  onClick={respondNext}
                  disabled={!canRespond}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#132655] disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 shadow-sm"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Tour suivant
                </button>

                <button
                  type="button"
                  onClick={finishDebate}
                  disabled={!canFinish}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-900 disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 shadow-sm"
                >
                  <StopCircle className="w-4 h-4" />
                  {mode === "hybride" ? "Passer au juge" : "Terminer + Juge"}
                </button>

                <button
                  type="button"
                  onClick={validateDecision}
                  disabled={!canValidate}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-800 disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Valider affectation
                </button>

                <button
                  type="button"
                  onClick={cancelDebate}
                  disabled={!canCancel}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler débat
                </button>

                <button
                  type="button"
                  onClick={refreshDebate}
                  disabled={!sessionId || isProcessing}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#132655] disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 shadow-sm"
                >
                  <RefreshCcw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  Rafraîchir
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-white/70">
              <h3 className="font-bold text-[#11204f] mb-3 inline-flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Équipe active
              </h3>
              {technicians.length === 0 ? (
                <p className="text-sm text-gray-600">Aucun technicien chargé.</p>
              ) : (
                <div className="space-y-2">
                  {technicians.map((tech) => (
                    <div key={tech.id} className="rounded-xl bg-[#f5f8ff] p-3 border border-[#d7e4ff] shadow-sm">
                      <p className="text-sm font-semibold text-[#11204f]">{tech.nom}</p>
                      <p className="text-xs text-[#4c669e] mt-1">{tech.llm || "LLM non spécifié"}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {sessionId && (
              <section className="rounded-2xl border border-[#d8e8ff] bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] p-4 shadow-sm ring-1 ring-[#e5efff]">
                <h3 className="font-bold text-[#11204f] mb-3 inline-flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Flux du débat
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-3 py-2 shadow-sm">
                    <span>Lancer</span>
                    <span className="font-semibold text-[#11204f]">{sessionId ? "Actif" : "Inactif"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-3 py-2 shadow-sm">
                    <span>Question admin</span>
                    <span className="font-semibold text-[#11204f]">{debateStats.adminQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-3 py-2 shadow-sm">
                    <span>Validation juge</span>
                    <span className="font-semibold text-[#11204f]">{debateStatus === "EN_ATTENTE_VALIDATION" ? "En attente" : debateStatus === "VALIDE" ? "Terminée" : "À venir"}</span>
                  </div>
                </div>
              </section>
            )}
            </aside>
          )}
        </div>

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white/90 backdrop-blur p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70">
          <h2 className="text-xl font-bold text-[#11204f] inline-flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5" />
            Proposition du juge
          </h2>

          {!judgeProposal ? (
            <p className="text-sm text-gray-600">Aucune proposition pour le moment. Termine le débat pour lancer l'évaluation.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 shadow-sm">
                <p className="text-sm text-gray-600">Gagnant proposé</p>
                <p className="text-lg font-bold text-emerald-700">{judgeProposal.gagnant_nom || "Non défini"}</p>
              </div>

              {groupedScores.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#11204f] mb-2">Scores</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {groupedScores.map(([name, score]) => (
                      <div key={name} className="rounded-2xl border border-gray-200 p-3 flex items-center justify-between bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <span className="text-sm font-bold text-[#11204f]">{score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {judgeProposal.justification && (
                <div>
                  <p className="text-sm font-semibold text-[#11204f] mb-1">Justification</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{judgeProposal.justification}</p>
                </div>
              )}

              {judgeProposal.recommandation && (
                <div>
                  <p className="text-sm font-semibold text-[#11204f] mb-1">Recommandation</p>
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