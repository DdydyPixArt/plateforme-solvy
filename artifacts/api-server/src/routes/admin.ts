import { Router } from "express";
import { db, dossiersTable, notificationsTable, auditLogsTable, usersTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [dossiersRow] = await db.select({ c: count() }).from(dossiersTable);
    const [usersRow] = await db.select({ c: count() }).from(usersTable);
    const [notifsRow] = await db.select({ c: count() }).from(notificationsTable);
    const [auditRow] = await db.select({ c: count() }).from(auditLogsTable);

    const allDossiers = await db.select().from(dossiersTable);
    const incomplets = allDossiers.filter(d => d.status === "incomplet").length;
    const sansDécision = allDossiers.filter(d =>
      d.status === "en_analyse" || d.status === "score_calcule"
    ).length;
    const sansScore = allDossiers.filter(d => !d.score).length;
    const sansEmail = allDossiers.filter(d => !(d.client as any)?.email).length;
    const sansTelephone = allDossiers.filter(d => !(d.client as any)?.telephone).length;
    const docsManquants = allDossiers.filter(d =>
      (d.documents as any[]).some((doc: any) => doc.statut === "manquant")
    ).length;
    const totalDocuments = allDossiers.reduce((s, d) => s + (d.documents as any[]).length, 0);
    const decisionsCount = allDossiers.filter(d => d.decision !== null).length;
    const scoresCount = allDossiers.filter(d => d.score !== null).length;

    res.json({
      tables: {
        dossiers: Number(dossiersRow.c),
        users: Number(usersRow.c),
        notifications: Number(notifsRow.c),
        auditLogs: Number(auditRow.c),
        clients: Number(dossiersRow.c),
        documents: totalDocuments,
        scores: scoresCount,
        decisions: decisionsCount,
      },
      quality: {
        dossiersIncomplets: incomplets,
        emailsManquants: sansEmail,
        telephonesManquants: sansTelephone,
        documentsManquants: docsManquants,
        scoresNonCalcules: sansScore,
        decisionsNonRenseignees: sansDécision,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur stats admin" });
  }
});

export default router;
