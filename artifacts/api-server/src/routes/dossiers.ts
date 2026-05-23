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
        anciennete: Number(body.anciennete) || 0,
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
