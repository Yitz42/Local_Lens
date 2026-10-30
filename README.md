# Local Lens

A responsive map app for discovering restaurants, groceries, gas stations, coffee shops, and other stores. Use geolocation, enter a location, or pan the map and search again. Hide private-equity-backed brands, corporate brands (including every reviewed public company), and unverified places independently. Open a place for the parent company, supporting source, scope, and review date. Saved places and filters stay in localStorage on the current browser.


**Status: prototype.** Local Lens is a one-person proof of concept showing that a map of who owns local businesses is possible and useful. The ownership data is researched and sourced but incomplete, and it needs ongoing maintenance that a single person can't provide. [docs/HANDOFF.md](docs/HANDOFF.md) explains what works, how it is built, and what a real version would need. The code is [MIT licensed](LICENSE) and the ownership data is [CC BY 4.0](LICENSE-DATA.md), so others are welcome to build on it.

## Brand directory

Browse `/directory.html` for the searchable corporate and private equity brand list. Search by brand, spelling variation, or parent company; filter by ownership type; download CSV or JSON. The same reviewed records power the map filters. The full source-linked list is in [docs/BRANDS.md](docs/BRANDS.md). [Wikipedia research additions](docs/WIKIPEDIA_ADDITIONS.md) retain the discovery references alongside current ownership sources. Wikipedia links are also included in the app cards and downloads when available. The [grocery and restaurant list review](docs/CHAIN_LIST_REVIEW.md), [gas, coffee, and retail review](docs/GAS_AND_RETAIL_REVIEW.md), and [store category review](docs/STORE_CATEGORY_REVIEW.md) record the latest additions, coverage, and ownership cautions.

Einstein Bros. Bagels includes narrow full-name spelling variants such as `Einstin Bros. Bagels`; a grocery category does not exempt it from corporate filtering. Giant Pharmacy is a reviewed pharmacy-name record under the common Ahold Delhaize parent of Giant Food and The GIANT Company. It matches grocery and pharmacy/store categories within its regional guard. These explicit records also work when automatic name matching is disabled; unrelated Einstein names and Giant Eagle are not assigned these owners.

Separately listed Giant Floral departments use the same regional corporate-parent scope and also match in More stores. The bare `GIANT` grocery rule stays category-restricted so unrelated bike shops and other Giant-named businesses remain unknown. Sherwin-Williams and its named paint stores are corporate, with NYSE:SHW equity evidence; independent stockists of other Sherwin-Williams product brands are not inferred to be company-owned.

The directory focuses on selected US chains and fuel-brand networks, with some related international brands retained for reference. Map ownership matching remains limited to the researched US geography. It is not exhaustive and is not updated automatically. A local franchise or station operator may be independently owned even when its brand is corporate or PE backed. Unknown does not mean independent.

The supplied [Wikipedia portfolio-company category](https://en.wikipedia.org/wiki/Category:Private_equity_portfolio_companies) contains current **and former** investments. It is used to discover candidates, rather than assign ownership automatically. [Category review notes](docs/PORTFOLIO_CATEGORY_REVIEW.md) record the verified additions and cases needing caution.

[PESP employer-tracker review notes](docs/PESP_REVIEW.md) record a further selected review and related investor research. Non-Wikipedia research starting points use `discoverySources`, shown separately from primary ownership evidence in the directory, JSON, and CSV. A database mention is not an automatic ownership label. The latest grocery, restaurant, fuel, coffee, and retail additions were checked October 25–26, 2026; older records retain their own review dates.

## Private equity firms and selected holdings

Open `/firms.html` to search firms, portfolio companies, and mapped brands. [The firm report](docs/PRIVATE_EQUITY_FIRMS.md) records selected holdings, source links, investment scope, and researched versus pending entries from the supplied [Wikipedia firm list](https://en.wikipedia.org/wiki/List_of_private_equity_firms). `data/pe-firms.json` is the editable firm research source; the build creates `public/pe-firms.json`, `public/pe-firm-directory.js`, `public/pe-holdings.csv`, and the report. Firm portfolios include non-store companies for context; map ownership labels use reviewed storefront brands only. An unreviewed firm or empty holdings list never means there are no investments.

## Run

Run `npm run build`, then `node --use-env-proxy --use-system-ca scripts/dev.mjs`. The app is served by a self-contained Cloudflare Worker; standalone static hosting does not support the place lookup API. Geolocation requires HTTPS outside localhost. No API keys are required. Install locked build dependencies with `npm ci`. Run ownership/filter tests with `npm test`.

## Data

Nearby places come from the October 21, 2026 Overture Maps release. Overture deletes each release's tile archive about 60 days after publishing it, so `RELEASE` in `worker/overture.js` must be moved to a newer release (listed at `https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/?list-type=2&prefix=tiles/&delimiter=/`) before then. The Worker reads bounded byte ranges from Overture’s published global Places PMTiles archive on S3 and decodes vector tiles locally. No Overpass service, account, or maps API key is required. The archive is a dated dataset, not real-time verification of business status.

The API returns four tiles per page to bound Worker memory and subrequests. The browser collects every page, three at a time (eight at a time on the GitHub Pages build, which reads Overture directly), and deduplicates GERS IDs before presenting the final count. A missing page produces a visible loading error rather than an incomplete zero-result claim. Permanently closed records and non-store/non-food business categories are excluded. Search radius filtering uses straight-line distance. The server uses bounded in-memory and best-effort edge caches; the browser retains up to four recent areas for seven days and only reuses data covering the requested geography and radius.

Nominatim receives explicitly submitted location searches; there is no autocomplete. Map tiles are from OpenStreetMap. Recent area records and saved places stay in the current browser. Coordinates are rounded to three decimal places before reaching the place-data API. No coordinates or credential values are logged by application code.

Update `worker/overture.js` RELEASE and DATA_DATE together when adopting a new published archive, then test and republish. Build with esbuild using the lockfile; `dist/server/index.js` embeds the UI and all runtime dependencies. The initial Austin example remains an attributed OpenStreetMap snapshot and is labeled separately.

`data/brands.json` is the editable ownership source. Run `npm run directory` after changes to regenerate `public/brand-directory.js`, `public/brands.json`, `public/brands.csv`, and `docs/BRANDS.md`. The build regenerates these files too. `public/ownership.js` matches places against those same records. Every known ownership rule has a primary-source link, review date, and explanation. Matching uses reviewed aliases from the brand or place name, ignoring punctuation and an optional trailing numeric store identifier (such as `CVS Pharmacy #1234`); it does not use loose substring matches. Shared names such as ACME require the expected store category or an explicit place-data brand field; use an optional `matchCategories` array to restrict a collision-prone row. There is no guess that an unknown brand is independent. Independent Austin businesses are geographically limited. Optional `matchBounds` rectangles restrict ambiguous regional names in both ownership matching and automatic name filtering. Identical aliases are allowed only with disjoint scopes; these conservative guards are not administrative polygons or verification of a particular location. The coverage guard includes Hawaii, Alaska, Puerto Rico, and the US Virgin Islands alongside the continental area, but does not establish international ownership. The corporate category includes large privately held chains, including Chick-fil-A and Einstein Bros. Bagels; CVS Pharmacy is classified under CVS Health. Private equity backing includes listed investments that may be minority stakes. Brand affiliation and individual store ownership differ, especially for franchises and fuel stations. International ownership, local operating companies, automatic ownership updates, business hours, and completeness are not verified.

Places and ownership facts are separate data layers. Extend the directory with reviewed primary sources; do not derive ownership from the place's name or appearance. Each row needs a distinct brand name, reviewed spelling aliases, ownership type (`corporate`, `pe`, or a geographically limited `independent` reference), parent/backing, HTTPS source and title, explanatory note, and ISO review date. Cite current company pages, portfolio holdings, or regulatory filings. Check whether a portfolio labels the investment current or exited and whether an acquisition actually closed. State minority stakes explicitly. Run `npm run directory`, `npm test`, and `npm run build` before committing. Review dates are recorded per entry; the latest research pass was October 27, 2026.

## Hosting

This repository mirrors the app source. The tracked `.openai/hosting.json` identifies the existing Local Lens Site; it contains no credentials and does not grant deployment access. For a new Site, replace its project ID with the ID assigned to your own Site. The production build is `dist/server/index.js`; a local preview uses `scripts/dev.mjs`. Do not commit tokens, localStorage exports, or private user data. Open source dependency and place-data licenses are retained under `public/vendor/` and in the attribution below.

## GitHub Pages

`npm run pages` builds a static copy of the site in `dist/pages`. GitHub Pages has no `/api/places` route, so that build adds a `local-lens-places` meta tag and bundles `worker/overture.js` as `overture-browser.js`; the map then reads Overture's PMTiles archive directly from the browser (the S3 bucket allows cross-origin range requests). The brand list, firm pages, example snapshot, location search, and Google connection work the same way. The Site build is unchanged and still uses its Worker.

`.github/workflows/pages.yml` runs the tests, builds `dist/pages`, and deploys it on every push to `main` (or from **Actions → Deploy to GitHub Pages → Run workflow**). To turn it on once, open the repository's **Settings → Pages** and set **Source** to **GitHub Actions**. Until that is done, GitHub's own "pages build and deployment" publish also runs on each push and replaces the app with the repository files, so the workflow also runs after that publish (`workflow_run`) and puts the app back. The site is then published at `https://<owner>.github.io/<repository>/`. If you use a Google Maps key there, add that address to the key's website restrictions; the connection page shows the exact value.

## License

Code: [MIT](LICENSE). Researched ownership data (brand and firm directories, kosher listings, research notes): [CC BY 4.0](LICENSE-DATA.md). Map data and third-party libraries keep their own licenses, listed below.

## Attribution

Place data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright
Map tiles © OpenStreetMap contributors.
Leaflet.markercluster 1.5.3, MIT: https://github.com/Leaflet/Leaflet.markercluster
Leaflet 1.9.4, BSD-2-Clause: https://github.com/Leaflet/Leaflet

Place data © Overture Maps Foundation and its sources. Release and licenses: https://docs.overturemaps.org/attribution/

## Publicly traded companies

Corporate includes any reviewed operating company with equity listed on a stock exchange, regardless of size, and its owned brands. Companies with documented PE backing can appear in both filters; either exclusion hides them. `publicListing` stores the issuer, exchange/ticker pairs, source, and a separate review date. Cards and downloads show this evidence, and ticker symbols are searchable. A listed financial sponsor alone does not make a private portfolio company public. The source-linked stock review is in [docs/PUBLIC_COMPANIES.md](docs/PUBLIC_COMPANIES.md). Coverage remains a selected US-focused brand directory, not an exhaustive global list of all listed companies.

## Store categories

Places are chosen from a single Category dropdown, grouped into Food & drink, Stores, and Services so every option is visible at once. It separates Pharmacies, Home & hardware, Clothing & shoes, and Department & discount from More stores. Overture taxonomy, OpenStreetMap shop tags, and Google place types each map to these categories, and grocery, fuel, coffee, and restaurant tags still take precedence. A brand guard of `other` in `data/brands.json` covers every store category. The October 27, 2026 passes also added 211 large national and regional restaurant, retail, and convenience chains across the new categories, including 2025–2026 ownership changes such as Denny's, Del Taco, Office Depot, Nordstrom, Hot Topic, and Pep Boys. Bars, Beauty & personal care, Fitness, Auto service, Banks & credit unions, Print & design, Laundry & dry cleaning, Pet care & vets, and Repair & alterations are also categories, and butchers, seafood, cheese, and health-food shops count as Groceries. When More stores is selected, a second dropdown narrows it to electronics, gifts, books and hobbies, beauty supply, sporting goods, liquor, thrift, auto parts, pets, tobacco, or office stores. See the [store category review](docs/STORE_CATEGORY_REVIEW.md).

## Where the money goes

Locally run stores are classified by where most of the money goes. **Franchise** brands (such as McDonald's, Subway, and Dunkin') and **dealer** brands (fuel brands, NAPA Auto Parts, prepaid wireless dealers, and Ashley's licensed stores) keep their corporate or PE label. A local owner runs the store, but royalties, marketing fees, required supplies, fuel or service sales, and often rent flow mainly to the brand owner. These brands show a *Local franchise owner* or *Independent dealer* badge, and the corporate and PE filters still hide them.

**Cooperative** networks (Ace Hardware, True Value, Cenex) and **licensed independent** grocers (IGA, Piggly Wiggly) and **member-owned** credit unions (such as Navy Federal and BECU) are labeled *Independent / co-op*. The store belongs to the local owner, co-op earnings are paid back to members, and brand fees are small, so most of the money stays local. These are not hidden by the corporate or PE filters and are not caught by automatic brand-name matching. Company-owned exceptions have their own corporate records: Westlake Ace and Great Lakes Ace, Houchens' Price Less IGA and Crossroads IGA, and CHS's Cenex Zip Trip.

A **How local?** slider in the Ownership filters panel lets each person decide how strict to be, depending on what is available where they are. It applies while corporate or PE brands are hidden:

1. *Independent only* also hides co-op, licensed, and member-owned stores such as Ace Hardware, IGA, and credit unions.
2. *Locally owned* (the default) shows independents and co-op member stores but hides franchise and dealer locations with the rest of their brand.
3. *Regional* also shows **local corporations**: privately held, US-owned chains (family, employee, founder, or co-op owned) whose headquarters is within 150 miles of that place. An H-E-B in Austin qualifies (San Antonio headquarters); one in Dallas does not.
4. *Franchises* lets locally owned franchise locations back in.
5. *+ Dealers* also shows dealer-run locations such as branded gas stations.

Headquarters are recorded in the optional `headquarters` field (city, state, and approximate coordinates) for 134 chains. They are recorded only for privately held, US-owned companies. Publicly traded companies, PE-backed companies, and subsidiaries of foreign owners are never treated as local corporations, because their profits go to outside shareholders or owners. Within 150 miles of the headquarters, map cards show a *Local HQ* badge and place details give the distance.

The panel shows how each step changes the results in the current area. Company-owned chains remain hidden at every step. The choice is saved in the browser under `local-lens-local-level-v3`; choices saved by earlier versions are mapped to the step with the same meaning. A filter chip appears while the setting is not the default, and clearing it restores the default. Changing the slider never causes another Google request.

The `localOperators` field (`franchise`, `dealer`, `cooperative`, `licensed`, or `memberowned`) appears in the JSON and CSV downloads. The brand list can filter on independent / co-op networks or on all locally owned or operated brands. These labels describe a brand's usual model, not the owner of a particular store. Chick-fil-A is not marked, because its operators run restaurants the company owns.

## Search distance

The **Within** menu above the list (and on the map) searches ½, 1, 2 (default), 5, or 10 miles around the search center; both menus stay in sync. The place API accepts radii from 500 m to 16.1 km. A 10-mile search near Baltimore covers about 300 map tiles and roughly 15,000 places, so it takes noticeably longer to load; at high latitudes, where tiles are smaller, a 10-mile search can exceed the 512-tile limit and asks for a smaller radius.

## Default ownership and food filters

Corporate and PE exclusions start on. The updated default is applied once when upgrading from the older preference key; subsequent choices, including explicitly showing all ownership types, are remembered in the browser. Unknown ownership remains visible unless separately hidden.

Use the Food types checkboxes for Italian, pizza, and other supported cuisines or food styles. Multiple checks match any selected type and combine with ownership, radius, and place-category filters. Clearing food choices leaves ownership filters in place. The UI uses explicit Overture primary/hierarchy/alternate categories and OSM cuisine tags, never guesses from business names. Some places lack these tags and therefore do not match a selected food type. Saved legacy records can use their existing cuisine string.

**Dietary** choices (Kosher, Halal, Vegetarian, Vegan) sit above the cuisines. Unlike cuisines, each checked dietary choice is required, so Kosher + Pizza shows kosher pizza places. Vegan places also count as vegetarian. Dietary choices work in Restaurants, Coffee & cafés, Groceries, and Bars, so kosher bakeries and markets appear too; cuisines apply to restaurants only. A place is labeled from its data: Overture's `kosher_restaurant`, `halal_restaurant`, `vegetarian_restaurant`, and `vegan_restaurant` categories, OpenStreetMap's `diet:kosher`, `diet:halal`, `diet:vegetarian`, and `diet:vegan` tags (`yes` or `only`), Google's vegetarian and vegan restaurant types, or the word in the place's name ("kosher-style" does not count; "zabiha" counts as halal). Google has no kosher or halal type, so a Kosher or Halal search with Google connected adds one text search for that word around the area. Place details say where a dietary label comes from and, for kosher or halal, to check the certification; the app does not verify it.

Kosher has three more sources, because general map data misses many kosher places:

- `public/kosher-places.js` lists certified places with the certifier, address, and a link to the agency's certificate or a kosher directory listing. It starts with the Baltimore / Pikesville area (Star-K). A listing only matches a place with the same name within 150 m, so a chain such as Dunkin' counts only at its certified location. To add a place, copy an entry and fill in its source; drop entries whose certification lapses.
- While Kosher is selected, the browser asks OpenStreetMap's Overpass API once per area for places tagged `diet:kosher=yes|only` or `cuisine=kosher`. Matching loaded places get the label, and kosher places missing from the loaded results are added. If Overpass is unavailable, the other sources still work.
- **Mark as kosher** in place details lets a person label places they know. Marks are saved only in that browser (`local-lens-my-kosher-v1`).

Names containing glatt, cholov yisroel, chalav yisrael, pas yisroel, or Star-K also count as kosher.

The Worker preserves food tags and uses a new edge-cache namespace. Nearby browser caches use format 2 so old records that omitted cuisine tags are not reused as current responses. Saved places remain available; food choices are scoped to the current view.

## All large brands and chains

The Ownership filters panel has an **All large brands & chains** control that enables or clears the corporate and PE exclusions together. Individual switches remain available; a partial selection appears as a mixed state on the combined control. Unknown-ownership choices are independent. The control uses the sourced directory rather than inferring chain size from a business name.

Five Guys is included as a large privately owned chain, based on its [private-ownership and franchise FAQ](https://www.fiveguys.com/support-hub/faqs/) and [2026 family-business history](https://www.fiveguys.com/news/media-mentions/featured-stories/five-guys-celebrates-40-years-of-burgers-fries-and-family/). Its local franchise operators can differ from the brand owner. Large privately held chains qualify even without a stock listing or PE investment.

Former Rite Aid and Bartell Drugs chain names remain in the corporate directory to classify stale map listings and saved places. Their notes document the 2025 retail closures and selected CVS conversions. Matching a former brand does not establish that a location is open, identify its current operator, or imply a current stock listing.


## Google Maps connection

Open `/connection.html` (also linked above the results and in the footer) to connect a dedicated Google Maps **browser** API key on the current browser. No hosting environment settings are needed. The key is kept in localStorage and sent directly to Google, never embedded in the repository, build, server logs, or chat. As with any Maps JavaScript key, it is visible to the browser; restrict it to `https://local-lens-places.shrewdcow.chatgpt.site/*` and only Maps JavaScript API and Places API (New). Enable both APIs and billing, and set appropriate quotas in the owner’s Google Cloud project. Disconnect on the same page to remove the browser’s key.

With a key configured, the app uses Google Maps and the new JavaScript `Place.searchNearby` API. An all-category search makes at most five requests, one for each category group, and deduplicates by Google place ID. A category or food-type search makes one request. Each request returns at most 20 selected places; there is no nearby pagination and the results are not exhaustive. Changes to ownership filters are local and do not cause another Google request. Cuisine queries use explicit Google type metadata, with OR semantics, and closed, temporarily closed, and future-opening places are excluded when Google reports those statuses. Business status does not mean open at the current hour.

Google content never goes into the Overture edge/browser cache or the seven-day offline fallback. Google listing data lasts in memory for the visit; bookmark storage contains only place IDs and details are requested again when Saved is first opened during a visit. A closed or unavailable saved ID stays removable. Existing Overture/OSM bookmarks and filter choices are retained. Without a key, the source notice explicitly identifies the published Overture dataset; a failed Google connection never silently switches its results onto OpenStreetMap.

Map loads, nearby searches, and saved-place detail calls use the owner’s Google billing project. Only the listed Pro-tier fields are requested, not reviews, ratings, hours, photos, or websites. Do not promise a fixed price or unlimited coverage. Live access cannot be verified without the owner connecting a restricted key; automated integration checks use Google API fixtures. Public policy documents are [Privacy](docs/PRIVACY.md) and [Terms](docs/TERMS.md) in this public repository, so they remain readable even though the hosted app is owner-private. Preserve the hosted audience.


## Name filters

The Name filters panel provides a default-on **Match excluded brand names** option plus an independent, browser-local list of personal hidden names. The automatic option hides reviewed corporate/PE names occurring as complete word sequences in longer listings, such as `7-Eleven Fuel` or `CVS Photo - Downtown`, when the corresponding ownership category is excluded. It respects the US coverage bounds, category guards for shared names, and punctuation-sensitive brands. It does not change `ownershipFor` or promote a name-only match into a verified ownership label. Shared names can still hide unrelated businesses; the option can be disabled independently of ownership exclusions.

Personal hidden names match display names as complete word sequences, ignoring case, punctuation, spacing variants, and accents. They apply independently of ownership and work on the map, list, and saved places without removing bookmarks. Up to 100 names of 80 characters each are saved under `local-lens-name-filters-v1`, alongside the automatic option. Removing a chip, clearing the personal list, or disabling automatic matching updates the existing loaded results without another Google request. Name preferences never go to the place service. Ownership, food, category, and radius filters continue to combine with name choices.


The directory includes reviewed US mobile-service brands under EchoStar, AT&T, T-Mobile, and Verizon, with the public parent’s exchange/ticker evidence. Carrier affiliation does not establish the owner of an authorized retailer or a store selling a carrier’s products; generic dealer names are not treated as carrier aliases. Mint Mobile’s record explicitly documents its online model rather than asserting a company-operated store network. Save A Lot is classified as a large grocery banner using its 2026 corporate report and licensed-store scope; the entry does not infer a current private equity sponsor from historical ownership.
