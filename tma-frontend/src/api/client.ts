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
    created_by_user_id?: string;
  }) => {
    const response = await api.post("/api/tickets/", ticketData);
    return response.data;
  },

  // Récupérer tous les tickets
  list: async (params?: { createdByUserId?: string }) => {
    const response = await api.get("/api/tickets/", {
      params: {
        created_by_user_id: params?.createdByUserId,
      },
    });
    return response.data;
  },

  // Mettre à jour le statut d'un ticket
  updateStatus: async (
    id: string,
    statut: "OUVERT" | "EN_ANALYSE" | "AFFECTE" | "RESOLU",
    params?: { requesterUserId?: string; requesterRole?: string }
  ) => {
    const response = await api.patch(
      `/api/tickets/${id}/status`,
      { statut },
      {
        params: {
          requester_user_id: params?.requesterUserId,
          requester_role: params?.requesterRole,
        },
      }
    );
    return response.data as {
      message: string;
      ticket_id: string;
      statut: string;
      technicien_assigne_id?: string | null;
    };
  },

  // Récupérer un ticket spécifique
  getById: async (id: string, params?: { requesterUserId?: string; requesterRole?: string }) => {
    const response = await api.get(`/api/tickets/${id}`, {
      params: {
        requester_user_id: params?.requesterUserId,
        requester_role: params?.requesterRole,
      },
    });
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

  // Affecter directement un technicien à un ticket (sans débat)
  assignTechnician: async (
    id: string,
    payload: { technicien_id: string; admin_nom?: string; raison?: string }
  ) => {
    const response = await api.post(`/api/tickets/${id}/assign`, payload);
    return response.data as {
      message: string;
      ticket_id: string;
      technicien_assigne_id: string;
      technicien_nom: string;
      valide_par: string;
      raison: string;
    };
  },

  // Supprimer un ticket (admin uniquement)
  delete: async (id: string, params?: { requesterRole?: string }) => {
    await api.delete(`/api/tickets/${id}`, {
      params: {
        requester_role: params?.requesterRole,
      },
    });
  },
};

export type DebateMode = "classique" | "hybride";

export interface DebateTechnician {
  id: string;
  nom: string;
  llm?: string;
}

export interface DebateMessage {
  agent_id?: string;
  agent_nom: string;
  contenu: string;
  tour?: number;
  timestamp?: string;
  llm?: string;
  type?: "admin_question" | "agent_reponse" | string;
  en_reponse_a?: string;
}

export interface DebateJudgeProposal {
  gagnant_id?: string;
  gagnant_nom?: string;
  scores?: Record<string, number>;
  justification?: string;
  recommandation?: string;
  [key: string]: unknown;
}

export const debatAPI = {
  lancer: async (
    ticketId: string,
    mode: DebateMode = "classique",
    options?: { skipInitialMessage?: boolean }
  ) => {
    const endpoint = mode === "hybride" ? `/api/debat/lancer-hybride/${ticketId}` : `/api/debat/lancer/${ticketId}`;
    const response = await api.post(endpoint, null, {
      params:
        mode === "hybride"
          ? { skip_initial_message: options?.skipInitialMessage ?? false }
          : undefined,
    });
    return response.data as {
      session_id: string;
      type: string;
      ticket_id: string;
      ticket_titre: string;
      techniciens: DebateTechnician[];
      historique: DebateMessage[];
    };
  },

  get: async (sessionId: string) => {
    const response = await api.get(`/api/debat/${sessionId}`);
    return response.data as {
      session_id: string;
      type: string;
      statut: string;
      historique: DebateMessage[];
      proposition_juge?: DebateJudgeProposal | null;
      est_termine: boolean;
    };
  },

  repondre: async (sessionId: string, mode: DebateMode = "classique") => {
    const endpoint = mode === "hybride" ? `/api/debat/hybride/${sessionId}/repondre` : `/api/debat/${sessionId}/repondre`;
    const response = await api.post(endpoint);
    return response.data as {
      agent?: string;
      llm?: string;
      message?: string;
      tour?: number;
      historique: DebateMessage[];
      est_termine?: boolean;
    };
  },

  question: async (sessionId: string, payload: { question: string }, mode: DebateMode = "classique") => {
    const endpoint = mode === "hybride" ? `/api/debat/hybride/${sessionId}/question` : `/api/debat/${sessionId}/question`;
    const response = await api.post(endpoint, payload);
    return response.data as {
      question: string;
      reponses: DebateMessage[];
      messages_interactifs?: DebateMessage[];
      historique?: DebateMessage[];
    };
  },

  continuer: async (sessionId: string, mode: DebateMode = "classique") => {
    const endpoint = mode === "hybride" ? `/api/debat/hybride/${sessionId}/continue` : `/api/debat/${sessionId}/repondre`;
    const response = await api.post(endpoint);
    return response.data as {
      agent?: string;
      llm?: string;
      message?: string;
      tour?: number;
      historique: DebateMessage[];
      est_termine?: boolean;
    };
  },

  juge: async (sessionId: string, mode: DebateMode = "classique") => {
    const endpoint = mode === "hybride" ? `/api/debat/hybride/${sessionId}/juge` : `/api/debat/${sessionId}/terminer`;
    const response = await api.post(endpoint);
    return response.data as {
      proposition?: DebateJudgeProposal;
      historique?: DebateMessage[];
      historique_complet?: DebateMessage[];
    };
  },

  terminer: async (sessionId: string, mode: DebateMode = "classique") => {
    return debatAPI.juge(sessionId, mode);
  },

  valider: async (
    sessionId: string,
    decision: { technicien_id?: string; technicien_nom?: string; admin_nom?: string; raison?: string },
    mode: DebateMode = "classique"
  ) => {
    const endpoint = mode === "hybride" ? `/api/debat/hybride/${sessionId}/valider_final` : `/api/debat/${sessionId}/valider`;
    const response = await api.post(endpoint, decision);
    return response.data as { message: string };
  },

  annuler: async (sessionId: string, mode: DebateMode = "classique") => {
    const endpoint = mode === "hybride" ? `/api/debat/hybride/${sessionId}/annuler` : `/api/debat/${sessionId}/annuler`;
    const response = await api.post(endpoint);
    return response.data as { message: string };
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
  cv_texte: string;
  competences: string;
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

  register: async (payload: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
  }): Promise<AuthLoginResponse> => {
    const response = await api.post("/api/users/register", {
      email: payload.email,
      password: payload.password,
      nom: payload.nom,
      prenom: payload.prenom,
      phone: "",
      department: "Client",
      role: "Client",
      cv_texte: "",
      competences: "",
    });
    return response.data;
  },
};