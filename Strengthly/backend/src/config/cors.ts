import { CorsOptions } from "cors";

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or Postman
    if (!origin) return callback(null, true);

    // Local development
    if (origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }

    // Production frontend from env
    const frontendUrl = process.env.FRONTEND_URL;
    if (
      frontendUrl &&
      normalizeOrigin(origin) === normalizeOrigin(frontendUrl)
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};
