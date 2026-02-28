# Strengthly ML Service

Standalone local custom ML API (non-LLM) for generation and embeddings.

This service trains from your app database and generates plan/diet using learned nearest-neighbor patterns from user history.

## Endpoints

- `GET /health`
- `POST /train`
- `POST /generate`
- `POST /embed`

## Request/Response

### `POST /train`

Triggers retraining from DB (`ML_DATABASE_URL`).

Response:

```json
{
  "success": true,
  "rows": 124,
  "message": "Model trained from user data.",
  "trainedAt": "2026-02-28T12:00:00.000000"
}
```

### `POST /generate`

Request:

```json
{
  "prompt": "Create a beginner workout plan",
  "generationConfig": {
    "maxOutputTokens": 200,
    "temperature": 0.3,
    "topP": 0.9
  }
}
```

Response:

```json
{
  "text": "..."
}
```

### `POST /embed`

Request:

```json
{
  "text": "High protein breakfast ideas"
}
```

Response:

```json
{
  "embedding": [0.01, -0.02, 0.11]
}
```

## Local Run (Windows PowerShell)

```powershell
cd Strengthly/ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python app.py
```

Service runs on `http://localhost:8000`.

Train once after startup:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/train
```

## Docker Run

```bash
cd Strengthly/ml-service
docker build -t strengthly-ml .
docker run --rm -p 8000:8000 --env-file .env strengthly-ml
```

## Notes

- Requires enough historical rows in your DB (`ML_MIN_TRAIN_ROWS`, default `15`).
- Plan and diet generation are learned from stored user data, not fixed templates.
- No transformer/LLM/GPU dependency is required.
