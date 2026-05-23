import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dossiersRouter from "./dossiers";
import notificationsRouter from "./notifications";
import auditRouter from "./audit";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dossiers", dossiersRouter);
router.use("/notifications", notificationsRouter);
router.use("/audit", auditRouter);
router.use("/users", usersRouter);

export default router;
