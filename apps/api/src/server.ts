import app from "./app";
import { config } from "./config";
import { closeDriver, getDriver } from "./database/neo4j";
import pino from "pino";

const logger = pino({ name: "server" });

const startServer = () => {
  try {
    // Initialize DB connection
    getDriver();

    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${config.PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await closeDriver();
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
