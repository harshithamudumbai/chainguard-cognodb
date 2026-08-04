import { z } from "zod";
import dotenv from "dotenv";

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  COGNODB_URI: z.string().url(),
  COGNODB_USERNAME: z.string().min(1),
  COGNODB_PASSWORD: z.string().min(1),
  COGNODB_DATABASE: z.string().default("neo4j"),
  PORT: z.string().transform((p) => parseInt(p, 10)).default("4000"),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
