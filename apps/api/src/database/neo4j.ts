import neo4j, { Driver } from "neo4j-driver";
import { config } from "../config";
import pino from "pino";

const logger = pino({ name: "neo4j" });

let driver: Driver | null = null;

export const getDriver = (): Driver => {
  if (!driver) {
    try {
      driver = neo4j.driver(
        config.COGNODB_URI,
        neo4j.auth.basic(config.COGNODB_USERNAME, config.COGNODB_PASSWORD),
        {
          maxConnectionPoolSize: 50,
          connectionTimeout: 10000, // 10 seconds
          logging: {
            level: "info",
            logger: (level, message) => logger.info(`[${level}] ${message}`),
          },
        }
      );
      logger.info("✅ Neo4j/CognoDB driver initialized.");
    } catch (err) {
      logger.error(err, '❌ Failed to initialize Neo4j/CognoDB driver');
      throw err;
    }
  }
  return driver;
};

export const closeDriver = async () => {
  if (driver) {
    await driver.close();
    driver = null;
    logger.info("🛑 Neo4j/CognoDB driver closed.");
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    const d = getDriver();
    const serverInfo = await d.getServerInfo();
    return !!serverInfo;
  } catch (error) {
    logger.error(error, 'Database connection check failed');
    return false;
  }
};
