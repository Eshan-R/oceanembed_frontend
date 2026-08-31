# OceanEmbed

A scientific web application for subsurface ocean temperature prediction and reconstruction. This is a research tool designed for oceanographers and climate scientists — clean, functional, and information-dense, inspired by portals like INCOIS, NOAA, and CMEMS.

## Features

**Sections accessible via the persistent left sidebar:**

- **Home / Dashboard** — Project overview, key stats (region, depth range, data source, model type), and quick-access buttons
- **Ocean Map** — Interactive map of the North Indian Ocean (5°N–30°N, 45°E–105°E) with SST/SSH/current overlays and clickable grid points
- **Vertical Profile Viewer** — Depth vs. temperature chart (0–1000 m) with predicted vs. observed curve comparison
- **Prediction Panel** — Input lat/lon/date, run a prediction, view temperature at 15 standard depth levels
- **Model & Physics** — Technical description of the CNN encoder-decoder architecture and the physical basis of the model
- **Cyclone Simulation** — Illustrative before/after temperature profile comparison for a hypothetical cyclone event
- **About / Documentation** — Data sources, methodology, and project documentation

Data source: CMEMS GLORYS12V1 Reanalysis.

## Technology Stack

- **Framework**: React 19 + Vite
- **Routing**: TanStack Router (client-side, file-based)
- **Data fetching**: TanStack Query
- **Styling**: Tailwind CSS v4
- **UI components**: Radix UI + shadcn/ui
- **Charts**: Recharts

## Development

Requires Node.js 18+ and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

Other scripts:

```sh
npm run build       # Production static build → dist/
npm run preview     # Preview the built dist/ locally
npm run lint        # ESLint
npm run format      # Prettier
```

## Deployment

This project builds to a fully static `dist/` folder with no server-side rendering requirement. It is deployed as a static site on **Netlify**.

> **Deployment specifics** (build command, publish directory, redirect rules) to be filled in separately.

For client-side routing to work on Netlify, add a `public/_redirects` file:

```
/*  /index.html  200
```
