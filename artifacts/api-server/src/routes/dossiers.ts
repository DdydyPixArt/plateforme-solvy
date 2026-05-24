import { Router } from "express";
import { db, dossiersTable, notificationsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function nowDate() {
  return new Date().toISOString().split("T")[0];
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}
function nowDateTime() {
  const d = new Date();
  return `${d.toISOString().split("T")[0]} ${d.toTimeString().slice(0, 5)}`;
}

function generateRef() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `DOS-${year}-${num}`;
}

function generateId() {
  return `d${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function generateAuditId() {
  return `a${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function generateNotifId() {
  return `n${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

router.get("/", async (req, res) => {
  try {
    const { status, conseiller, analyste } = req.query as Record<string, string>;
    let query = db.select().from(dossiersTable).orderBy(desc(dossiersTable.createdAt));
    const rows = await query;

    let filtered = rows;
    if (status) filtered = filtered.filter(d => d.status === status);
    if (conseiller) filtered = filtered.filter(d => d.conseillerEmail === conseiller || d.conseiller === conseiller);
    if (analyste === "pending") {
      filtered = filtered.filter(d =>
        (d.status === "score_calcule" || d.status === "en_analyse") && d.transmisAt != null
      );
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des dossiers" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rows = await db.select().from(dossiersTable).where(eq(dossiersTable.id, req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: "Dossier introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const id = generateId();
    const reference = generateRef();
    const now = nowDate();

    const revenusNets = Number(body.revenusNets) || 0;
    const chargesFixes = Number(body.chargesFixes) || 0;
    const creditsEnCours = Number(body.creditsEnCours) || 0;
    const autresRevenus = Number(body.autresRevenus) || 0;
    const totalCharges = chargesFixes + creditsEnCours;
    const tauxEndettement = revenusNets > 0 ? Math.round((totalCharges / revenusNets) * 1000) / 10 : 0;
    const capaciteEmprunt = Math.max(0, revenusNets * 0.33 - creditsEnCours);
    const resteAVivre = revenusNets + autresRevenus - totalCharges;

    const allDocsMissing = (body.documents || []).every((d: any) => d.statut === "manquant");
    const anyMissing = (body.documents || []).some((d: any) => d.statut === "manquant");
    const status = anyMissing ? "incomplet" : "score_calcule";

    const historique = [
      { date: nowDateTime(), utilisateur: body.conseiller || "Conseiller", action: "Création du dossier", statut: "Créé" }
    ];

    const dossier = {
      id,
      reference,
      status,
      score: null as null,
      decision: null as null,
      tauxEndettement,
      capaciteEmprunt,
      resteAVivre,
      incidents: 0,
      ficp: false,
      fcc: false,
      ppe: false,
      lcbft: true,
      dateCreation: now,
      conseiller: body.conseiller || "",
      conseillerEmail: body.conseillerEmail || "",
      analysteAssigne: null as null,
      analysteCommentaire: null as null,
      transmisAt: null as null,
      client: {
        id: `c${Date.now()}`,
        nom: body.nom || "",
        prenom: body.prenom || "",
        dateNaissance: body.dateNaissance || "",
        adresse: body.adresse || "",
        ville: body.ville || "",
        codePostal: body.codePostal || "",
        situationFamiliale: body.situationFamiliale || "Célibataire",
        personnesCharge: Number(body.personnesCharge) || 0,
        telephone: body.telephone || "",
        email: body.emailClient || "",
      },
      situationPro: {
        statut: body.statut || "CDI",
        employeur: body.employeur || "",
        secteur: body.secteur || "",
        ancienneteMois: (Number(body.ancienneteAns) || 0) * 12 + (Number(body.ancienneteMois) || 0),
        anciennete: (Number(body.ancienneteAns) || 0) + ((Number(body.ancienneteMois) || 0) / 12),
        poste: body.poste || "",
      },
      finances: { revenusNets, autresRevenus, chargesFixes, creditsEnCours },
      demande: {
        montant: Number(body.montant) || 0,
        duree: Number(body.duree) || 0,
        objet: body.objet || "",
        apport: Number(body.apport) || 0,
        garant: body.garant === "Oui",
        valeurActif: Number(body.valeurActif) || 0,
      },
      documents: body.documents || [],
      historique,
    };

    await db.insert(dossiersTable).values(dossier);

    await db.insert(auditLogsTable).values({
      id: generateAuditId(),
      date: nowDate(),
      heure: nowTime(),
      utilisateur: body.conseiller || "Conseiller",
      role: "Conseiller bancaire",
      dossierRef: reference,
      action: "Création dossier client",
      statut: "info",
      details: `Nouveau dossier créé: ${body.prenom} ${body.nom}`,
    });

    res.status(201).json(dossier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création du dossier" });
  }
});

router.post("/:id/transmettre", async (req, res) => {
  try {
    const rows = await db.select().from(dossiersTable).where(eq(dossiersTable.id, req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = rows[0];
    const now = nowDateTime();
    const historique = Array.isArray(dossier.historique) ? [...(dossier.historique as any[])] : [];
    historique.push({ date: now, utilisateur: dossier.conseiller, action: "Dossier transmis à l'analyse risque", statut: "Transmis" });

    await db.update(dossiersTable).set({
      status: "en_analyse",
      transmisAt: now,
      historique,
      updatedAt: new Date(),
    }).where(eq(dossiersTable.id, req.params.id));

    await db.insert(auditLogsTable).values({
      id: generateAuditId(),
      date: nowDate(),
      heure: nowTime(),
      utilisateur: dossier.conseiller,
      role: "Conseiller bancaire",
      dossierRef: dossier.reference,
      action: "Transmission à l'analyse risque",
      statut: "info",
      details: `Dossier ${dossier.reference} transmis pour analyse`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

router.post("/:id/decision", async (req, res) => {
  try {
    const { decision, commentaire, analyste, analysteEmail } = req.body;
    const rows = await db.select().from(dossiersTable).where(eq(dossiersTable.id, req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = rows[0];
    const now = nowDateTime();
    const historique = Array.isArray(dossier.historique) ? [...(dossier.historique as any[])] : [];

    const decisionLabel = decision === "accord" ? "Accord" : decision === "refus" ? "Refus" : "Accord sous conditions";
    historique.push({ date: now, utilisateur: analyste, action: `Décision: ${decisionLabel}`, statut: "Finalisé" });

    await db.update(dossiersTable).set({
      status: "decision_rendue",
      decision,
      analysteAssigne: analyste,
      analysteCommentaire: commentaire,
      historique,
      updatedAt: new Date(),
    }).where(eq(dossiersTable.id, req.params.id));

    await db.insert(notificationsTable).values({
      id: generateNotifId(),
      type: "decision",
      titre: `Décision reçue — ${decisionLabel} — ${dossier.reference}`,
      message: `L'analyste ${analyste} a émis une décision sur le dossier ${dossier.reference}. ${decisionLabel}${commentaire ? ` — ${commentaire.slice(0, 100)}` : ""}`,
      dossierRef: dossier.reference,
      dossierId: dossier.id,
      userEmail: dossier.conseillerEmail || "",
      lue: false,
      date: now,
    });

    await db.insert(auditLogsTable).values({
      id: generateAuditId(),
      date: nowDate(),
      heure: nowTime(),
      utilisateur: analyste,
      role: "Analyste risque",
      dossierRef: dossier.reference,
      action: `Décision émise: ${decisionLabel}`,
      statut: decision === "refus" ? "error" : "success",
      details: commentaire ? commentaire.slice(0, 200) : `Décision ${decisionLabel} enregistrée`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const rows = await db.select().from(dossiersTable).where(eq(dossiersTable.id, req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: "Dossier introuvable" });

    const current = rows[0];

    if (current.decision) {
      return res.status(403).json({ error: "Ce dossier a déjà une décision finale et ne peut plus être modifié." });
    }

    const body = req.body;
    const revenusNets = body.revenusNets !== undefined ? Number(body.revenusNets) : (current.finances as any)?.revenusNets ?? 0;
    const chargesFixes = body.chargesFixes !== undefined ? Number(body.chargesFixes) : (current.finances as any)?.chargesFixes ?? 0;
    const creditsEnCours = body.creditsEnCours !== undefined ? Number(body.creditsEnCours) : (current.finances as any)?.creditsEnCours ?? 0;
    const autresRevenus = body.autresRevenus !== undefined ? Number(body.autresRevenus) : (current.finances as any)?.autresRevenus ?? 0;
    const totalCharges = chargesFixes + creditsEnCours;
    const tauxEndettement = revenusNets > 0 ? Math.round((totalCharges / revenusNets) * 1000) / 10 : 0;
    const capaciteEmprunt = Math.max(0, revenusNets * 0.33 - creditsEnCours);
    const resteAVivre = revenusNets + autresRevenus - totalCharges;

    const ancienneteTotalMois = (Number(body.ancienneteAns) || 0) * 12 + (Number(body.ancienneteMois) || 0);
    const ancienneteLegacy = (Number(body.ancienneteAns) || 0) + ((Number(body.ancienneteMois) || 0) / 12);

    const client = {
      ...(current.client as any),
      nom: body.nom ?? (current.client as any)?.nom,
      prenom: body.prenom ?? (current.client as any)?.prenom,
      dateNaissance: body.dateNaissance ?? (current.client as any)?.dateNaissance,
      adresse: body.adresse ?? (current.client as any)?.adresse,
      ville: body.ville ?? (current.client as any)?.ville,
      codePostal: body.codePostal ?? (current.client as any)?.codePostal,
      situationFamiliale: body.situationFamiliale ?? (current.client as any)?.situationFamiliale,
      personnesCharge: body.personnesCharge !== undefined ? Number(body.personnesCharge) : (current.client as any)?.personnesCharge,
      telephone: body.telephone ?? (current.client as any)?.telephone ?? "",
      email: body.emailClient ?? (current.client as any)?.email ?? "",
    };

    const situationPro = {
      ...(current.situationPro as any),
      statut: body.statut ?? (current.situationPro as any)?.statut,
      employeur: body.employeur ?? (current.situationPro as any)?.employeur,
      secteur: body.secteur ?? (current.situationPro as any)?.secteur,
      poste: body.poste ?? (current.situationPro as any)?.poste,
      ...(body.ancienneteAns !== undefined || body.ancienneteMois !== undefined ? {
        ancienneteMois: ancienneteTotalMois,
        anciennete: ancienneteLegacy,
      } : {}),
    };

    const finances = { revenusNets, autresRevenus, chargesFixes, creditsEnCours };
    const demande = {
      ...(current.demande as any),
      montant: body.montant !== undefined ? Number(body.montant) : (current.demande as any)?.montant,
      duree: body.duree !== undefined ? Number(body.duree) : (current.demande as any)?.duree,
      objet: body.objet ?? (current.demande as any)?.objet,
      apport: body.apport !== undefined ? Number(body.apport) : (current.demande as any)?.apport,
      garant: body.garant !== undefined ? (body.garant === "Oui" || body.garant === true) : (current.demande as any)?.garant,
      valeurActif: body.valeurActif !== undefined ? Number(body.valeurActif) : (current.demande as any)?.valeurActif,
    };

    const documents = body.documents !== undefined ? body.documents : current.documents;
    const anyMissing = (documents as any[]).some((d: any) => d.statut === "manquant");
    const newStatus = current.status === "en_analyse" ? "en_analyse" : anyMissing ? "incomplet" : (current.score ? "score_calcule" : "incomplet");

    const now = nowDateTime();
    const historique = Array.isArray(current.historique) ? [...(current.historique as any[])] : [];
    historique.push({ date: now, utilisateur: body.modifiedBy || current.conseiller, action: "Dossier modifié par le conseiller", statut: "Modifié" });

    await db.update(dossiersTable).set({
      tauxEndettement,
      capaciteEmprunt,
      resteAVivre,
      client,
      situationPro,
      finances,
      demande,
      documents,
      historique,
      status: newStatus,
      updatedAt: new Date(),
    }).where(eq(dossiersTable.id, req.params.id));

    await db.insert(auditLogsTable).values({
      id: generateAuditId(),
      date: nowDate(),
      heure: nowTime(),
      utilisateur: body.modifiedBy || current.conseiller,
      role: "Conseiller bancaire",
      dossierRef: current.reference,
      action: "Modification dossier client",
      statut: "info",
      details: `Dossier ${current.reference} modifié`,
    });

    const updated = await db.select().from(dossiersTable).where(eq(dossiersTable.id, req.params.id));
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

router.patch("/:id/documents", async (req, res) => {
  try {
    const { documents } = req.body;
    const rows = await db.select().from(dossiersTable).where(eq(dossiersTable.id, req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: "Dossier introuvable" });

    const anyMissing = documents.some((d: any) => d.statut === "manquant");
    const status = anyMissing ? "incomplet" : (rows[0].score ? "score_calcule" : "incomplet");

    await db.update(dossiersTable).set({ documents, status, updatedAt: new Date() })
      .where(eq(dossiersTable.id, req.params.id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

export default router;
