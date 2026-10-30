-- Larger nationwide chain scan from Overture Maps places in BigQuery's public dataset.
-- Every US place name with at least 5 locations, with where it is (top states and a center point, so
-- regional chains can get a matchBounds guard) and its most common website domain (which ties together
-- listings whose names vary, like "Hanger Clinic" and "Hanger Clinic: Prosthetics & Orthotics").
WITH us_places AS (
  SELECT
    names.primary AS name,
    TRIM(REGEXP_REPLACE(LOWER(names.primary), r'[^a-z0-9]+', ' ')) AS name_key,
    basic_category AS category,
    brand.names.primary AS brand,
    addresses.list[SAFE_OFFSET(0)].element.region AS region,
    NET.REG_DOMAIN(websites.list[SAFE_OFFSET(0)].element) AS domain,
    ST_Y(geometry) AS lat,
    ST_X(geometry) AS lng
  FROM `bigquery-public-data.overture_maps.place`
  WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
    AND names.primary IS NOT NULL
    AND confidence >= 0.5
)
SELECT
  name_key,
  APPROX_TOP_COUNT(name, 1)[OFFSET(0)].value AS example_name,
  COUNT(*) AS locations,
  COUNT(DISTINCT region) AS states,
  ARRAY_TO_STRING(ARRAY(SELECT CONCAT(t.value, ':', CAST(t.count AS STRING)) FROM UNNEST(APPROX_TOP_COUNT(region, 5)) t WHERE t.value IS NOT NULL), ' ') AS top_states,
  ROUND(AVG(lat), 2) AS center_lat,
  ROUND(AVG(lng), 2) AS center_lng,
  ROUND(MIN(lat), 2) AS min_lat, ROUND(MAX(lat), 2) AS max_lat,
  ROUND(MIN(lng), 2) AS min_lng, ROUND(MAX(lng), 2) AS max_lng,
  APPROX_TOP_COUNT(category, 1)[OFFSET(0)].value AS top_category,
  APPROX_TOP_COUNT(brand, 1)[OFFSET(0)].value AS top_brand,
  APPROX_TOP_COUNT(domain, 1)[OFFSET(0)].value AS top_domain
FROM us_places
WHERE name_key != ''
GROUP BY name_key
HAVING locations >= 5
ORDER BY locations DESC
LIMIT 60000;
