# 🌱 Plantify — Smart Plant Care Dashboard

Live at: **https://cloud-zip.github.io/plantify-web/**

Plantify is a smart farming dashboard connecting real ESP32 IoT sensors to an AI-powered agronomy advisor. It provides real-time soil, temperature, humidity, and NPK tracking, automated irrigation scheduling, and live Indian Mandi crop price data.

## Stack
- React + Vite
- Tailwind CSS (CDN)
- Supabase Edge Functions (backend, in separate repo)
- Recharts, React-Leaflet

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env      # fill in your Supabase URL and anon key
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_BASE_PATH` | Base path for deployment (e.g. `/plantify-web/`) |

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically to GitHub Pages.
