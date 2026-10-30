-- The 40 most common names in each basic category, so every category in the app can be filled out with its
-- biggest chains, including categories where chains are small.
WITH named AS (
  SELECT
    basic_category AS category,
    TRIM(REGEXP_REPLACE(LOWER(names.primary), r'[^a-z0-9]+', ' ')) AS name_key,
    names.primary AS name,
    addresses.list[SAFE_OFFSET(0)].element.region AS region
  FROM `bigquery-public-data.overture_maps.place`
  WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
    AND names.primary IS NOT NULL
    AND confidence >= 0.5
),
counted AS (
  SELECT
    category,
    name_key,
    APPROX_TOP_COUNT(name, 1)[OFFSET(0)].value AS example_name,
    COUNT(*) AS locations,
    COUNT(DISTINCT region) AS states
  FROM named
  WHERE name_key != ''
  GROUP BY category, name_key
  HAVING locations >= 3
)
SELECT *
FROM counted
QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY locations DESC) <= 40
ORDER BY category, locations DESC;
