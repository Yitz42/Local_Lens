-- How many US places Overture puts in each basic category, with example names. Shows which large categories
-- the app does not map yet (candidates for new categories) and which ones are noisy.
SELECT
  basic_category,
  COUNT(*) AS places,
  COUNT(DISTINCT TRIM(REGEXP_REPLACE(LOWER(names.primary), r'[^a-z0-9]+', ' '))) AS distinct_names,
  ARRAY_TO_STRING(ARRAY_AGG(DISTINCT names.primary IGNORE NULLS LIMIT 8), ' | ') AS sample_names
FROM `bigquery-public-data.overture_maps.place`
WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
  AND confidence >= 0.5
GROUP BY basic_category
ORDER BY places DESC;
