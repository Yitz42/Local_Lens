-- Chains grouped by website domain instead of name, from Overture Maps places in BigQuery.
-- Catches chains whose locations use many different names (franchise names, "Brand of Town", "Brand - City")
-- and shows the name variants to add as aliases. Social media, directory, and site-builder domains are skipped.
WITH us_places AS (
  SELECT
    names.primary AS name,
    basic_category AS category,
    addresses.list[SAFE_OFFSET(0)].element.region AS region,
    NET.REG_DOMAIN(websites.list[SAFE_OFFSET(0)].element) AS domain
  FROM `bigquery-public-data.overture_maps.place`
  WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
    AND names.primary IS NOT NULL
    AND confidence >= 0.5
)
SELECT
  domain,
  COUNT(*) AS locations,
  COUNT(DISTINCT region) AS states,
  COUNT(DISTINCT LOWER(name)) AS name_variants,
  ARRAY_TO_STRING(ARRAY(SELECT CONCAT(t.value, ' (', CAST(t.count AS STRING), ')') FROM UNNEST(APPROX_TOP_COUNT(name, 5)) t), ' | ') AS top_names,
  APPROX_TOP_COUNT(category, 1)[OFFSET(0)].value AS top_category
FROM us_places
WHERE domain IS NOT NULL
  AND domain NOT IN ('facebook.com', 'instagram.com', 'google.com', 'yelp.com', 'business.site', 'wixsite.com',
    'square.site', 'squarespace.com', 'godaddysites.com', 'weebly.com', 'wordpress.com', 'linktr.ee', 'x.com',
    'twitter.com', 'tiktok.com', 'youtube.com', 'linkedin.com', 'yellowpages.com', 'mapquest.com', 'nextdoor.com',
    'site123.me', 'blogspot.com', 'ueniweb.com', 'toasttab.com', 'clover.com', 'doordash.com', 'grubhub.com',
    'ubereats.com', 'opentable.com', 'apple.com', 'goo.gl', 'bit.ly', 'zillow.com', 'realtor.com', 'state.us',
    'k12.us', 'gov', 'edu')
GROUP BY domain
HAVING locations >= 10
ORDER BY locations DESC
LIMIT 20000;
