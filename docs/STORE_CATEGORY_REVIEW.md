# Store categories and large-chain additions

Checked October 27, 2026. This pass split the map's **More stores** category and added 80 large US chains that were missing from the directory. It also added three Fry's (Kroger) spellings to the existing record, bringing the directory from 625 to **705 corporate or PE brands**. Classifications rely on SEC filings, company releases, and dated trade-press reports. Wikipedia is kept only as a research reference. Page fetches were unavailable during this review, so each source is the most direct dated report found by search. Several entries record a 2025–2026 change of ownership.

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

Names that are also common words, surnames, or place names only match store or restaurant listings: Checkers, Bob Evans, Hollister, Jared, Journeys, Spencer's, BoxLunch, Wienerschnitzel, Cook Out, Zales, Kirkland's, TGI Fridays, Torchy's, Cicis, Carter's, and OshKosh. GetGo and Royal Farms also have regional bounds. BJ's Restaurant & Brewhouse is a separate record from BJ's Wholesale Club. Kirkland's is not matched to Costco's Kirkland Signature.

## National chains with unconfirmed owners

TGI Fridays, Blaze Pizza, Chuck E. Cheese, Torchy's Tacos, Sbarro, Cicis, Smoothie King, and Fleet Farm are added as corporate national chains. Their current owners could not be confirmed from a dated primary source, so they carry no PE sponsor or stock listing. Each note records the reported owner where one exists, such as Sugarloaf Hospitality for TGI Fridays, D&G Investors for Cicis, or Golub Capital for Fleet Farm. They are hidden by the default corporate exclusion. If any is later confirmed as PE backed, its record should move to the PE type with a sponsor. Carter's and OshKosh B'gosh were added with Carter's, Inc.'s NYSE listing.

## Additions by store category

A follow-up pass added 60 chains aimed at the new store categories, bringing the directory to **765 corporate or PE brands**.

- **Department & discount:** Saks Fifth Avenue, Neiman Marcus, and Bergdorf Goodman ([Saks Global, in Chapter 11 since January 2026](https://abc7news.com/post/luxury-retailer-saks-global-files-bankruptcy-prepares-restructure/18400868/)); Belk ([PE; lenders including KKR took control in 2024](https://chainstoreage.com/news/belk-begins-new-ownership-era)); Gabe's ([PE; lenders including Brigade took control in 2025](https://www.retaildive.com/news/off-pricer-gabes-under-new-ownership-avoids-bankruptcy/758424/)); Citi Trends; and Savers and Value Village.
- **Clothing & shoes:** J.Crew and Madewell (Anchorage Capital, 2020); Men's Wearhouse, Jos. A. Bank, and K&G (Tailored Brands, which has filed for but not completed a Nasdaq listing); Express (the WHP-led Phoenix joint venture); PacSun (PE, Golden Gate Capital); rue21 (YM Inc.); Urban Outfitters, Anthropologie, and Free People; The North Face and Vans (VF); Coach and Kate Spade (Tapestry); Michael Kors (Capri); Levi's; Columbia Sportswear; Buckle; Crocs; The Children's Place; Tilly's; Cato; H&M; Zara (Inditex); Uniqlo (Fast Retailing); Pandora; and Tiffany & Co. (LVMH).
- **Home & hardware:** World Market (PE, Kingswood Capital, 2021); PPG Paints stores ([PE; American Industrial Partners' Pittsburgh Paints Company](https://www.businesswire.com/news/home/20241017698758/en/PPG-reaches-agreement-to-sell-architectural-coatings-U.S.-and-Canada-business-to-American-Industrial-Partners-announces-comprehensive-cost-reduction-program)); Havertys; RH; Arhaus; Ethan Allen; La-Z-Boy; Sleep Number; Ashley HomeStore; and Raymour & Flanigan.
- **More stores:** West Marine (PE, L Catterton and Oaktree; in Chapter 11 since May 2026); Build-A-Bear Workshop; Winmark's Plato's Closet, Once Upon a Child, Play It Again Sports, and Style Encore; Micro Center; Total Wine & More; Discount Tire; Rent-A-Center (Upbound); Aaron's (IQVentures); and EZPawn (EZCORP).
- **Pharmacies & health:** Eyeglass World (National Vision) and Miracle-Ear (Amplifon). America's Best was already in the directory.

Short or common names only match the matching store category: H&M (which also needs the ampersand), Express, RH, Coach, Vans, Buckle, Cato, Pandora, Levi's, Crocs, Savers, Aaron's, and Ethan Allen. Ashley HomeStore does not match the bare name Ashley. Saks OFF 5TH is a separate company and is not matched. Franchised brands such as Winmark's, Rent-A-Center, and Miracle-Ear identify the brand owner, not each store's owner.

## Remaining private chains

Rooms To Go, Living Spaces, Boscov's, Von Maur, bealls (including Bealls Outlet, Burkes Outlet, and Bealls Florida), Books-A-Million, Northern Tool + Equipment, and Scheels (employee owned) were added as large private chains. Kendra Scott is labeled PE: founder Kendra Scott keeps majority control, but [65 Equity Partners led a 2024 minority investment](https://www.privsource.com/acquisitions/deal/65-equity-partners-leads-minority-investment-in-kendra-scott-LXSoRG). The directory now lists 770 corporate or PE brands and 5 independent / co-op networks.

## Locally run stores and where the money goes

The optional `localOperators` field marks 147 brands whose US locations are mostly run by local owners. The ownership label follows where most of the money goes:

| Model | Brands | Label | Why |
| --- | ---: | --- | --- |
| `franchise` | 119 | Corporate or PE, plus a *Local franchise owner* badge | Royalties (often 4–8% of sales), marketing fees, required supplies, and sometimes rent go to the franchisor. Together these usually exceed the owner's profit. |
| `dealer` | 23 | Corporate or PE, plus an *Independent dealer* badge | Most sales are the brand's fuel, wireless service, parts, or furniture. |
| `cooperative` | 3 | Independent / co-op (Ace Hardware, True Value, Cenex) | Member-owned. Co-op earnings are returned to the local member stores. |
| `licensed` | 2 | Independent / co-op (IGA, Piggly Wiggly) | Independently owned grocers pay a small banner fee and keep their profits. |

Buying inventory from a wholesaler is not treated as money going to a corporate owner, because every independent store does that. Company-owned exceptions are separate corporate records: Westlake Ace and Great Lakes Ace (Ace Retail Holdings, newly split out), Price Less IGA and Crossroads IGA (Houchens), and Cenex Zip Trip (CHS). CHS's listed preferred stock is described in the Cenex note instead of a common-equity listing. Mixed systems such as Panera, Buffalo Wild Wings, Five Guys, La-Z-Boy, and 7-Eleven are not marked, and neither is Chick-fil-A, whose operators run company-owned restaurants.

## How local? slider

People choose how strict to be in the Ownership filters panel. *Strict* hides franchise and dealer locations of hidden brands. *Franchises* shows `franchise` locations, and *+ Dealers* also shows `dealer` locations. Company-owned chains, unknown places hidden by the unknown filter, and personal hidden names are unaffected. Automatic brand-name matching follows the same rule, so `McDonald's - Main St` reappears with the franchise step. In the Austin example snapshot, the steps add 14 and then 20 places.

## Not added in this pass

Harveys Supermarkets has been converted to Winn-Dixie. Regional private convenience chains under about 100 stores, such as Weigel's and Rutter's, were left unclassified. Closed chains (Jo-Ann, Party City, Pier 1, Tuesday Morning, 99 Cents Only), nonprofit thrift stores, and pharmacy networks made up of independent stores (Health Mart, Good Neighbor Pharmacy) were not added. Services such as banks, gyms, salons, and auto repair are outside the map's store categories.
