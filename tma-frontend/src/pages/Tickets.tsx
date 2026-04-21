import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Plus, Search, AlertCircle, CheckCircle, Clock, User, Mail, FileText, Zap, MessageCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "track">("track");

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sélect a category");
  const [urgency, setUrgency] = useState("medium");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    const res = await api.get("/tickets");
    setTickets(res.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/tickets", {
        companyName,
        email,
        title,
        category,
        urgency,
        description,
      });

      // Show success message with SweetAlert
      Swal.fire({
        icon: "success",
        title: "Ticket créé avec succès!",
        text: "Votre ticket de support a été créé et enregistré dans la base de données.",
        confirmButtonColor: "#001f3f",
        confirmButtonText: "OK",
      });

      setCompanyName("");
      setEmail("");
      setTitle("");
      setCategory("Sélect a category");
      setUrgency("medium");
      setDescription("");
      setActiveTab("track");

      fetchTickets();
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Une erreur s'est produite lors de la création du ticket.",
        confirmButtonColor: "#001f3f",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-blue-900" />
            <span className="font-semibold text-xl text-gray-900">TMA System</span>
          </div>
          <a href="/" className="px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
            Accueil
          </a>
        </div>
      </nav>
      
      {/* ============ HERO SECTION ============ */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 py-8 lg:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-500 mb-4 flex items-center justify-center gap-2">
            <User size={16} />
            Customer Portal Demo
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
                  Décrivez votre problème et notre système IA trouvera automatiquement la meilleure solution
                </p>
              </div>

              <form onSubmit={createTicket} className="space-y-6">
                
                {/* Company Name & Email */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                      placeholder="Your Company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      Adresse e-mail *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
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
                    placeholder="e.g. Email not working"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Category & Urgency */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Catégorie
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Sélect a category</option>
                      <option>Technical Support</option>
                      <option>Billing</option>
                      <option>General Inquiry</option>
                      <option>Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-gray-500" />
                      Urgence
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="low">Faible - Traitement normal</option>
                      <option value="medium">Moyen - Traitement normal</option>
                      <option value="high">Élevé - Priorité</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-blue-900 outline-none transition text-gray-900 placeholder-gray-400"
                    rows={5}
                    placeholder="Please describe your problem in as much detail as possible..."
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
                  {isSubmitting ? "Création..." : "Créer un ticket avec analyse IA"}
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
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Your Support Tickets</h2>
              <p className="text-gray-600 text-lg">Track the progress of your requests</p>
            </div>

            {/* Search Bar */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter Ticket ID or Email..."
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
                {tickets.map((t, index) => {
                  const ticketId = `TK-${String(index + 1).padStart(3, '0')}`;
                  const statusMap: { [key: string]: { label: string; color: string } } = {
                    high: { label: "High", color: "bg-red-100 text-red-700" },
                    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
                    low: { label: "Low", color: "bg-green-100 text-green-700" }
                  };
                  
                  const status = statusMap[t.urgency] || statusMap.medium;
                  
                  return (
                    <div
                      key={t.id}
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
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                t.urgency === "high" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                              }`}>
                                ● {t.urgency === "high" ? "Open" : t.urgency === "medium" ? "In Progress" : "Resolved"}
                              </span>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="px-6 py-6 space-y-4 text-left">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 text-left">{t.title}</h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed text-left">{t.description}</p>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-8 py-4 border-t border-b border-gray-200 text-sm text-left">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-gray-500">Created:</span>
                            <span className="text-gray-900 font-medium">
                              {t.created_at ? new Date(t.created_at).toLocaleDateString("de-DE") + " " + new Date(t.created_at).toLocaleTimeString("de-DE", { 
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-gray-500">Assignee:</span>
                            <span className="text-gray-900 font-medium">{t.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-gray-500">Email:</span>
                            <span className="text-blue-600 font-medium">{t.email}</span>
                          </div>
                        </div>

                        {/* AI Solution Suggestion */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-left">
                          <Zap size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-sm">AI Solution Suggestion</p>
                            <p className="text-gray-600 text-xs mt-1">
                              {t.urgency === "high" 
                                ? "Priority issue detected. Recommend immediate investigation of system resources and error logs."
                                : t.urgency === "medium"
                                ? "Standard processing: Review configuration and recent changes. Automated workflow initiated."
                                : "Low priority: Schedule maintenance check and document findings for reference."}
                            </p>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="pt-2 text-left">
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                            {t.category}
                          </span>
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
  );
}