import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  const status =
    err.statusCode ||
    (err?.code === "P1001" ? 503 : 500);

  if (status === 429 && err?.retryAfter) {
    res.setHeader("Retry-After", String(err.retryAfter));
  }

  res.status(status).json({
    success: false,
    message:
      err?.code === "P1001"
        ? "Database unreachable"
        : err.message || "Internal server error"
  });
};
