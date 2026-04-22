import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ===== API TICKETS =====
export const ticketAPI = {
  // Créer un ticket
  create: async (ticketData: {
    titre: string;
    description: string;
    priorite: string;
    environnement: string;
    application: string;
  }) => {
    const response = await api.post("/api/tickets", ticketData);
    return response.data;
  },

  // Récupérer tous les tickets
  list: async () => {
    const response = await api.get("/api/tickets");
    return response.data;
  },

  // Récupérer un ticket spécifique
  getById: async (id: string) => {
    const response = await api.get(`/api/tickets/${id}`);
    return response.data;
  },

  // Get ticket score (si besoin de recalculer)
  recalculateScore: async (id: string) => {
    const response = await api.post(`/api/tickets/${id}/score`);
    return response.data;
  },

  // Récupérer les recommandations de techniciens
  getRecommendations: async (id: string) => {
    const response = await api.get(`/api/tickets/${id}/recommandations`);
    return response.data;
  },

  // Relancer l'analyse d'un ticket
  reanalyzeTicket: async (id: string) => {
    const response = await api.post(`/api/tickets/${id}/reanalyze`);
    return response.data;
  },

  // Relancer l'analyse sur tous les tickets en attente
  reanalyzeAllPending: async () => {
    const response = await api.post(`/api/tickets/reanalyze-all/pending`);
    return response.data;
  },
};