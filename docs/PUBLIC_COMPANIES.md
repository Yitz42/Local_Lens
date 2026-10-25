# Publicly traded companies and corporate filtering

Reviewed October 25, 2026. The corporate category includes any company whose operating-company or brand-owner equity is listed on a stock exchange, regardless of company size or exchange location. It also retains the directory’s large privately held chains. A public company with documented PE backing appears in both categories; hiding either category excludes it.

The existing primary `type` field is retained. The generated `categories` field records all filter memberships, and `publicListing` carries the issuer, relationship, exchange/ticker pairs, listing source, and its own review date. Corporate and PE counts overlap; their sum can exceed the number of unique brands.

## Corrected overlap

The following 13 existing brands now also qualify for corporate filtering, with current company or regulatory listing evidence:

| Listed operating company / brand owner | Equity listing | Directory brands |
| --- | --- | --- |
| Driven Brands Holdings Inc. | Nasdaq: DRVN | 1-800 Radiator, ABRA, CARSTAR, Maaco, Meineke, Take 5 Oil Change |
| Birkenstock Holding plc | NYSE: BIRK | Birkenstock |
| Bob’s Discount Furniture, Inc. | NYSE: BOBS | Bob’s Discount Furniture |
| Canada Goose Holdings Inc. | NYSE and TSX: GOOS | Canada Goose |
| LifeStance Health Group, Inc. | Nasdaq: LFST | LifeStance Health |
| Life Time Group Holdings, Inc. | NYSE: LTH | Life Time |
| Petco Health and Wellness Company, Inc. | Nasdaq: WOOF | Petco |
| Torrid Holdings Inc. | NYSE: CURV | Torrid |

The full evidence URLs are stored per record and shown in [BRANDS.md](BRANDS.md), the app cards, JSON, and CSV.

## Additional public-company records

Apple (Nasdaq: AAPL), CAVA (NYSE: CAVA), Sweetgreen (NYSE: SG), and Dutch Bros (NYSE: BROS) were added using current company or regulatory sources. Whole Foods retains its corporate affiliation and now records its listed operating parent, Amazon (Nasdaq: AMZN).

## Current listings and scope

[Mister Car Wash’s completed May 2026 take-private announcement](https://www.sec.gov/Archives/edgar/data/1853513/000119312526229866/d128344dex991.htm) says its stock ceased trading. It remains PE backed and does not qualify as public from its former MCW ticker. Walgreens likewise does not inherit its former listing or the listing of any financial investor.

The listing must belong to the operating company or a supported brand-owner relationship. A publicly listed financial sponsor does not make every private portfolio company publicly traded. Brand affiliation does not prove the owner of an individual franchise, licensed store, or retailer stocking the company’s products.

These records demonstrate the inclusion rule within the researched directory. They do not enumerate every equity issuer on every exchange, and missing businesses remain unknown. Existing corporate entries already qualify for the corporate filter even where separate exchange/ticker metadata has not yet been added. Listing checks are manual snapshots and are not an automatic securities feed.
