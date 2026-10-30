-- Regional and local chains in every US state from Overture Maps places in BigQuery's public dataset.
-- A name counts as regional when it has at least 3 locations in a state and appears in no more than 4 states,
-- so national chains drop out. Keeps the 300 largest per state, with a center point for checking ownership and
-- the most common website domain. Rank the export with: node scripts/rank-regional-gaps.mjs results.csv
WITH places AS (
  SELECT
    TRIM(REGEXP_REPLACE(LOWER(names.primary), r'[^a-z0-9]+', ' ')) AS name_key,
    names.primary AS name,
    basic_category AS category,
    REGEXP_REPLACE(addresses.list[SAFE_OFFSET(0)].element.region, r'^US-', '') AS region,
    NET.REG_DOMAIN(websites.list[SAFE_OFFSET(0)].element) AS domain,
    ST_Y(geometry) AS lat,
    ST_X(geometry) AS lng
  FROM `bigquery-public-data.overture_maps.place`
  WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
    AND names.primary IS NOT NULL
    AND confidence >= 0.5
),
totals AS (
  SELECT name_key, COUNT(*) AS us_locations, COUNT(DISTINCT region) AS states
  FROM places
  WHERE name_key != ''
  GROUP BY name_key
),
per_state AS (
  SELECT
    p.region,
    p.name_key,
    APPROX_TOP_COUNT(p.name, 1)[OFFSET(0)].value AS example_name,
    COUNT(*) AS in_state,
    APPROX_TOP_COUNT(p.category, 1)[OFFSET(0)].value AS top_category,
    APPROX_TOP_COUNT(p.domain, 1)[OFFSET(0)].value AS top_domain,
    ROUND(AVG(p.lat), 3) AS center_lat,
    ROUND(AVG(p.lng), 3) AS center_lng
  FROM places p
  JOIN totals t USING (name_key)
  WHERE t.states <= 4 AND p.region IS NOT NULL
  GROUP BY p.region, p.name_key
  HAVING in_state >= 3
)
SELECT s.*, t.us_locations, t.states
FROM per_state s
JOIN totals t USING (name_key)
QUALIFY ROW_NUMBER() OVER (PARTITION BY s.region ORDER BY s.in_state DESC) <= 300
ORDER BY s.region, s.in_state DESC;
