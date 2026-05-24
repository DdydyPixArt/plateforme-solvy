import type { Dossier } from "@/data/mockData";

const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getDossiers(params?: { status?: string; conseiller?: string; analyste?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.conseiller) query.set("conseiller", params.conseiller);
  if (params?.analyste) query.set("analyste", params.analyste);
  const qs = query.toString();
  return apiFetch<any[]>(`/dossiers${qs ? `?${qs}` : ""}`);
}

export function getDossier(id: string) {
  return apiFetch<any>(`/dossiers/${id}`);
}

export function createDossier(data: Record<string, any>) {
  return apiFetch<any>("/dossiers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDossier(id: string, data: Record<string, any>) {
  return apiFetch<any>(`/dossiers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function transmettreAnalyse(id: string) {
  return apiFetch<{ success: boolean }>(`/dossiers/${id}/transmettre`, { method: "POST" });
}

export function enregistrerDecision(id: string, data: { decision: string; commentaire: string; analyste: string; analysteEmail?: string }) {
  return apiFetch<{ success: boolean }>(`/dossiers/${id}/decision`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDocuments(id: string, documents: any[]) {
  return apiFetch<{ success: boolean }>(`/dossiers/${id}/documents`, {
    method: "PATCH",
    body: JSON.stringify({ documents }),
  });
}

export function getNotifications(userEmail?: string) {
  const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : "";
  return apiFetch<any[]>(`/notifications${query}`);
}

export function marquerNotifLue(id: string) {
  return apiFetch<{ success: boolean }>(`/notifications/${id}/lue`, { method: "PATCH" });
}

export function marquerToutesLues(userEmail?: string) {
  return apiFetch<{ success: boolean }>("/notifications/lue-all", {
    method: "POST",
    body: JSON.stringify({ userEmail }),
  });
}

export function getAuditLogs() {
  return apiFetch<any[]>("/audit");
}

export function getUsers() {
  return apiFetch<any[]>("/users");
}

export function getAdminStats() {
  return apiFetch<any>("/admin/stats");
}

export function normalizeDossier(raw: any): Dossier {
  return {
    id: raw.id,
    reference: raw.reference,
    status: raw.status,
    score: raw.score,
    decision: raw.decision,
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
    analysteCommentaire: raw.analysteCommentaire ?? raw.analyste_commentaire ?? "",
    transmisAt: raw.transmisAt ?? raw.transmis_at ?? null,
    client: raw.client ?? {},
    situationPro: raw.situationPro ?? raw.situation_pro ?? {},
    finances: raw.finances ?? {},
    demande: raw.demande ?? {},
    documents: raw.documents ?? [],
    historique: raw.historique ?? [],
  } as Dossier & { transmisAt?: string | null };
}
