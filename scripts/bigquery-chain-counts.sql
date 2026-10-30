-- Nationwide chain counts from Overture Maps places in BigQuery's public dataset.
-- Lists every place name with at least 25 US locations, so the most common chains can be checked
-- against data/brands.json (unmatched ones become the next research list).
-- Run in the BigQuery console; it reads only the name, category, brand, and address columns.
WITH us_places AS (
  SELECT
    names.primary AS name,
    TRIM(REGEXP_REPLACE(LOWER(names.primary), r'[^a-z0-9]+', ' ')) AS name_key,
    basic_category AS category,
    brand.names.primary AS brand,
    addresses.list[SAFE_OFFSET(0)].element.region AS region
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
  APPROX_TOP_COUNT(category, 1)[OFFSET(0)].value AS top_category,
  APPROX_TOP_COUNT(brand, 1)[OFFSET(0)].value AS top_brand
FROM us_places
WHERE name_key != ''
GROUP BY name_key
HAVING locations >= 25
ORDER BY locations DESC
LIMIT 5000;
