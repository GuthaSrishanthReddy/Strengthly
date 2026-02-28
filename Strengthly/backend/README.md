# Backend (API)

Express + Prisma API for the fitness tracker.

## Tech Stack

- Node.js + TypeScript
- Express
- Prisma (PostgreSQL)
- Google Generative AI
- Zod validation

## Required Environment Variables

Create `backend/.env`:

```bash
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
GOOGLE_API_KEY=your-google-api-key
```

These are enforced in `src/config/env.ts`.

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

## Run

```bash
npm run dev
```

Other scripts:

- `npm run build`
- `npm run start`
- `npm run prisma:studio`
- `npm run prisma:migrate`

## API Base

All routes are mounted under:

`/api`

Health check:

`GET /health`

## Route Groups

- `/api/auth`
- `/api/users`
- `/api/trainers`
- `/api/progress`
- `/api/plans`
- `/api/diet`
- `/api/supplements`
- `/api/messages`
- `/api/ai`
- `/api/rules`

## AI and Embeddings

Embeddings are stored in `DocumentEmbedding`.

Shared embedding access lives in:

`src/services/embeddingStore.service.ts`

Used by plan/diet/supplement/chatbot services to fetch by source (`progress`, `routine`, `diet`, `plan`, `supplement`, and chat session sources).

## Current Plan Output Shape

AI plan items are expected in this shape:

```json
{
  "day": "Monday",
  "workout": "Squats",
  "setsReps": "2 x 12",
  "notes": "Light weight, focus on form"
}
```

Frontend renders routines day-wise using this field.

## Optional Local ML Service

If you want to run your own local model service in parallel, use:

`../ml-service`

It exposes:
- `POST /generate`
- `POST /embed`

Current backend logic remains Gemini-based unless you explicitly change service wiring.
