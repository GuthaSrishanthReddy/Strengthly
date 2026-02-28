import { CorsOptions } from "cors";
import { env } from "./env";

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or Postman
    if (!origin) return callback(null, true);

    // Allow localhost Vite frontend
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }

    // Production frontend domain (add later)
    if (env.NODE_ENV === "production") {
      // Example:
      // if (origin === "https://yourdomain.com") return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};
