import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "GOOGLE_API_KEY"
] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

export const env = {
  PORT: Number(process.env.PORT),
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV || "development",
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY as string,
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
};
