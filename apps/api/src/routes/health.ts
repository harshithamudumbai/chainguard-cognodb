import { Router, Request, Response } from "express";
import { checkConnection } from "../database/neo4j";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const isDbConnected = await checkConnection();

  if (isDbConnected) {
    res.status(200).json({
      data: {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      }
    });
  } else {
    res.status(503).json({
      data: {
        status: "degraded",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database connection failed"
      }
    });
  }
});

export default router;
