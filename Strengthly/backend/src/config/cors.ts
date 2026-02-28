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

    // Allow configured production frontend domain
    if (env.NODE_ENV === "production") {
      const frontendUrl = process.env.FRONTEND_URL;
      if (frontendUrl && origin === frontendUrl) {
        return callback(null, true);
      }
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};
