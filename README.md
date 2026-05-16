# HouseMapper — GeoEstate

Small full-stack demo combining a Next.js frontend and a Flask backend for India property intelligence.

## Repository structure

- `geoestate/` — Next.js frontend
- `geoestate/backend/` — Flask API and model

## Prerequisites

- Node.js (16+)
- Python 3.8+

## Frontend (Next.js)

1. Install:

```bash
cd geoestate
npm install
```

2. Add your Mapbox token in `geoestate/.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

3. Run dev server:

```bash
npm run dev
```

## Backend (Flask)

1. Create virtualenv and install dependencies:

```bash
cd geoestate/backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

2. Ensure model and data files exist under `geoestate/backend/`:

- `xgboost_house_price_model.pkl` — trained model (loaded with `joblib`)
- `data/hex_clusters.json` — hex geometry/sample data

3. Run the API:

```bash
python app.py
```

API endpoints:

- `GET /` — health
- `GET /hexes` — returns hex clusters
- `POST /predict` — accepts JSON features and returns predicted price per sqft

## Notes

- Keep secrets out of source control; use `.env.local` for tokens.
- If you have large model binaries, consider storing them outside the repo or using Git LFS.

By: Aryan Pandey (ft. Pradyumna Singh)

