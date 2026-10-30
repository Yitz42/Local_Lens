# Building on the Local Lens prototype

Local Lens is a working prototype, built by one person, that answers a simple question on a map: **is this
place independent, part of a corporate chain, or owned by private equity?** It exists to show the idea is
possible and useful. Turning it into something people can rely on needs an organization that can keep the
ownership data current. This document is for anyone considering that.

Live prototype: https://yitz42.github.io/Local_Lens/

## What it does today

- **Map and list of nearby places** in 36 categories, from restaurants and groceries to doctors, hospitals, labs, car washes, hotels, car dealers, and funeral homes. Search by address or use your location; the search radius runs from ½ mile to 10 miles.
- **Ownership labels** for 1,120 researched brands (867 corporate, 237 private-equity-backed, and 16 co-ops, licensed
  independent grocers, and credit unions). Every record links to a source, usually an SEC filing, a company announcement,
  or a news report. Wikipedia is used only to find candidates, never as the ownership source.
- **Hospital ownership** for about 1,500 for-profit and private-equity-backed US hospitals, matched facility by
  facility from the third-party PE Hospital Tracker.
- **"Where the money goes" filters.** Franchises and dealer-run stations keep their brand's label but show a
  local-owner badge. A *How local?* slider lets people choose between independents only, locally owned
  (including co-ops), regional (private US chains headquartered within 150 miles), franchises, and dealers.
- **Food filters** for cuisines and dietary needs.
- **A searchable brand directory** and a private equity firm directory with CSV and JSON downloads.
- **No account and no tracking.** Saved places and preferences stay in the browser.

## How it works

| Part | Where | Notes |
| --- | --- | --- |
| Place data | Overture Maps (open data, loaded tile by tile from Overture's public archive) | Free and global, but monthly releases are deleted after about 60 days, so `RELEASE` in `worker/overture.js` must be moved forward. |
| Optional Google mode | `public/google-places.js` | Each person connects their own Google Maps key. Fresher listings, but each Google search returns at most 20 places. |
| Ownership data | `data/brands.json`, `data/pe-firms.json` | Hand-researched. `npm run directory` validates them and generates the app, CSV, JSON, and Markdown files. |
| Matching | `public/ownership.js`, `public/brand-scope.js` | Brand names match place names. Short or shared names are limited to a category (`matchCategories`) or a region (`matchBounds`) to avoid false matches. |
| App | `public/` (plain JavaScript modules, no framework) | Runs as a static site (GitHub Pages) or with a small Worker that serves place pages (`worker/`). |
| Finding gaps | `scripts/find-gaps.mjs` | Scans 12 metro areas and lists chain names that are still unmatched, ranked by how many metros they appear in. Run it before each research round. |
| Nationwide gaps | `scripts/bigquery-*.sql`, `scripts/rank-bigquery-gaps.mjs` | Free BigQuery scans of Overture's US places; the ranking script reports the share of chain locations with an ownership label (58% in October 2026) and lists the biggest unmatched chains and likely name variants. |
| Tests | `tests/` (`npm test`) | About 100 tests covering matching, categories, filters, and the data files. |

Run it locally with `npm ci` and `node scripts/dev.mjs`, then open http://localhost:8000.

## Known limits

- **Ownership data is incomplete and goes stale.** It covers large US chains, not every business. Ownership
  changes often; several records here changed hands in 2025–2026.
- **"Unknown" does not mean independent.** Most small businesses are unknown simply because nobody has
  researched them.
- **Brand-level, not location-level.** A franchise or gas station may be owned by a local operator; the label
  describes the brand.
- **Name matching is imperfect.** Guards prevent most false matches, but unusual names can still slip through
  either way.
- **Google mode** is limited to 20 places per search and costs the key owner per request.

## What a real version would need

1. **An ownership data pipeline.** Ongoing monitoring of SEC filings, deal announcements, and private equity
   trackers, with a review step before changes go live. Organizations that already track ownership, such as
   the Private Equity Stakeholder Project, are the natural source.
2. **Corrections from the public.** A way for owners and customers to submit "this place is independent" or
   "this changed hands," with evidence and review.
3. **Location-level ownership** for franchises and small businesses, from state business registries,
   franchise disclosure documents, or owner verification.
4. **Broader coverage**: regional chains, more local businesses, and countries beyond the US.
5. **Reliable place data and hosting**: an automated job to move to each new Overture release, monitoring, and
   possibly a paid places provider.
6. **Editorial and legal review** of how labels are worded, especially for private equity and franchises.

## Reusing this work

Take it. The code is MIT No Attribution ([LICENSE](../LICENSE)) and the researched ownership data is
public domain under CC0 ([LICENSE-DATA.md](../LICENSE-DATA.md)): no permission or credit needed. Research notes for each batch of brands
are in this `docs/` folder, starting with [STORE_CATEGORY_REVIEW.md](STORE_CATEGORY_REVIEW.md) and
[RESEARCH.md](RESEARCH.md).
