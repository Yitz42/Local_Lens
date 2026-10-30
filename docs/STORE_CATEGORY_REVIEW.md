# Store categories and large-chain additions

Checked October 27, 2026. This pass split the map's **More stores** category and added 80 large US chains that were missing from the directory. It also added three Fry's (Kroger) spellings to the existing record, bringing the directory from 625 to **705 corporate or PE brands**. Classifications rely on SEC filings, company releases, and dated trade-press reports. Wikipedia is kept only as a research reference. Page fetches were unavailable during this review, so each source is the most direct dated report found by search. Several entries record a 2025–2026 change of ownership.

## Store categories

Pharmacies, Home & hardware, Clothing & shoes, and Department & discount are now their own place categories. All categories are picked from one dropdown grouped into Food & drink, Stores, and Services. More stores keeps the remaining retail, such as electronics, books, pets, florists, and auto parts.

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

The optional `localOperators` field marks 177 brands whose US locations are mostly run by local owners. The ownership label follows where most of the money goes:

| Model | Brands | Label | Why |
| --- | ---: | --- | --- |
| `franchise` | 137 | Corporate or PE, plus a *Local franchise owner* badge | Royalties (often 4–8% of sales), marketing fees, required supplies, and sometimes rent go to the franchisor. Together these usually exceed the owner's profit. |
| `dealer` | 26 | Corporate or PE, plus an *Independent dealer* badge | Most sales are the brand's fuel, wireless service, parts, or furniture. |
| `cooperative` | 3 | Independent / co-op (Ace Hardware, True Value, Cenex) | Member-owned. Co-op earnings are returned to the local member stores. |
| `licensed` | 2 | Independent / co-op (IGA, Piggly Wiggly) | Independently owned grocers pay a small banner fee and keep their profits. |
| `memberowned` | 9 | Independent / co-op (credit unions) | Owned by member-customers. Earnings return to members through rates and dividends. |

Buying inventory from a wholesaler is not treated as money going to a corporate owner, because every independent store does that. Company-owned exceptions are separate corporate records: Westlake Ace and Great Lakes Ace (Ace Retail Holdings, newly split out), Price Less IGA and Crossroads IGA (Houchens), and Cenex Zip Trip (CHS). CHS's listed preferred stock is described in the Cenex note instead of a common-equity listing. Mixed systems such as Panera, Buffalo Wild Wings, Five Guys, La-Z-Boy, and 7-Eleven are not marked, and neither is Chick-fil-A, whose operators run company-owned restaurants.

## How local? slider

People choose how strict to be in the Ownership filters panel. *Independent only* also hides `cooperative` and `licensed` member stores. *Locally owned*, the default, includes them because most of their money stays local. *Franchises* shows `franchise` locations of hidden brands, and *+ Dealers* also shows `dealer` locations. The slider only applies while corporate or PE brands are hidden; company-owned chains, the unknown filter, and personal hidden names are unaffected. Automatic brand-name matching follows the same rule, so `McDonald's - Main St` reappears with the franchise step. In the Austin example snapshot, the franchise and dealer steps add 14 and then 20 places.

## Specialty, tire, liquor, and regional stores

A further pass added 39 chains, bringing the directory to 814 listed brands:

- **Tires and auto:** NTB, Tire Kingdom, Big O Tires, and Midas ([TBC Corporation, owned by Sumitomo](https://www.fenderbender.com/running-a-shop/finance/article/33034248/tbc-buys-midas)); Les Schwab (PE, Meritage Group, 2020).
- **Convenience and grocery:** MAPCO (Majors Management); Kwik Fill and Red Apple Food Mart (United Refining); Market Basket (Demoulas, limited to New England so it does not match the unrelated Gulf Coast Market Basket).
- **Sporting goods, apparel, and shoes:** Dunham's Sports, PGA TOUR Superstore, Sportsman's Warehouse (its sale to Bass Pro's parent was called off), Fleet Feet, Carhartt, Duluth Trading Co., Red Wing Shoes, Johnston & Murphy, Brooks Brothers, Destination XL, Patagonia, Maurices (PE, OpCapita, 2019), and J.Jill.
- **Jewelry and beauty:** Swarovski; Helzberg Diamonds and Ben Bridge (Berkshire Hathaway); Brilliant Earth; Lush; CosmoProf; and Pet Supermarket (PE, Roark).
- **Home, books, and gifts:** 84 Lumber, The Tile Shop (no longer exchange-listed), Benjamin Moore, Hallmark, and Half Price Books.
- **Liquor:** Spec's, Binny's Beverage Depot, ABC Fine Wine & Spirits, and BevMo! (Gopuff).
- **Optical and pharmacy:** Visionworks (VSP Global) and Navarro Discount Pharmacy (CVS Health, limited to South Florida).

Big O Tires, Midas, and Fleet Feet are marked `franchise`. Red Wing Shoes, Benjamin Moore, and Hallmark are marked `dealer`: their stores are mostly independently owned but sell the brand's products, so most of the money goes to the brand. Generic or place names are limited to store listings: the city name Red Wing, Hallmark, Lush, and Patagonia do not match restaurants or other businesses. Service-only businesses such as oil change, collision, and shipping stores, and closed chains (Party City, Jo-Ann, Conn's, Badcock), were not added.

Wikipedia could not be reached from the review environment. Article links that appeared in search results are kept. Other new Wikipedia references are Wikipedia search links for the brand name, so they never point to a missing page.

## Regional chains

23 regional chains were added, bringing the directory to 837 listed brands. Each has `matchBounds` covering its operating area, so the same name elsewhere stays unknown. Generic names also need a fuel, convenience, or grocery category.

- **Convenience and fuel:** Weigel's, Rutter's, Parker's Kitchen, Spinx, Family Express, and Huck's (employee owned); Enmarket ([Nouria Energy, since 2025](https://www.wtoc.com/2024/11/03/family-owned-convenience-chain-acquires-enmarket-deal-marks-milestone)); Road Ranger (Enex / Quiñenco); and Bucky's ([Casey's, since 2021](https://www.businesswire.com/news/home/20210514005066/en/Casey%E2%80%99s-Announces-the-Closing-of-Buchanan-Energy-Acquisition)), kept for older listings.
- **Grocery:** Stew Leonard's, Sedano's, Food Bazaar, Kowalski's Markets, Earth Fare (Hulsing Enterprises), and Roche Bros. with Sudbury Farms and Brothers Marketplace ([51% owned by Bozzuto's since 2024](https://www.bostonglobe.com/2024/11/01/business/roche-bros-sale-grocery-store/)).
- **Farm and home:** Atwoods, Blain's Farm & Fleet (distinct from Fleet Farm), Bomgaars, Theisen's, and Coastal Farm & Ranch with C-A-L Ranch ([PE, Nolan Capital](https://www.businesswire.com/news/home/20211229005365/en/Nolan-Capital-Inc.-Announces-Acquisition-of-a-Majority-Stake-in-Coastal-Farm-Ranch-the-Northwest%E2%80%99s-Leading-Ranch-and-Country-Lifestyle-Retailer)).
- **Pharmacy and liquor:** Kinney Drugs (100% employee owned), Discount Drug Mart (employee owned), and Twin Liquors.

Family-, employee-, and regionally owned chains are classified as corporate private chains, like other large private chains. Ricker's was not added, because the results did not establish whether its stores moved with GetGo in Couche-Tard's 2025 purchase.

## Local corporations by headquarters

The How local? slider's *Regional* step, between *Locally owned* and *Franchises*, treats a chain as a local corporation where its headquarters is within 150 miles of the place. It applies only to the 134 records with a `headquarters` field: privately held, US-owned chains whose profits stay with a family, employees, a founder, or members. Examples are H-E-B (San Antonio), Publix (Lakeland), Wegmans (Rochester), Sheetz (Altoona), Wawa, Hy-Vee, Kwik Trip, Weigel's, and Market Basket. Publicly traded companies, PE-backed companies, and foreign-owned chains (such as ALDI, Trader Joe's, Lidl, IKEA, and 7-Eleven) are excluded. When a chain belongs to another private owner, the owner's headquarters is used: Festival Foods (Wisconsin) uses Schnucks in St. Louis, and Enmarket uses Nouria in Worcester. Headquarters coordinates are city centers, which is precise enough for a 150-mile radius. In the Austin example, the step adds two H-E-B-family stores.

## Bars, services, and banks

Five more place categories were added: Bars, Beauty & personal care, Fitness, Auto service, and Banks & credit unions. Butchers, seafood, cheese, and health-food shops moved into Groceries. More stores now has a type menu (electronics, gifts, books and hobbies, beauty supply, sporting goods, liquor, thrift, auto parts, pets, tobacco, office, and everything else).

| Category | Overture taxonomy | OpenStreetMap | Google Places types |
| --- | --- | --- | --- |
| Bars | `alcoholic_beverage_venue`, `bar`, `pub`, `lounge`, `brewery` and similar, when no restaurant term is present | `amenity=bar/pub/biergarten/nightclub` | `bar`, `night_club` |
| Beauty & personal care | `personal_or_beauty_service` and its salon, barber, nail, spa, and tattoo children | `shop=hairdresser/beauty/nails/massage/tattoo` | `beauty_salon`, `hair_care`, `spa` |
| Fitness | `sport_or_fitness_facility`, `gym`, `fitness_studio` and similar | `leisure=fitness_centre` | `gym` |
| Auto service | `vehicle_service`, `automotive_service`, `car_wash`, `oil_change`, `tire_repair` and similar | `shop=car_repair/tyres`, `amenity=car_wash` | `car_repair`, `car_wash` |
| Banks & credit unions | `bank_or_credit_union` and its children | `amenity=bank` | `bank` |

Restaurants that also serve drinks stay restaurants. The Google types were chosen conservatively, and an all-places Google search still makes five requests; the new categories are searched only when selected. All 35 brands guarded to restaurants (such as Hooters, TGI Fridays, and BJ's Restaurant & Brewhouse) also gained the `bar` guard, so a location tagged as a bar still matches, and Midas and NTB gained `auto`.

51 brands were added, bringing the directory to 888 listed brands. Every bank name is guarded to bank listings only, so `Chase` or `Regions` never matches a restaurant.

- **Salons:** Supercuts, Cost Cutters, SmartStyle, and First Choice Haircutters (Regis, Nasdaq RGS, mostly franchised); Great Clips and Sport Clips (franchised); European Wax Center (General Atlantic, PE, franchised).
- **Fitness:** Planet Fitness (NYSE PLNT, franchised); LA Fitness (privately held Fitness International); Club Pilates, Pure Barre, YogaSix, and StretchLab (Xponential, NYSE XPOF, franchised); Gold's Gym (RSG Group, franchised).
- **Auto service:** Jiffy Lube (Monomoy, PE, franchised); Valvoline Instant Oil Change (NYSE VVV); Monro (Nasdaq MNRO); Goodyear Auto Service (Nasdaq GT); Christian Brothers Automotive (franchised); Gerber Collision & Glass (Boyd Group); Safelite AutoGlass (Belron, majority-owned by D'Ieteren).
- **Banks:** Chase, Bank of America, Wells Fargo, Citibank, PNC Bank, FirstBank (now PNC, limited to Colorado and Arizona), U.S. Bank, Truist, Capital One (bank and Capital One Café listings), Fifth Third, Comerica (now Fifth Third), Regions, KeyBank, Huntington, Cadence Bank (now Huntington, limited to the South), Citizens Bank (limited to its own footprint, since many community banks share the name), M&T Bank, TD Bank, BMO (formerly BMO Harris and Bank of the West, owned by Bank of Montreal), Santander Bank (owned by Spain's Banco Santander), and Webster Bank (a Santander division since August 2026, limited to southern New England and New York so Webster Five and other local banks are not matched).
- **Credit unions:** Navy Federal, State Employees' (North Carolina), PenFed, BECU (Washington), SchoolsFirst, Golden 1 (California), America First, Mountain America, and Suncoast (Florida). They use the new `memberowned` model and are labeled independent / co-op. *Independent only* hides them with co-ops.

Ownership of Christian Brothers Automotive and any outside stake in Safelite were not confirmed beyond their franchisor and parent.

## Print & design, laundry, pet care, and repair

Four more service categories were added on October 29, 2026.

| Category | Overture taxonomy | OpenStreetMap | Google Places |
| --- | --- | --- | --- |
| Print & design | `printing_service` and its children, `print_media`, `graphic_designer`, sign making. Shipping centers are left out because that label also covers post offices, parcel lockers, and drop boxes. | `shop=copyshop`, `craft=printer/signmaker`, `office=graphic_design` | "print shop", "graphic design and printing", "sign shop", and "commercial printing" text searches limited to the search area; libraries, schools, post offices, and government offices are dropped, and results Google files under another category keep it |
| Laundry & dry cleaning | `laundry_service`, `laundromat`, `dry_cleaning` | `shop=laundry/dry_cleaning` | `laundry` |
| Pet care & vets | `animal_or_pet_service` and its veterinary, grooming, boarding, sitting, and training children | `amenity=veterinary/animal_boarding`, `shop=pet_grooming` | `veterinary_care`, plus a "pet grooming" text search |
| Repair & alterations | phone, computer, and electronics repair, shoe, watch, and jewelry repair, tailors (IT consultants excluded) | `craft=electronics_repair/shoemaker/tailor/watchmaker`, `shop=repair/tailor` | a "phone and computer repair" text search |

Pet stores stay in More stores. The text searches run only when that category is selected, so an all-places Google search still makes five requests.

17 brands were added, bringing the directory to 905 listed brands:

- **Print & design:** FedEx Office (NYSE FDX, company-run), The UPS Store (NYSE UPS, franchised), AlphaGraphics and PostNet (MBE Worldwide, family-controlled with an Oaktree minority stake; franchised), Minuteman Press (family-owned by the Titus family since 1973; franchised), and Sir Speedy, PIP, and Signal Graphics (privately held Franchise Services, Inc. of Mission Viejo; franchised).
- **Pet care & vets:** Banfield Pet Hospital, VCA Animal Hospitals, and BluePearl (Mars, privately held), and Camp Bow Wow (Propelled Brands, backed by Freeman Spogli and LightBay Capital; franchised).
- **Repair:** uBreakiFix by Asurion (privately held Asurion; franchised) and CPR Cell Phone Repair (Assurant, NYSE AIZ; franchised).
- **Laundry & dry cleaning:** Tide Cleaners (Procter & Gamble, NYSE PG; franchised), and Lapels Cleaners and Martinizing (Clean Brands, LLC, backed by private equity firm Greybull Stewardship; franchised).

Existing brands without a category guard, such as Staples, Office Depot, Petco, PetSmart, Thrive Pet Healthcare, and Batteries Plus, also match in these categories.

## Five more rounds: health, hotels, fun, child care, storage and money

Added October 30, 2026 in five rounds, each with a review pass. The Category menu now has 26 categories in five groups.

| Category | Overture taxonomy | OpenStreetMap | Google Places |
| --- | --- | --- | --- |
| Doctors & urgent care (Health) | urgent care, walk-in, emergency department, primary care, family practice, pediatric, internal medicine (public health offices and ambulances excluded) | `amenity=clinic/doctors`, `healthcare=clinic/doctor` | `doctor`, plus an "urgent care" text search |
| Dentists (Health) | `dental_clinic` and its specialties (dental labs excluded) | `amenity=dentist` | `dentist`, `dental_clinic` |
| Eye care & glasses (Health) | optometry, ophthalmology, eye clinics, `eyewear_store` (moved from Clothing) | `shop=optician`, `healthcare=optometrist` | "optometrist" and "eyeglasses store" text searches |
| Hotels (Travel & fun) | hotel, motel, resort, inn, bed and breakfast, hostel (`lodge` and bare `lodging` excluded: they are mostly fraternal lodges and event companies) | `tourism=hotel/motel/guest_house/hostel` | `lodging` |
| Movies & fun (Travel & fun) | movie theaters, bowling, arcades, escape rooms, amusement and trampoline parks, mini golf, laser tag | `amenity=cinema`, `leisure=bowling_alley/amusement_arcade/trampoline_park/miniature_golf/escape_game`, `tourism=theme_park` | `movie_theater`, `bowling_alley`, `amusement_center` |
| Child care & tutoring | day care, preschool, tutoring, test prep (schools excluded) | `amenity=childcare/kindergarten`, `office=tutoring` | `child_care_agency`, `preschool`, plus a "tutoring center" text search |
| Storage & rentals | self storage, truck and car rental (parcel lockers and warehouses excluded) | `shop=storage_rental`, `amenity=car_rental/truck_rental` | `storage`, `car_rental`, plus a "truck rental" text search |
| Tax & money services | tax preparation, money transfer, check cashing, currency exchange (coin and Bitcoin kiosks and ATMs excluded) | `amenity=money_transfer/bureau_de_change`, `office=tax_advisor`, `shop=money_lender` | "tax preparation" and "money transfer" text searches |

Brands added (23, bringing the directory to 928 listed brands):

- **Health:** Heartland Dental (KKR) and MyEyeDr. (Goldman Sachs Asset Management, Charlesbank).
- **Hotels:** Marriott, Hilton, IHG, Wyndham, Choice Hotels, and Hyatt, each listing its brand family, plus Motel 6 and Studio 6 (OYO). Most are franchised and carry the franchise badge.
- **Movies & fun:** AMC Theatres, Cinemark, Lucky Strike (formerly Bowlero, including AMF), and Six Flags (including former Cedar Fair parks).
- **Child care & tutoring:** KinderCare (NYSE KLC), The Learning Experience (Harvest Partners), Kiddie Academy (privately owned, Abingdon, Maryland headquarters, so it counts as a local corporation nearby), and Sylvan Learning (Unleashed Brands, Seidler Equity).
- **Storage & rentals:** Public Storage, Extra Space Storage (including Life Storage), and U-Haul (dealer-run locations).
- **Tax & money:** H&R Block, Western Union (agent locations), and Jackson Hewitt (Corsair Capital).

Review fixes made along the way:

- Eye care counts as a store category, so store-only guards on Sunglass Hut, Eyemart Express, Vision 4 Less, and others keep matching.
- Hotel, theater, child care, storage, and tax chains match locations named after the brand (`matchNamePrefix`).
- Goddard, Primrose, and Mathnasium now match locations such as "Primrose School of Owings Mills".
- Fraternal lodges, parcel lockers, and kiosks are kept out of the new categories.

Left out because current ownership could not be confirmed from a primary source: CityMD, Concentra, Patient First, AFC Urgent Care, Best Western, Extended Stay America, Red Roof, Regal, Sky Zone, Bright Horizons, Kumon, Huntington Learning Center, Celebree School, CubeSmart, Penske, Hertz, and MoneyGram. ExpressCare belongs to the nonprofit LifeBridge Health system, which the app has no label for yet.

## Rounds 6–10: real estate, car dealers, phones, therapy, senior care, funeral homes

Added October 30, 2026 in five more rounds, each with a review pass. The Category menu now has 32 categories.

| Category | Overture taxonomy | OpenStreetMap | Google Places |
| --- | --- | --- | --- |
| Real estate & insurance | real estate agents and services, property management, insurance agencies (builders, investors, surveyors, and associations excluded) | `office=estate_agent/insurance` | `real_estate_agency`, `insurance_agency` |
| Car dealers (moved from More stores) | `vehicle_dealer` and its new, used, motorcycle, truck, and RV children | `shop=car/motorcycle/truck` | `car_dealer` |
| Phone & internet stores (moved from More stores) | `mobile_phone_store`, accessories, `telecommunications_service` (phone repair stays in Repair) | `shop=mobile_phone/telecommunication` | `cell_phone_store`, `telecommunications_service_provider` |
| Physical therapy & chiropractic (Health) | physical, occupational, and speech therapy, rehabilitation, chiropractic (addiction treatment and prosthetics excluded) | `healthcare=physiotherapist/occupational_therapist/speech_therapist/chiropractor` | `physiotherapist`, `chiropractor` |
| Senior living & home care (Health) | senior living, retirement homes, assisted living, memory care, nursing homes, home health care (government senior centers excluded) | `social_facility=assisted_living/nursing_home`, `social_facility:for=senior` | "assisted living" and "home care for seniors" text searches |
| Funeral homes | funeral services, crematoriums, cemeteries (pet cemeteries stay in Pet care) | `shop=funeral_directors`, `amenity=funeral_hall/crematorium` | `funeral_home` |

Brands added (23, bringing the directory to 951 listed brands):

- **Real estate & insurance:**
  - RE/MAX (fully franchised).
  - Compass Real Estate, plus the Anywhere brands Compass bought in January 2026: Coldwell Banker, Century 21, ERA, Sotheby's International Realty, and Better Homes and Gardens Real Estate.
  - State Farm (a mutual company owned by its policyholders) and Allstate (NYSE ALL). Their exclusive local agents get the dealer badge.
- **Car dealers:** CarMax, AutoNation (with AutoNation USA), Lithia (with Driveway), and Carvana.
- **Phone & internet:** Xfinity (Comcast) and Spectrum (Charter).
- **Physical therapy & chiropractic:**
  - Select Physical Therapy, with NovaCare and Physiotherapy Associates. Select Medical was taken private by its founders and Welsh, Carson, Anderson & Stowe on July 1, 2026.
  - ATI Physical Therapy (taken private by Knighthead and Marathon in 2025).
  - The Joint Chiropractic (mostly franchised).
  - Upstream Rehabilitation (Revelstoke) and Ivy Rehab (Waud Capital).
- **Senior living & home care:** Brookdale (NYSE BKD) and Home Instead (Honor Technology; franchised).
- **Funeral homes:** Dignity Memorial and SCI's other brands (NYSE SCI). Most SCI funeral homes keep their original local names, so only listings that mention an SCI brand are matched.

Review fixes made along the way:

- **New matching option:** `matchNameAnywhere`, for agent listings that put the brand after a person's name. The build only allows it with category guards. Bare "ERA" and "Compass" aliases were dropped so "New Era Realty" and "Compass Property Management" stay unknown.
- **More stores:** dealers left the More stores "Auto parts" type.
- **Wireless brands:** Verizon, AT&T, T-Mobile, Metro, Cricket, Boost, and Total Wireless now match locations named after them, limited to phone and store listings so "Spectrum Pediatrics" stays unknown. A test that built a Boost Mobile listing with a pizza restaurant type now uses a phone store type.
- **Allstate:** added after the live-data review showed its agent listings were common but unmatched.

Left out because current ownership could not be confirmed from a primary source: Keller Williams, Long & Foster, GEICO, Progressive, Victra, Hendrick, Penske Automotive, Professional Physical Therapy, Concentra, Sunrise Senior Living, Visiting Angels, Right at Home, Carriage Services, and Park Lawn.

## Hospitals and two outside trackers

**Hospitals** are a new Health category. Overture tags many doctors' offices, departments, and parking lots as hospitals, so only names that read as a hospital or medical center count, with office, department, clinic, and support-service names left out. OpenStreetMap `amenity=hospital` / `healthcare=hospital` and Google `hospital` map here too. Ownership comes from the [PE Hospital Tracker](https://airtable.com/appd2resSxUkpguFP/shrojR480lmH8vKpu/tbl058jjL6qNMqzkM), matched by facility name and city: 559 hospitals it lists as currently PE backed (Lifepoint/Apollo, ScionHealth/Apollo, Select Medical/WCAS, and others) and 970 for-profit hospitals with a parent (HCA, Encompass, UHS, Tenet, CHS, and others). Live checks: National Park Medical Center in Hot Springs matched Lifepoint and Apollo; TriStar Centennial and Southern Hills in Nashville matched HCA. The tracker is used as published; for example, it lists TriStar Skyline as nonprofit, so Skyline stays unknown.

A second shared tracker of about 260 large private-equity-owned employers was compared with the directory. Most of its storefront companies were already here (Walgreens, PetSmart, Michaels, Lane Bryant, Culver's, Massage Envy). Added after checking an investor or company source: Extended Stay America (Blackstone and Starwood), Great Wolf Lodge (Blackstone and Centerbridge), Topgolf (Leonard Green, 60% since January 2026), Bright Now! Dental, Monarch Dental and Castle Dental (Smile Brands, Gryphon), Athletico (BDT & MSD), Learning Care Group's La Petite Academy, Tutor Time, Childtime, Everbrook Academy, The Children's Courtyard and Montessori Unlimited (American Securities), Cadence Academy (Apax), SYNERGY HomeCare (Levine Leichtman), Interim HealthCare (Wellspring), Merlin's LEGOLAND Discovery Center, SEA LIFE and Madame Tussauds (KIRKBI with Blackstone and CPP Investments), Pret A Manger (JAB), and Guess (Authentic Brands, 51% since January 2026).

Wikipedia's private equity portfolio category (about 530 pages, most of them past deals, defunct chains, or companies without storefronts) was used only to find candidates. Added after checking a current source: Express Oil Change & Tire Engineers (Golden Gate), TOGO'S (Southfield Mezzanine), California Pizza Kitchen (Consortium Brand Partners-led group, December 2025), Benihana, RA Sushi, STK and Kona Grill (The ONE Group, Nasdaq), Paper Source (Barnes & Noble, Elliott), and the Hertz and Avis Budget rental brands. Left out: Coinstar (kiosks, and Apollo's reported sale had not been confirmed), Vineyard Vines (no current ownership change found), and chains outside the US.

The directory now lists 985 brands (752 corporate, 219 PE backed, 14 independent or co-op).

## Round 13: finding gaps by how often a chain repeats

`scripts/find-gaps.mjs` scans Overture places around 12 metro areas (Baltimore, Nashville, Dallas, Phoenix, Chicago, Atlanta, Houston, Philadelphia, Seattle, Orlando, Detroit, Cincinnati) and lists names that stay unknown in at least three of them, ranked by how many metros they appear in. Before this round, 205 such chains covered 3,730 categorized places; after it, 187 chains covered 3,276.

**Leading-name descriptors.** Many misses were known brands with a descriptor added ("Olive Garden Italian Restaurant", "Pep Boys Auto Service & Tires", "Kroger Pharmacy", "Sunoco Gas Station", "Bank of America ATM"). `ownershipFor` now also tries the name with one trailing descriptor removed (restaurant, gas station, pharmacy, self storage, rent a car, auto service, store, express, spa, ATM, and similar). The rest of the name must still match a brand exactly.

**New categories:**

| Category | Overture | OpenStreetMap | Google |
| --- | --- | --- | --- |
| Car washes (split from Auto service) | `car_wash` | `amenity=car_wash` | `car_wash` |
| Labs & imaging | `laboratory_testing`, `medical_laboratory`, `diagnostic_imaging`, plasma and blood donation (primary category only; dental labs stay out) | `healthcare=laboratory/blood_donation/sample_collection` | `medical_lab` |
| Hearing care | `hearing_aid_store`, `hearing_aid_provider`, `audiologist` | `shop=hearing_aids`, `healthcare=audiologist` | text search "hearing aids" |

Overture also files many tax preparers under `trusts`, which had no category; tax-named listings now go to Tax & money services.

**Brands added (56):**

- **Car washes:**
  - Whistle Express and Take 5 Car Wash (Oaktree funds; Whistle bought Take 5 from Driven Brands in 2025).
  - Quick Quack (KKR minority investment, Seidler, and the founders).
- **Beauty and wellness:**
  - Hand & Stone (Harvest Partners).
  - WellBiz Brands' Drybar, Amazing Lash Studio, Elements Massage, Fitness Together, and Radiant Waxing (Transom Capital since early 2026).
  - The Lash Lounge (The Riverside Company).
  - LaserAway (Ares).
  - M·A·C, Aveda, and Origins (Estée Lauder); Kiehl's (L'Oréal); Benefit (LVMH); Charlotte Tilbury (Puig).
- **Health:**
  - Quest Diagnostics and Labcorp.
  - Concentra and One Medical (Amazon).
  - HearUSA (WS Audiology: founding families and EQT); Beltone (GN); HearingLife (Demant); Connect Hearing (Sonova).
  - BrightStar Care (Peak Rock Capital).
- **Food:** Potbelly (RaceTrac, October 2025) and See's Candies (Berkshire Hathaway).
- **Retail:**
  - GNC (Harbin Pharmaceutical).
  - Cash America (FirstCash), Lovesac, and Leslie's.
  - Steve Madden and Ralph Lauren; Tommy Bahama and Lilly Pulitzer (Oxford Industries); Vera Bradley; Allen Edmonds (Caleres).
  - TAG Heuer (LVMH); Gucci and Saint Laurent (Kering).
  - Framebridge (Graham Holdings) and Geek Squad (Best Buy).
- **Services:**
  - CubeSmart; Penske and Ryder truck rental.
  - OneMain and Charles Schwab (with TD Ameritrade).
  - HUB International (Hellman & Friedman); Goosehead and Gallagher.
  - Nationwide and Farmers agents (dealer badge, matched anywhere in the name).
  - CBRE, JLL, and Cushman & Wakefield.

**Aliases added:** Vetco (Petco), MinuteClinic and CVS Beauty (CVS), Walmart Vision, WFM Coffee Bar (Whole Foods), Home Depot tool rental, Wells Fargo Advisors, and uBreakiFix listing names.

**Still unknown, and why:**

- **Closed chains still in the map data:** RadioShack, Payless, Party City, Pier 1, Forever 21, Joann, Sprint, and Papyrus.
- **No current primary source found:** Marco's Pizza (one unconfirmed report of PE stakes), Veterinary Emergency Group (growth investors, no controlling owner found), Restore Hyper Wellness, Right At Home, and Liberty Tax (its parent went through bankruptcy).
- **Nonprofits:** Goodwill and the YMCA.

## Nationwide gap scan with BigQuery

Overture's places are also published in BigQuery's public datasets. `scripts/bigquery-chains-detailed.sql` (about 10 GB, inside the free tier) lists every US place name with at least 5 locations, with its states, extent, and most common website domain. `scripts/rank-bigquery-gaps.mjs` checks each name against the directory at its own center point, so regional brands count. It also lists unmatched names that share a website with a matched brand, which are likely name variants. The other `scripts/bigquery-*.sql` files count places per category, group chains by website or Wikidata brand ID, list the top names in each category, and list chains around Baltimore.

Of the 60,000 names, those in app categories cover about 1.27 million US places. The share with an ownership label went from **53.4% to 58.0%** in this round:

- **Name variants (about 160 aliases).** Each one was found through a shared website and reviewed by hand. Examples: Suntrust and BB&T (Truist), TCF (Huntington), BBVA (PNC), Union Bank (U.S. Bank), and People's United (M&T); Mr. Tire, Car-X, and Tire Choice (Monro); Speedco and Love's Truck Care (Love's); On The Run, Flash Foods, Holiday Car Wash, and Kangaroo Express (Circle K); TA and Petro (bp); BJ's tire, optical, and gas listings; plus store-in-store names such as "Sunglass Hut at Macy's" and "Claire's Walmart". Generic names that happened to share a website were left out: "Gas Station", "The Bistro", "Deals", "Pink", and "OFFLINE".
- **More trailing descriptors:** gas, fuel, fuel center, food mart, outlet, factory store, retail, mattress store, bank branch, and supermarket branch. "Kroger Fuel Center" and "Santander Bank Branch" now match. Bare "Red Wing" stays unmatched because of the Minnesota town.
- **New brands (31):**
  - **PE backed:** Krispy Krunchy Chicken (Main Post Partners), Hanger Clinic (Patient Square), Keller Williams (Stone Point Capital, with Gary Keller), and Clarks (LionRock Capital).
  - **Corporate:**
    - Hunt Brothers Pizza (Hunt family) and VIP Petcare (Tractor Supply, May 2026).
    - John Deere and Quick Lane (dealer-run); Fastenal, Ferguson, SiteOne, Builders FirstSource, QXO, and Foundation Building Materials (Lowe's).
    - It's Just Wings (Brinker) and Kumon; A&W Restaurants, owned by its franchisees since 2011.
    - Aéropostale (Catalyst Brands), Gymboree (The Children's Place), Banter and Piercing Pagoda (Signet).
    - First American Title, U.S. Physical Therapy (Drayer, SERC), Genoa Healthcare (Optum), and Clayton Homes (Berkshire).
    - First Horizon, Flagstar, SouthState, Old National, and Umpqua banks.
  - **Independent:** Best Western (a nonprofit owned by its member hotels) and Good Neighbor Pharmacy (Cencora's network of independently owned pharmacies).

Still unmatched at the top of the list: closed chains still in the data (Payless, Kmart, Sears, Pier 1, Forever 21, Justice); ignition-interlock vendors; CAT Scale; and private chains with no current ownership source, such as Long John Silver's, Dickey's, Godfather's, Rainbow Shops, Curves, and Snap Fitness. Generic names like "China Wok" and "First National Bank" are different businesses that happen to share a name.

## Car makes and remaining public chains

Car dealers had only dealer groups (CarMax, AutoNation, Lithia, Carvana) and no car makes. Twenty-nine makes from twelve listed manufacturers are now included:

- **Toyota:** Toyota, Lexus.
- **Honda:** Honda, Acura.
- **Ford:** Ford, Lincoln.
- **GM:** Chevrolet, GMC, Buick, Cadillac.
- **Stellantis:** Jeep, Chrysler, Dodge/Ram.
- **Nissan:** Nissan, Infiniti.
- **Hyundai Motor Group:** Hyundai, Kia, Genesis.
- **Volkswagen Group:** Volkswagen, Audi, Porsche.
- **BMW:** BMW, MINI.
- **Others:** Subaru, Mazda, Mercedes-Benz, Volvo Cars, Harley-Davidson, Tesla (exact store names only, after "Tesla Collision", an independent body shop, matched in a live check), plus EchoPark (Sonic Automotive).

US dealerships are independently owned franchises, so these carry the dealer badge. Tesla is the exception: it sells through company-owned stores.

Dealer names usually put the make after the owner ("Koons Toyota of Annapolis"), so distinctive makes match anywhere in the name, but only in the Car dealers category. Independent repair shops ("Toyota Specialist Auto Repair") stay unknown. Lincoln, Dodge, Genesis, and MINI match only exact names, because they are also common place or business names.

Also added, each from investor or company sources:

- Airgas (Air Liquide), Fidelity National Title, Stewart Title, BOSS (Hugo Boss), and Rexel.
- Pizza Inn and Pie Five (Rave Restaurant Group), Tumi (Samsonite), and Eddie Bauer (Catalyst Brands).
- SRS Distribution (Home Depot, 2024) and Rack Room Shoes with Off Broadway (Deichmann).
- Associated, UMB, Prosperity, Bank OZK, First Interstate, Simmons, Valley, and Fulton banks.
- The Little Clinic (Kroger).

National coverage of chain locations is now 58.7%. Dealers mostly have unique names under the 5-location cutoff, so the scan undercounts the car-make gain.

## Home services

The BigQuery category count (`scripts/bigquery-category-counts.sql`) showed that Overture's largest US category, `home_service` (about 884,000 places), had no place in the app. The new **Home services** category (Services group) covers the trades and services that come to the home: plumbing, HVAC, electricians, pest control, roofing, cleaning, lawn and tree care, garage doors, painting, damage restoration, appliance repair, carpet and duct cleaning, handymen, pools, chimneys, junk removal, movers, home inspectors, windows, gutters, septic, security systems, and kitchen, bath, and flooring remodelers. General contractors, engineers, recycling centers, and fire protection (often volunteer fire companies) stay out; tailors stay in Repair. Matching mappings: OpenStreetMap `craft=plumber/electrician/hvac/roofer/painter/gardener/cleaning/...` and `office=pest_control/moving_company`, and Google `plumber`, `electrician`, `roofing_contractor`, `painter`, and `moving_company`, plus text searches for pest control, HVAC repair, and house cleaning.

The sector is one of the most consolidated by private equity. Brands added (45):

- **Neighborly (KKR, 2021):** Mr. Rooter, Mr. Electric, Aire Serv, Mr. Appliance, Mr. Handyman, Molly Maid, Glass Doctor, Rainbow Restoration, Five Star Painting, Window Genie, Precision Garage Door Service, Mosquito Joe, The Grounds Guys, Dryer Vent Wizard, ShelfGenie, and Real Property Management.
- **Authority Brands (Apax):** One Hour Heating & Air Conditioning, Benjamin Franklin Plumbing, Mister Sparky, Mosquito Squad, The Cleaning Authority, America's Swimming Pool Company, Monster Tree Service, Homewatch CareGivers, DoodyCalls, and Color World Housepainting.
- **Other PE platforms:** SERVPRO (Blackstone, 2019); ARS/Rescue Rooter (GI Partners with Charlesbank); BELFOR and BELFOR Franchise Group's 1-800 WATER DAMAGE, Chem-Dry, N-Hance, The Patch Boys, DUCTZ, and HOODZ (American Securities, 2019).
- **Public companies:** FirstService (CertaPro Painters, Paul Davis Restoration, California Closets, Floor Coverings International, Pillar To Post), Roto-Rooter (Chemed), Orkin and HomeTeam (Rollins), Terminix (Rentokil), and ADT.

ServiceMaster Clean and Restore, Merry Maids, Two Men and a Truck (Roark), and TruGreen (CD&R) were already listed. In a live check around Pikesville, 40 of 1,441 home-service listings matched, all correctly; the rest are mostly local tradespeople. Generic aliases ("ARS", "Paul Davis", "HomeTeam", "Precision Garage Door") were left out so independent businesses with those names stay unknown.

## Specialist doctors, mental health, and equipment rental

Two new Health categories cover care the app had no place for. Specialist practices and mental health clinics add up to about 400,000 US places in Overture.

- **Specialist doctors:**
  - Cardiology, dermatology, gastroenterology, orthopedics, urology, ENT, neurology, oncology, pain management, endocrinology, nephrology, pulmonology, rheumatology, allergy, OB/GYN, sports medicine, and plastic surgery.
  - Surgery centers.
  - Overture files many of these under internal medicine, so the rule runs before primary care. Plain internal medicine stays in Doctors & urgent care, and oral surgery stays with Dentists.
- **Mental health & addiction:**
  - Counseling, psychology, psychiatry, psychotherapy, and addiction treatment. Addiction treatment was previously left out of Physical therapy and had no category.
  - OpenStreetMap `healthcare=psychotherapist/counselling` also maps here. Google has no place type for these, so text searches are used instead.
- **Equipment rental** joins Storage & rentals (`machine_and_tool_rental`, `equipment_rental`, `party_equipment_rental`, `dumpster_rental`). There were only a handful of these places near Pikesville, too few for a category of their own.

Brands added (10):

- **Specialists:**
  - National Spine & Pain Centers (Avista Capital Partners).
  - Forefront Dermatology (Partners Group).
  - Gastro Health (OMERS Private Equity).
  - GI Alliance (Cardinal Health, 73% since January 2025).
- **Mental health:**
  - Mindpath Health (Centerbridge and Leonard Green).
  - Thriveworks (Regal Healthcare Capital Partners).
  - Acadia Healthcare. LifeStance Health was already listed.
- **Equipment rental:** United Rentals, Sunbelt Rentals, and Herc Rentals (with H&E).

Left out because the ownership trail conflicts across sources: Chesapeake Urology (Audax to United Urology Group to OneOncology) and Epiphany Dermatology. Around Pikesville, 427 specialist and 525 mental health listings now appear, mostly individual practices; National Spine & Pain Centers and two Thriveworks offices are labeled.

## Round 16: remaining national gaps

Re-ranking the national list after PR #13 put coverage at 58.4%. This round brings it to 59.0%. Added from company, investor, or trade sources:

- **PE-backed dental support groups:** Affordable Dentures & Implants and DDS Dentures (Affordable Care, owned by Berkshire Partners); Western Dental, now Sonrava Health (New Mountain Capital).
- **Hotels:** Americas Best Value Inn, Red Lion, Signature Inn, Knights Inn, and GuestHouse, all owned by Sonesta since its 2021 purchase of RLH.
- **Public companies:**
  - Ameris, WaFd, and WesBanco banks; Commerce Bank, limited to the Midwest because other banks share the name.
  - Chicago Title (FNF) and Old Republic Title.
  - Daltile (Mohawk), Camping World, and Option Care Health.
  - Lands' End, Timberland (VF), and Taco Time (MTY).
  - The Medicine Shoppe (Cardinal Health franchise) and CenterWell Home Health, formerly Kindred at Home (Humana).
  - Richmond American Homes (Sekisui House).
- **Private:** ABC Supply (the Hendricks family).
- **Name variants:** Bank of the West (BMO) and BenchMark Physical Therapy (Upstream Rehabilitation).

Not added: Snap Fitness (its PE owner TZP put it up for sale, and no buyer is confirmed), Curves (franchise rights have changed hands several times), and private family chains with no ownership source (Marco's, Dickey's, Long John Silver's, Godfather's, Hungry Howie's).

## Round 17: Maryland chains and Overture brand tags

Two more BigQuery scans:

- **`scripts/bigquery-maryland-chains.sql`** lists names with at least 2 Maryland locations. `scripts/rank-area-gaps.mjs` ranks the unmatched ones by Maryland count. Before this round, 46.6% of Maryland chain locations in app categories had an ownership label; now **49.5%** do.
- **`scripts/bigquery-brands-wikidata.sql`** lists Overture's brand tags. The app reads the brand tag directly, so a tagged member store such as "Gill-Roy's Hardware" (tagged Do it Best) now matches even though its name differs. Of 964 brand-tagged chains, 399 were unmatched. Most of those are ATMs, EV chargers, parking, and shipping points, which the app does not show.

National coverage is now 59.3%.

**Maryland and local chains.** Private local companies get a headquarters, so the *How local?* slider counts them as local corporations:

- High's (Carroll Independent Fuel, Baltimore), Dash In and Splash In (Wills Group, La Plata), Roy Rogers (Plamondon family, Frederick), Ledo Pizza (Beall family, Annapolis), and Mission BBQ (Glen Burnie).
- Mattress Warehouse (Wynnchurch Capital) and Long & Foster (HomeServices of America, Berkshire Hathaway).
- Banks:
  - Atlantic Union Bank, which absorbed Sandy Spring and Revere.
  - Shore United, Orrstown, First United, and Burke & Herbert.
  - Old Line Bank now matches WesBanco, and The Columbia Bank matches Fulton.
- Member-owned credit unions, limited to the Maryland area: SECU Maryland, APGFCU, Tower, and Educational Systems. North Carolina's SECU is a different credit union.
- Name variants: Pivot Physical Therapy (Athletico) and Jiffy Lube Oil Change.

**From brand tags:**

- **Co-ops:** Do it Best and Carpet One Floor & Home, both cooperatives of independent stores.
- **Insurance agent networks (dealer badge):** Erie, COUNTRY Financial, American Family, and GEICO.
- **Car makes:** Jaguar and Land Rover.
- **Health:** USPI surgery centers (Tenet), Clinical Pathology Laboratories (Sonic Healthcare), and CareNow (HCA).
- **PE-backed:** Crash Champions (Clearlake), Classic Collision (TPG), FleetPride and TruckPro (American Securities), and Gong cha (TA Associates, with a sale to Bain Capital agreed).
- **Public companies:** Sixt, Lovisa, Round1, MarineMax, Pop Mart, and For Eyes (EssilorLuxottica).
- **Name variants:** Hampton, Mercedes-Benz Vans, Tiffany & Company, and WebsterBank.

Not added: Johns Hopkins and MedStar practices (nonprofit health systems), and local chains with no ownership source (Pizza Boli's, America's Best Wings, Jerry's Subs & Pizza).

## Round 18: regional banks and merged-bank names

Coverage is now 59.7% nationally and 49.9% around Baltimore. Added, each from an investor or company source:

- **Banks:** Renasant, Hancock Whitney, Centennial (Home BancShares, limited to the Southeast), IBC, Banner, Trustmark, NBT, Trustco, First Merchants, and ACNB.
- **Old bank names now matched to their current owners:**
  - Great Western → First Interstate.
  - Chemical → Huntington.
  - IBERIABANK → First Horizon.
  - BBVA Compass → PNC.
  - Susquehanna → Truist.
- **Maryland credit unions** (member-owned, limited to the Maryland area): NASA, Freedom, First Financial, and Chessie.
- **Apparel and home:**
  - Tommy Hilfiger (PVH), Fossil, Lucky Brand (Catalyst Brands), and Garage (Groupe Dynamite; exact name only).
  - Bassett Furniture, with independent licensed dealers.
  - Dunn-Edwards (Nippon Paint) and MATHESON (Nippon Sanso).
  - Platt Electric Supply (Rexel).
- **Housing:** Meritage Homes, K. Hovnanian, and Weichert Realtors (privately held; many offices franchised).
- **Other name variants:**
  - U.S. HealthWorks → Concentra.
  - Just Tires, Goodyear Commercial Tire, and Roll by Goodyear → Goodyear.
  - Enterprise Car Sales → Enterprise.
  - PetSmart grooming, training, and day camp → PetSmart.
  - Tiger Mart → Exxon.
  - Casual Male XL → Destination XL.

## Round 19: regional chains in every state

`scripts/bigquery-regional-chains.sql` is one nationwide query. For each state, it lists names with at least 3 locations there that appear in no more than 4 states, so national chains drop out. It keeps the 300 largest per state, about 15,000 rows. `scripts/rank-regional-gaps.mjs` checks each one at its own center point and reports coverage by state.

Regional chains were the directory's weakest area: only 9.1% of their locations had an ownership label, compared with 60% for national chains. Regional banks were the largest group that could be verified, so this round focused on them. Regional coverage is now **13.3%**, and national coverage is **60.0%**.

- **Banks (public):**
  - Frost, First Commonwealth, Eastern, BancFirst, Banc of California (with Pacific Western), Rockland Trust, and Seacoast.
  - Zions' Amegy, California Bank & Trust, and National Bank of Arizona.
  - BOK Financial (Bank of Oklahoma, Bank of Texas, and Bank of Albuquerque).
  - Tri Counties, Westamerica, HBT, S&T, 1st Source, OceanFirst, Southside, PlainsCapital, Five Star, WSFS, Capital City, Mid Penn, Bank of Hawaii, Camden National, Kearny, First Mid, Stock Yards, Lake City, and Univest.
  - Names shared with unrelated banks are limited to the home state.
- **Merged names:** MB Financial → Fifth Third; Investors Bank → Citizens; Independent Financial → SouthState. Bare "Independent Bank" is a different Michigan bank and stays unmatched.
- **Credit unions (member-owned, home state only):** VyStar, Members 1st, Summit, Desert Financial, Idaho Central, Ent, MIDFLORIDA, Broadview, and Founders.
- **Other:**
  - OXXO (FEMSA) and Yoshinoya (Yoshinoya Holdings).
  - Edina Realty (HomeServices, Berkshire Hathaway).
  - Kessler Rehabilitation Center (Select Medical, private equity).

Not added yet:

- Family-owned regional convenience and restaurant chains (Mirabito, OnCue, Toot'n Totum, Runza, Eat'n Park, Skyline Chili, Imo's), which each need their own ownership source.
- Frisch's, which changed hands again and has no confirmed current owner.
- Nonprofit health systems.

## Round 20: family-owned regional chains

Regional coverage is up from 13.3% to **16.5%**. Each chain below was checked against trade press, local news, or the company's own history. Each gets a headquarters, so the *How local?* slider can count it as a local or regional company, and a home-region limit, so the name doesn't match unrelated businesses elsewhere.

- **Convenience stores:**
  - United Dairy Farmers (Lindner family), Mirabito, Byrne Dairy & Deli, and Crosby's (Reid Petroleum).
  - Toot'n Totum (Mitchell family), Stinker Stores (Jones family), OnCue, and Plaid Pantry.
  - Twice Daily, Sudden Service, Little General, and Maverick Quick Shop (Tri Star Energy, Nashville).
  - Double Quick (Refuel, which bought it in 2020).
  - Terrible's (Herbst family) and Big Apple (C.N. Brown).
- **Restaurants:**
  - Skyline Chili (Williams family, CEO Kevin McDonnell, and the Greater Cincinnati Foundation) and Gold Star Chili (Daoud family).
  - Imo's Pizza (Imo family), Biscuitville (Jennings family), Eat'n Park (Broadhurst family), and Bill Miller Bar-B-Q (Miller family).
  - Runza (Everett family), Filiberto's (Tenorio family and licensees), and Farmer Boys (Havadjias family).
  - Barro's Pizza (Barro siblings) and Blake's Lotaburger (Rule family).
  - Lou Malnati's (Malnati family, with an investment from Meritage Group).
  - Cottage Inn Pizza (owned by Christina Narra since 2023).
- **Other:**
  - Belle Tire (Barnes family) and Brown Bear Car Wash (Odermat family).
  - Bi-Mart, which is employee-owned and labeled corporate with an Oregon headquarters.
- **Cooperatives:** MFA Oil and its Break Time stores, owned by farmer members, are labeled independent / co-op.
- **Fixes:**
  - Certified Oil (EG Group, TDR) now also matches its convenience store listings, not only fuel.
  - Great Lakes Ace now matches Ace Hardware.

Not added, because current ownership was unclear: Monical's, Bush's Chicken, Brake Check, Frisch's, and Taco Mayo.

## Round 21: more regional chains

Regional coverage is up from 16.5% to **17.8%**. As in round 20, each chain has a headquarters (where it is privately held) and a home-region limit.

- **Family-owned or privately held:**
  - Rotten Robbie (Robinson family), GoMart (Heater family), Crew Carwash (Dahm family), and CC's Coffee House (Saurage family).
  - Han-Dee Hugo's (Sampson-Bladen Oil), Speedy Stop (C.L. Thomas), P. Terry's (Terry family), Vista Paint, and Mazzio's (Selby family).
  - Ono Hawaiian BBQ, which describes itself as family-owned.
  - Texas State Optical, owned by its franchisee optometrists since 2001.
- **PE-backed:**
  - Dobbs Tire & Auto Centers (Audax Private Equity), now including Ohio's Conrad's Tire Express.
  - In-Shape Family Fitness (Perpetual Capital Partners).
- **Other owners:**
  - eegee's: an affiliate of lender Gladstone Capital bought it out of bankruptcy in 2025.
  - Hele (Par Pacific) and Alaska Commercial Company (The North West Company).
- **Sister brands:**
  - True Texas BBQ → H-E-B.
  - Empire Visionworks → Visionworks.
  - Aloha Island Mart → Sunoco.
  - Brookshire's and Brookshire Brothers pharmacies now match their grocers.

Not added, because current ownership was unclear: Cobblestone Auto Spa, Nice N Easy, WaBa Grill, Higginbotham Brothers, and Taco Palenque.

## Not added in this pass

Harveys Supermarkets has been converted to Winn-Dixie. Closed chains (Jo-Ann, Party City, Pier 1, Tuesday Morning, 99 Cents Only), nonprofit thrift stores, and pharmacy networks made up of independent stores (Health Mart, Good Neighbor Pharmacy) were not added.
