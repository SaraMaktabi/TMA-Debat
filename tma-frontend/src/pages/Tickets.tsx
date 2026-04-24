import { useEffect, useState } from "react";
import { ticketAPI } from "../api/client";
import { Plus, Search, AlertCircle, Clock, User, Mail, FileText, Zap, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getSession } from "../utils/auth";

export default function Tickets() {
  const navigate = useNavigate();
  const session = getSession();
  const isAdminUser = session?.role === "Admin";
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "track">("track");

  // Form states - adaptés au backend
  // const [companyName, setCompanyName] = useState("");
  // const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState("P3"); // P1, P2, P3, P4
  const [environnement, setEnvironnement] = useState("PROD"); // PROD, RECETTE, DEV
  const [application, setApplication] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options pour les selects
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
      const data = await ticketAPI.list(
        isAdminUser ? undefined : { createdByUserId: session?.id }
      );
      setTickets(data);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Impossible de charger les tickets",
        confirmButtonColor: "#001f3f",
      });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Fonction pour mapper la priorité à un niveau d'urgence pour l'affichage
  const getUrgencyFromPriorite = (priorite: string): string => {
    switch (priorite) {
      case "P1": return "high";
      case "P2": return "high";
      case "P3": return "medium";
      case "P4": return "low";
      default: return "medium";
    }
  };

  // Fonction pour obtenir le libellé du statut
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

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim() || !description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Veuillez remplir tous les champs obligatoires",
        confirmButtonColor: "#001f3f",
      });
      setIsSubmitting(false);
      return;
    }

    // Construction des données au format backend
    const ticketData = {
      titre: title,
      description: description,
      priorite: priorite,
      environnement: environnement,
      application: application,
      created_by_user_id: session?.id,
    };

    console.log("Envoi au backend:", ticketData);

    try {
      const response = await ticketAPI.create(ticketData);
      
      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: " Ticket créé avec succès!",
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

      // Reset form
      setTitle("");
      setDescription("");
      setPriorite("P3");
      setEnvironnement("PROD");
      setApplication("General");
      setActiveTab("track");

      // Recharger les tickets après un délai (pour laisser le temps au scanner de traiter)
      setTimeout(() => {
        fetchTickets();
      }, 2000);
    } catch (error: any) {
      console.error("Erreur:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: error.response?.data?.detail || "Une erreur s'est produite lors de la création du ticket.",
        confirmButtonColor: "#001f3f",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f6f7]">
      <div className="overflow-auto">
      {/* ============ HERO SECTION ============ */}
      <div className="py-8 lg:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-500 mb-4 flex items-center justify-center gap-2">
            <User size={16} />
            Portail Support
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Bienvenue dans le portail de support
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            Créez des tickets de support ou suivez le statut de vos demandes
          </p>
          
          {/* TAB BUTTONS */}
          <div className="flex gap-3 justify-center bg-gray-200 rounded-full p-1.5 w-fit mx-auto shadow-sm">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                activeTab === "create"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <Plus size={18} />
              Créer un nouveau ticket
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                activeTab === "track"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <Search size={18} />
              Suivre les tickets
            </button>
          </div>
        </div>
      </div>

      {/* ============ FORM SECTION ============ */}
      {activeTab === "create" && (
        <div className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
              
              {/* Form Header */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle size={32} className="text-gray-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Créer un ticket de support</h2>
                <p className="text-gray-600">
                  Décrivez votre problème et notre système IA analysera automatiquement votre demande
                </p>
              </div>

              <form onSubmit={createTicket} className="space-y-6">
                
                {/* Company Name & Email */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                      placeholder="Votre entreprise"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div> */}
                  {/* <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      Adresse e-mail *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                      placeholder="vous@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div> */}
                </div>

                {/* Problem Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    Titre du problème *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="ex: L'API retourne des erreurs 500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Priorité & Environnement */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-gray-500" />
                      Priorité *
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900"
                      value={priorite}
                      onChange={(e) => setPriorite(e.target.value)}
                      required
                    >
                      {prioriteOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Environnement *
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900"
                      value={environnement}
                      onChange={(e) => setEnvironnement(e.target.value)}
                      required
                    >
                      {environnementOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Application / Service concerné */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Application / Service concerné *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900"
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    required
                  >
                    {applicationOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                    rows={5}
                    placeholder="Décrivez votre problème en détail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* AI Support Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Zap size={20} className="text-blue-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Support IA activé</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Notre système intelligent analyse automatiquement votre problème et suggère la meilleure solution. 
                      Dans de nombreux cas, nous pouvons résoudre votre problème immédiatement !
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 hover:bg-blue-950 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  {isSubmitting ? "Création en cours..." : "Créer le ticket avec analyse IA"}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============ LIST SECTION ============ */}
      {activeTab === "track" && (
        <div className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-gray-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Vos tickets de support</h2>
              <p className="text-gray-600 text-lg">Suivez l'avancement de vos demandes</p>
            </div>

            {/* Search Bar */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Entrez l'ID du ticket ou l'email..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tickets List */}
            {tickets.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Aucun ticket</h3>
                <p className="text-gray-600 mt-2">Vous n'avez pas encore créé de ticket de support.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tickets.map((ticket, index) => {
                  const ticketId = `TK-${String(index + 1).padStart(3, '0')}`;
                  const urgency = getUrgencyFromPriorite(ticket.priorite);
                  const status = getStatusLabel(ticket.statut);
                  const scoreValue = ticket.score ?? ticket.score_difficulte;
                  
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Card Header */}
                      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono font-bold bg-gray-100 px-3 py-1 rounded text-gray-700">
                              {ticketId}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                                ● {status.label}
                              </span>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                urgency === "high" ? "bg-red-100 text-red-700" : 
                                urgency === "medium" ? "bg-yellow-100 text-yellow-700" : 
                                "bg-green-100 text-green-700"
                              }`}>
                                {urgency === "high" ? "Haute Priorité" : urgency === "medium" ? "Priorité Normale" : "Faible Priorité"}
                              </span>
                            </div>
                          </div>
                          {scoreValue !== null && scoreValue !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Score:</span>
                              <span className={`font-bold text-sm ${
                                scoreValue >= 80 ? 'text-red-600' :
                                scoreValue >= 60 ? 'text-orange-600' :
                                scoreValue >= 40 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {scoreValue}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="px-6 py-6 space-y-4 text-left">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 text-left">{ticket.titre}</h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed text-left">{ticket.description}</p>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-8 py-4 border-t border-b border-gray-200 text-sm text-left">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-gray-500">Créé le:</span>
                            <span className="text-gray-900 font-medium">
                              {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("fr-FR") + " à " + new Date(ticket.created_at).toLocaleTimeString("fr-FR", { 
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-gray-500">Assigné à:</span>
                            {/* <span className="text-gray-900 font-medium">{companyName || "En attente"}</span> */}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-gray-500">Email:</span>
                            {/* <span className="text-blue-600 font-medium">{email}</span> */}
                          </div>
                        </div>

                        {/* Technologies détectées par l'IA */}
                        {ticket.analyse_nlp && ticket.analyse_nlp.technologies && ticket.analyse_nlp.technologies.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-2"> Technologies détectées par l'IA:</p>
                            <div className="flex flex-wrap gap-2">
                              {ticket.analyse_nlp.technologies.map((tech: string, i: number) => (
                                <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Solution Suggestion */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-left">
                          <Zap size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-sm"> Suggestion IA</p>
                            <p className="text-gray-600 text-xs mt-1">
                              {ticket.priorite === "P1" 
                                ? " Problème critique détecté. Recommande une investigation immédiate des logs et des ressources système."
                                : ticket.priorite === "P2"
                                ? " Priorité élevée. Vérification des configurations et des changements récents recommandée."
                                : ticket.priorite === "P3"
                                ? " Traitement standard. Analyse automatique en cours."
                                : " Priorité faible. Planification de maintenance recommandée."}
                            </p>
                          </div>
                        </div>

                        {/* Application Badge */}
                        <div className="pt-2 text-left">
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                            {ticket.application || application}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold ml-2">
                            {ticket.environnement || environnement}
                          </span>
                        </div>

                        {/* View Details Button */}
                        <div className="pt-4">
                          <button
                            onClick={() => navigate(`/ticket/${ticket.id}`)}
                            className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <Search size={16} />
                            Voir les détails et résultats IA
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}