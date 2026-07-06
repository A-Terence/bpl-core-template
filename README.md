# BPL Core Template

Master fleet intelligence dashboard — clone per client, configure via `tenant.config.json`.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Configure a new client

1. Clone this repo
2. Edit **`tenant.config.json`**:
   - `branding` — name, logo, primary color
   - `features` — `true` / `false` per module
3. Add logo under `public/tenants/<client>/`
4. Add a local `.env` for deployment secrets when wiring live data (never committed)

## Features

| `true` | Full module in sidebar + home widgets |
| `false` | Listed under **Unavailable features** → teaser page (cable-TV style) |

## Home dashboard

Summary widgets mirror the sidebar — KPI row, map, fuel, alerts, drivers, status, maintenance, AI insights, environment strip.

## Theme

- **Light** (default) — white cards, navy sidebar
- **Dark** — toggle in sidebar footer

## Next steps

- Port telematics poller + live map from a client dashboard
- Wire AI assistant and routing/traffic environment service
- Add Clerk auth
