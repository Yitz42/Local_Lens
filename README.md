# Local Lens

A responsive map app for discovering restaurants, groceries, gas stations, coffee shops, and other stores. Use geolocation, enter a location, or pan the map and search again. Hide private-equity-backed brands, large corporate brands, and unverified places independently. Open a place for the parent company, supporting source, scope, and review date. Saved places and filters stay in localStorage on the current browser.

## Brand directory

Browse `/directory.html` for the searchable corporate and private equity brand list. Search by brand, spelling variation, or parent company; filter by ownership type; download CSV or JSON. The same reviewed records power the map filters. The full source-linked list is in [docs/BRANDS.md](docs/BRANDS.md).

The directory focuses on selected US chains and fuel-brand networks, with some related international brands retained for reference. Map ownership matching remains limited to the researched US geography. It is not exhaustive and is not updated automatically. A local franchise or station operator may be independently owned even when its brand is corporate or PE backed. Unknown does not mean independent.

## Run

Run `npm run build`, then `node --use-env-proxy --use-system-ca scripts/dev.mjs`. The app is served by a self-contained Cloudflare Worker; standalone static hosting does not support the place lookup API. Geolocation requires HTTPS outside localhost. No API keys are required. Install locked build dependencies with `npm ci`. Run ownership/filter tests with `npm test`.

## Data

Nearby places come from the September 23, 2026 Overture Maps release. The Worker reads bounded byte ranges from Overture’s published global Places PMTiles archive on S3 and decodes vector tiles locally. No Overpass service, account, or maps API key is required. The archive is a dated dataset, not real-time verification of business status.

The API returns four tiles per page to bound Worker memory and subrequests. The browser collects every page, three at a time, and deduplicates GERS IDs before presenting the final count. A missing page produces a visible loading error rather than an incomplete zero-result claim. Permanently closed records and non-store/non-food business categories are excluded. Search radius filtering uses straight-line distance. The server uses bounded in-memory and best-effort edge caches; the browser retains up to four recent areas for seven days and only reuses data covering the requested geography and radius.

Nominatim receives explicitly submitted location searches; there is no autocomplete. Map tiles are from OpenStreetMap. Recent area records and saved places stay in the current browser. Coordinates are rounded to three decimal places before reaching the place-data API. No coordinates or credential values are logged by application code.

Update `worker/overture.js` RELEASE and DATA_DATE together when adopting a new published archive, then test and republish. Build with esbuild using the lockfile; `dist/server/index.js` embeds the UI and all runtime dependencies. The initial Austin example remains an attributed OpenStreetMap snapshot and is labeled separately.

`data/brands.json` is the editable ownership source. Run `npm run directory` after changes to regenerate `public/brand-directory.js`, `public/brands.json`, `public/brands.csv`, and `docs/BRANDS.md`. The build regenerates these files too. `public/ownership.js` matches places against those same records. Every known ownership rule has a primary-source link, review date, and explanation. Matching uses reviewed aliases from the brand or place name, ignoring punctuation and an optional trailing numeric store identifier (such as `CVS Pharmacy #1234`); it does not use loose substring matches. Shared names such as ACME require the expected store category or an explicit place-data brand field; use an optional `matchCategories` array to restrict a collision-prone row. There is no guess that an unknown brand is independent. Independent Austin businesses are geographically limited. The corporate category includes large privately held chains, including Chick-fil-A and Einstein Bros. Bagels; CVS Pharmacy is classified under CVS Health. Private equity backing includes listed investments that may be minority stakes. Brand affiliation and individual store ownership differ, especially for franchises and fuel stations. International ownership, local operating companies, automatic ownership updates, business hours, and completeness are not verified.

Places and ownership facts are separate data layers. Extend the directory with reviewed primary sources; do not derive ownership from the place's name or appearance. Each row needs a distinct brand name, reviewed spelling aliases, ownership type (`corporate`, `pe`, or a geographically limited `independent` reference), parent/backing, HTTPS source and title, explanatory note, and ISO review date. Cite current company pages, portfolio holdings, or regulatory filings. Check whether a portfolio labels the investment current or exited and whether an acquisition actually closed. State minority stakes explicitly. Run `npm run directory`, `npm test`, and `npm run build` before committing. Source review date: 2026-10-15.

## Hosting

This repository mirrors the app source. The tracked `.openai/hosting.json` identifies the existing Local Lens Site; it contains no credentials and does not grant deployment access. For a new Site, replace its project ID with the ID assigned to your own Site. The production build is `dist/server/index.js`; a local preview uses `scripts/dev.mjs`. Do not commit tokens, localStorage exports, or private user data. Open source dependency and place-data licenses are retained under `public/vendor/` and in the attribution below.

## Attribution

Place data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright
Map tiles © OpenStreetMap contributors.
Leaflet.markercluster 1.5.3, MIT: https://github.com/Leaflet/Leaflet.markercluster
Leaflet 1.9.4, BSD-2-Clause: https://github.com/Leaflet/Leaflet

Place data © Overture Maps Foundation and its sources. Release and licenses: https://docs.overturemaps.org/attribution/
