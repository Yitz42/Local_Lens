# Store categories and large-chain additions

Checked October 27, 2026. This pass split the map's **More stores** category and added 70 large US chains that were missing from the directory. It also added three Fry's (Kroger) spellings to the existing record, bringing the directory from 625 to **695 corporate or PE brands**. Classifications rely on SEC filings, company releases, and dated trade-press reports. Wikipedia is kept only as a research reference. Page fetches were unavailable during this review, so each source is the most direct dated report found by search. Several entries record a 2025–2026 change of ownership.

## Store categories

Pharmacies, Home & hardware, Clothing & shoes, and Department & discount now have their own place-category buttons. More stores keeps the remaining retail, such as electronics, books, pets, florists, and auto parts.

| Category | Overture taxonomy | OpenStreetMap | Google Places types |
| --- | --- | --- | --- |
| Pharmacies | `pharmacy_and_drug_store`, `pharmacy`, `drugstore` | `amenity=pharmacy`, `shop=chemist/pharmacy` | `pharmacy`, `drugstore` |
| Home & hardware | `hardware_home_and_garden_store` and its hardware, building-supply, furniture, home-goods, garden, and paint children | `shop=hardware/doityourself/furniture/garden_centre/paint/…` | `hardware_store`, `home_improvement_store`, `home_goods_store`, `furniture_store` |
| Clothing & shoes | `fashion_and_apparel_store`, `clothing_store`, `shoe_store` | `shop=clothes/shoes/boutique/jewelry/…` | `clothing_store`, `shoe_store`, `jewelry_store` |
| Department & discount | `department_store`, `discount_store`, `warehouse_club_store` | `shop=department_store/variety_store/discount/general/wholesale` | `department_store`, `discount_store`, `warehouse_store` |

Grocery, convenience, gas, coffee, and restaurant terms are still checked first, so a supercenter tagged as a supermarket stays in Groceries. A brand guard of `other` in `data/brands.json` covers every store category, so existing retail guards keep working. An all-places Google search still makes five requests; the fifth combines every store type. The worker edge-cache namespace and the browser place-cache format changed, so cached responses that lumped these stores together are refetched. Saved places keep the category they were saved with.

## Restaurant additions

32 restaurant chains were added. Privately held chains are classified as corporate because of their size, not because of a stock listing.

- **Ownership changes since 2025:** Denny's was taken private by [TriArtisan, Treville, and Yadav Enterprises](https://www.sec.gov/Archives/edgar/data/852772/000119312526015085/d52435dex991.htm) in January 2026. [Jack in the Box sold Del Taco to Yadav](https://www.businesswire.com/news/home/20251222118321/en/Jack-in-the-Box-Inc.-Completes-Sale-of-Del-Taco-Holdings-Inc.) in December 2025. [4x4 Capital bought Bob Evans Restaurants](https://pulse2.com/bob-evans-restaurants-4x4-capital-acquires-family-dining-chain-from-golden-gate-capital/amp/) from Golden Gate Capital in February 2026. [The founders' group reacquired Hooters](https://restaurantbusinessonline.com/financing/bankrupt-hooters-kicks-comeback-under-new-owners) out of bankruptcy.
- **PE backed:** Qdoba (Butterfly Equity), P.F. Chang's (TriArtisan and Paulson & Co.), Checkers & Rally's (Oak Hill Capital Partners), Ruby Tuesday (NRD Capital), and Captain D's (Centre Partners).
- **Listed companies:** El Pollo Loco, Krispy Kreme (JAB Holding Company is its largest shareholder), Red Robin, Noodles & Company, Portillo's, First Watch, Steak 'n Shake (Biglari Holdings), Smashburger (Jollibee Foods), Dave & Buster's, and BJ's Restaurant & Brewhouse.
- **Large private chains:** Little Caesars, Raising Cane's, Taco Cabana, Huddle House, Perkins, Golden Corral, White Castle, Waffle House, Cook Out, Wienerschnitzel, Jet's Pizza, and MOD Pizza.
- **Cautions:** First Watch is labeled corporate only, because Advent International cut its holding to under 9% in 2025. Huddle House and Perkins belong to a holding company created by Elysium Management, a family-office investment firm, and are classified as corporate rather than PE. Nathan's Famous has an agreed Smithfield acquisition, but its closing could not be confirmed, so no stock listing is recorded for it.

## Retail, fuel, and convenience additions

38 retail and convenience chains were added.

- **Ownership changes:** [Atlas Holdings took ODP private](https://www.willkie.com/news/2025/12/atlas-holdings-completes-take-private-acquisition-of-the-odp-corporation-parent-of-office-depot) (Office Depot and OfficeMax). [Nordstrom went private](https://chainstoreage.com/done-deal-nordstrom-completes-acquisition-nordstrom-family-and-liverpool) under the Nordstrom family and El Puerto de Liverpool. [Kingswood and Performance Investment Partners bought The Vitamin Shoppe](https://www.businesswire.com/news/home/20250520092532/en/Kingswood-Capital-Management-and-Performance-Investment-Partners-Complete-Acquisition-of-The-Vitamin-Shoppe). [Capitol Hill Group and Worldwide Golf took Big 5 private](https://www.lw.com/en/news/latham-watkins-advises-big-5-sporting-goods-corp-in-acquisition-by-worldwide-golf-capitol-hill). [Couche-Tard bought GetGo](https://www.grocerydive.com/news/couche-tard-closes-getgo-acquisition-giant-eagle/752047/). [Spencer Spirit Holdings bought Hot Topic](https://fashionunited.com/news/business/spencer-spirit-finalises-hot-topic-acquisition/2026090374406) from Sycamore Partners in September 2026. [Icahn sold Pep Boys to Mavis](https://www.sec.gov/Archives/edgar/data/0000813762/000110465926099264/tm2623713d1_8k.htm) in August 2026; Pep Boys is labeled PE because the existing Mavis record is a TSG Consumer Partners investment.
- **Listed companies:** Famous Footwear (Caleres), Victoria's Secret, Sally Beauty, GameStop, Kay, Zales, and Jared (Signet), Journeys (Genesco), Hollister and Abercrombie & Fitch, Floor & Decor, Boot Barn, Zumiez, Mattress Firm (Somnigroup), and Bed Bath & Beyond, Kirkland's Home, and The Container Store (Bed Bath & Beyond, Inc.).
- **Large private chains:** JCPenney (Catalyst Brands), Big Lots (Variety Wholesalers), Royal Farms, Crate & Barrel (Otto Group), Bass Pro Shops and Cabela's, Rural King, Spirit Halloween and Spencer's, and BoxLunch.
- **PE-backed convenience chains:** Yesway and Allsup's, owned by BW Gas & Convenience Holdings, an affiliate of Brookwood Financial Partners.

## Name guards

Names that are also common words, surnames, or place names only match store or restaurant listings: Checkers, Bob Evans, Hollister, Jared, Journeys, Spencer's, BoxLunch, Wienerschnitzel, Cook Out, Zales, and Kirkland's. GetGo and Royal Farms also have regional bounds. BJ's Restaurant & Brewhouse is a separate record from BJ's Wholesale Club. Kirkland's is not matched to Costco's Kirkland Signature.

## Not added in this pass

Current ownership could not be confirmed from a dated source for TGI Fridays, Blaze Pizza, Chuck E. Cheese, Torchy's Tacos, Sbarro, Cicis, Smoothie King, Fleet Farm, and Carter's. Harveys Supermarkets has been converted to Winn-Dixie. Regional private convenience chains under about 100 stores, such as Weigel's and Rutter's, were left unclassified. Services such as banks, gyms, salons, and auto repair are outside the map's store categories.
