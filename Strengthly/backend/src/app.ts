import express from "express";
import cors from "cors";
import morgan from "morgan";

import { corsConfig } from "./config/cors";
import { rateLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler } from "./middleware/error.middleware";
import routes from "./routes/index";

const app = express();

/* -------------------- Global Middleware -------------------- */

// CORS
app.use(cors(corsConfig));

// Rate limiting
app.use(rateLimiter);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan("dev"));

/* -------------------- Health Check -------------------- */

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Fitness Tracker API is running",
  });
});

/* -------------------- API Routes -------------------- */

app.use("/api", routes);

/* -------------------- 404 Handler -------------------- */

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* -------------------- Global Error Handler -------------------- */

app.use(errorHandler);

export default app;
