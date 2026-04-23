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

// ===== API USERS =====
export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
  joinDate: string | null;
  lastActive: string;
}

export interface UserCreatePayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  department: string;
  phone: string;
}

export interface UserUpdatePayload {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: string;
  department: string;
  phone: string;
}

export interface AuthLoginResponse {
  message: string;
  user: UserDto;
}

export const userAPI = {
  list: async (): Promise<UserDto[]> => {
    const response = await api.get("/api/users");
    return response.data;
  },

  create: async (payload: UserCreatePayload): Promise<UserDto> => {
    const response = await api.post("/api/users", payload);
    return response.data;
  },

  update: async (id: string, payload: UserUpdatePayload): Promise<UserDto> => {
    const response = await api.put(`/api/users/${id}`, payload);
    return response.data;
  },

  updateStatus: async (id: string, status: "Active" | "Inactive"): Promise<UserDto> => {
    const response = await api.patch(`/api/users/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },

  login: async (email: string, password: string): Promise<AuthLoginResponse> => {
    const response = await api.post("/api/users/login", { email, password });
    return response.data;
  },
};