import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { mockDossiers, mockAuditEntries } from "@/data/mockData";

function normalizeDossier(raw: any) {
  return {
    id: raw.id,
    reference: raw.reference,
    status: raw.status,
    score: raw.score ?? null,
    decision: raw.decision ?? null,
    tauxEndettement: raw.tauxEndettement ?? raw.taux_endettement ?? 0,
    capaciteEmprunt: raw.capaciteEmprunt ?? raw.capacite_emprunt ?? 0,
    resteAVivre: raw.resteAVivre ?? raw.reste_a_vivre ?? 0,
    incidents: raw.incidents ?? 0,
    ficp: raw.ficp ?? false,
    fcc: raw.fcc ?? false,
    ppe: raw.ppe ?? false,
    lcbft: raw.lcbft ?? false,
    dateCreation: raw.dateCreation ?? raw.date_creation ?? "",
    conseiller: raw.conseiller ?? "",
    conseillerEmail: raw.conseillerEmail ?? raw.conseiller_email ?? "",
    analysteAssigne: raw.analysteAssigne ?? raw.analyste_assigne ?? null,
    analysteCommentaire: raw.analysteCommentaire ?? raw.analyste_commentaire ?? "",
    transmisAt: raw.transmisAt ?? raw.transmis_at ?? null,
    client: raw.client ?? {},
    situationPro: raw.situationPro ?? raw.situation_pro ?? {},
    finances: raw.finances ?? {},
    demande: raw.demande ?? {},
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    historique: Array.isArray(raw.historique) ? raw.historique : [],
  };
}

export function useDossiers(params?: { status?: string; conseiller?: string; analyste?: string }) {
  return useQuery({
    queryKey: ["dossiers", params],
    queryFn: async () => {
      try {
        const rows = await api.getDossiers(params);
        return rows.map(normalizeDossier);
      } catch {
        return mockDossiers;
      }
    },
    staleTime: 5000,
  });
}

export function usePendingDossiers() {
  return useQuery({
    queryKey: ["dossiers", { analyste: "pending" }],
    queryFn: async () => {
      try {
        const rows = await api.getDossiers({ analyste: "pending" });
        return rows.map(normalizeDossier);
      } catch {
        return mockDossiers.filter(d => d.status === "score_calcule" || d.status === "en_analyse");
      }
    },
    staleTime: 5000,
  });
}

export function useDossier(id: string) {
  return useQuery({
    queryKey: ["dossier", id],
    queryFn: async () => {
      try {
        const raw = await api.getDossier(id);
        return normalizeDossier(raw);
      } catch {
        return normalizeDossier(mockDossiers.find(d => d.id === id) || mockDossiers[0]);
      }
    },
    enabled: !!id,
  });
}

export function useCreateDossier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.createDossier(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dossiers"] }),
  });
}

export function useTransmettreDossier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.transmettreAnalyse(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["dossiers"] });
      qc.invalidateQueries({ queryKey: ["dossier", id] });
    },
  });
}

export function useEnregistrerDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; decision: string; commentaire: string; analyste: string }) =>
      api.enregistrerDecision(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dossiers"] });
    },
  });
}

export function useUpdateDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, documents }: { id: string; documents: any[] }) => api.updateDocuments(id, documents),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["dossiers"] });
      qc.invalidateQueries({ queryKey: ["dossier", id] });
    },
  });
}

export function useNotifications(userEmail?: string) {
  return useQuery({
    queryKey: ["notifications", userEmail],
    queryFn: async () => {
      try {
        return await api.getNotifications(userEmail);
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });
}

export function useMarquerLue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.marquerNotifLue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarquerToutesLues() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userEmail?: string) => api.marquerToutesLues(userEmail),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      try {
        return await api.getAuditLogs();
      } catch {
        return mockAuditEntries;
      }
    },
    staleTime: 15000,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        return await api.getUsers();
      } catch {
        return [];
      }
    },
  });
}
