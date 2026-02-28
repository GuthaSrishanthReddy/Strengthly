# Frontend

React + Vite + TypeScript client for the fitness tracker.

## Tech Stack

- React 19
- React Router
- Vite
- TypeScript

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Other scripts:

- `npm run build`
- `npm run preview`
- `npm run lint`

## API Configuration

API base behavior is defined in `src/services/api.ts`:

- Uses `VITE_API_BASE_URL` when set
- Falls back to `/api` when unset

If backend runs on `http://localhost:5000`:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Key Features

- Authenticated role-based routing
- Progress updates and history
- AI-generated plan, diet, and supplement sections
- Chatbot window for AI coaching
- Day-wise workout plan display in the plan section

## Notes

- JWT token is read from `localStorage` and sent as `Authorization: Bearer <token>`.
- Plan items include a `day` field and are arranged Monday to Sunday in UI.
