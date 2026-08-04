import { Router, Request, Response } from "express";
import { checkConnection } from "../database/neo4j";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const isDbConnected = await checkConnection();

  if (isDbConnected) {
    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: "degraded",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
