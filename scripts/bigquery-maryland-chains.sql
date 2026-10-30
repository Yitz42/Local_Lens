-- Local and regional chains around Baltimore: names with at least 2 locations in Maryland, D.C., Delaware,
-- and northern Virginia, with how much of each chain is in the area. Small regional chains rarely show up in
-- the national counts. Change the region list for another area.
WITH area AS (
  SELECT
    TRIM(REGEXP_REPLACE(LOWER(names.primary), r'[^a-z0-9]+', ' ')) AS name_key,
    names.primary AS name,
    basic_category AS category,
    REGEXP_REPLACE(addresses.list[SAFE_OFFSET(0)].element.region, r'^US-', '') AS region,
    NET.REG_DOMAIN(websites.list[SAFE_OFFSET(0)].element) AS domain
  FROM `bigquery-public-data.overture_maps.place`
  WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
    AND REGEXP_REPLACE(addresses.list[SAFE_OFFSET(0)].element.region, r'^US-', '') IN ('MD', 'DC', 'DE', 'VA', 'PA')
    AND names.primary IS NOT NULL
    AND confidence >= 0.5
)
SELECT
  name_key,
  APPROX_TOP_COUNT(name, 1)[OFFSET(0)].value AS example_name,
  COUNT(*) AS locations,
  COUNTIF(region = 'MD') AS in_maryland,
  APPROX_TOP_COUNT(category, 1)[OFFSET(0)].value AS top_category,
  APPROX_TOP_COUNT(domain, 1)[OFFSET(0)].value AS top_domain
FROM area
WHERE name_key != ''
GROUP BY name_key
HAVING locations >= 2 AND in_maryland >= 2
ORDER BY in_maryland DESC
LIMIT 20000;
