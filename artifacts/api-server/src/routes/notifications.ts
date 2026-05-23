import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { userEmail } = req.query as Record<string, string>;
    const rows = await db.select().from(notificationsTable)
      .orderBy(notificationsTable.createdAt);

    const filtered = userEmail
      ? rows.filter(n => n.userEmail === userEmail || n.userEmail === "")
      : rows;

    res.json(filtered.reverse());
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

router.patch("/:id/lue", async (req, res) => {
  try {
    await db.update(notificationsTable).set({ lue: true }).where(eq(notificationsTable.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

router.post("/lue-all", async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (userEmail) {
      await db.update(notificationsTable).set({ lue: true })
        .where(eq(notificationsTable.userEmail, userEmail));
    } else {
      await db.update(notificationsTable).set({ lue: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

export default router;
