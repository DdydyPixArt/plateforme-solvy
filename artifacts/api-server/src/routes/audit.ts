import { Router } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

export default router;
