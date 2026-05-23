import { Router } from "express";
import { db, usersTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(usersTable);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

export default router;
