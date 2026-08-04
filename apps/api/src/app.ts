import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/error";
import healthRoutes from "./routes/health";
import dashboardRoutes from "./routes/dashboard";
import productRoutes from "./routes/products";
import riskRoutes from "./routes/risks";
import supplierRoutes from "./routes/suppliers";
import pathRoutes from "./routes/paths";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.WEB_ORIGIN,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/risks", riskRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/paths", pathRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
