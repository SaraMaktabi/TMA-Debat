import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Plus, Search, AlertCircle, CheckCircle, Clock, User, Mail, FileText, Zap, MessageCircle } from "lucide-react";

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

      setCompanyName("");
      setEmail("");
      setTitle("");
      setCategory("Sélect a category");
      setUrgency("medium");
      setDescription("");
      setActiveTab("track");

      fetchTickets();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white">
      
      {/* ============ HERO SECTION ============ */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 py-20 px-4">
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
          <div className="max-w-4xl mx-auto">
            
            {tickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Aucun ticket</h3>
                <p className="text-gray-600 mt-2">Vous n'avez pas encore créé de ticket de support.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText size={18} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{t.title}</h3>
                            <p className="text-gray-600 mt-1 text-sm">{t.description}</p>
                            <div className="flex gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {t.companyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {t.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 ${
                            t.urgency === "high"
                              ? "bg-red-100 text-red-700"
                              : t.urgency === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {t.urgency === "high"
                            ? <AlertCircle size={14} />
                            : t.urgency === "medium"
                            ? <Clock size={14} />
                            : <CheckCircle size={14} />}
                          {t.urgency === "high"
                            ? "Élevé"
                            : t.urgency === "medium"
                            ? "Moyen"
                            : "Faible"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}