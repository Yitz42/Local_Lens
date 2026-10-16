# Research scope and review notes

The initial expanded directory was researched on October 15, 2026. It focuses on US storefront chains and fuel-brand networks, with related international references retained where useful. Every brand has its own source, review date, and explanation in `data/brands.json`. There is no automatic ownership feed, and this release is not a complete inventory of all corporate or private equity brands.

The following details help prevent stale or misleading classifications:

- Nothing Bundt Cakes is recorded as a KKR-backed investment, updating its former Roark association. [KKR’s June 2026 Form 10-Q](https://www.sec.gov/Archives/edgar/data/1957845/000195784526000071/kkr-20260630.htm) records an indirect interest acquired in the second quarter. The entry does not claim a specific controlling percentage.
- Walgreens is PE backed after Sycamore’s completed acquisition, with the Pessina family partnership stated in its record. An announced acquisition and a completed acquisition are different evidence. [Sycamore’s closing announcement](https://www.sycamorepartners.com/news-article/sycamore-partners-completes-acquisition-of-walgreens-boots-alliance).
- The Fresh Market is corporate under Cencosud, rather than inheriting a historical Apollo label. [Cencosud’s third-quarter 2025 report](https://www.cencosud.com/cencosud/site/docs/20251104/20251104173743/press_release_cencosud_3q25__eng_.pdf) describes completion of the remaining share acquisition and 100% ownership.
- Private equity portfolio pages may mix current and exited investments. A former investment card is insufficient evidence of current backing. Public listings and minority stakes also do not, by themselves, resolve whether a brand has continuing PE backing; each PE record describes the evidence used.
- Large privately held, family-owned, or employee-owned chains are included in the corporate category. This category is about large-chain affiliation, rather than whether shares trade publicly. Individual franchise and fuel-station operators may have different owners.
- Excluded uncertain or stale cases include JOANN following liquidation, CEC brands following bankruptcy and ownership changes, and brand-IP portfolios where the storefront operating company could not be established. Missing entries remain unknown, rather than being inferred independent.
- Short shared names such as ACME and Sierra need category or explicit brand context for map matching. What-A-Burger is a separate chain and is not an alias for Whataburger. Take 5 Oil Change is not a universal alias for every Take 5 car wash.

To maintain the list, follow [data/README.md](../data/README.md). Review current primary evidence before changing a record, then regenerate all exports and run the checks.

## Wikipedia expansion — October 16, 2026

Wikipedia company articles and lists of coffeehouses, restaurants, supermarkets, and retailers were used to identify additional brands. Current primary ownership sources were checked before adding 62 brands: 42 corporate and 20 private equity backed. The full research trail is generated in [WIKIPEDIA_ADDITIONS.md](WIKIPEDIA_ADDITIONS.md) and retained in the JSON/CSV downloads and app cards.

The research distinguishes completed deals from proposals and current ownership from historical Wikipedia descriptions. Examples include Keurig Dr Pepper’s completed April 2026 JDE Peet’s acquisition, Family Dollar’s completed 2025 sale to Brigade/Macellum, and DICK’S completed acquisition of Foot Locker. The 7 Brew entry explicitly describes Blackstone’s minority investment, and BIGGBY’s corporate label describes its large franchise network while acknowledging local franchise ownership.

## Private equity firm portfolios — October 16, 2026

The supplied Wikipedia firm list was imported as a named research queue, with supplemental firms identified through existing brand evidence. Current firm portfolio research and reviewed brand affiliations are recorded separately from pending entries. This pass records selected evidence for 42 firms, 113 selected company or brand relationships, and 24 further storefront brands. It includes minority stakes and public-company investments with explicit scope; debt-only or unclear Capital Solutions evidence is kept in review notes and does not create a PE filter label.

The reviewed subset is not a full inventory of every firm or every portfolio company. [The firm report](PRIVATE_EQUITY_FIRMS.md) shows selected holdings, mapped storefront brands, source links, partial reviews, and the remaining research queue.

## Portfolio-company category — October 16, 2026

The supplied category was reviewed as a discovery source that explicitly mixes current and former investments. This pass adds 22 sourced storefront brands and related sister brands. Current ownership distinguishes corporate brands such as Blue Nile, National, and Yankee Candle from PE-backed brands. Stale owners, bankruptcy cases, and unresolved preferred-equity interests were not copied into classifications. [Category review notes](PORTFOLIO_CATEGORY_REVIEW.md) retain the sources and exclusions.

The combined release contains 329 corporate/PE brands and selected evidence for 49 of 298 catalog firms, with 129 selected company or brand relationships. This is incomplete research, not a complete current portfolio registry.

The LongRange follow-up additionally verified the completed September 2026 Pizza Hut acquisition, excluding Mainland China, and added that brand with explicit geographic and franchise scope.
