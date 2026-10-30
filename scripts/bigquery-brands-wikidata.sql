-- Places Overture has tagged with a brand, grouped by the brand's Wikidata ID. The ID links each chain to a
-- structured record (parent company, owner) that can be checked in bulk, and the name variants become aliases.
WITH tagged AS (
  SELECT
    brand.wikidata AS wikidata,
    brand.names.primary AS brand,
    names.primary AS name,
    basic_category AS category,
    addresses.list[SAFE_OFFSET(0)].element.region AS region
  FROM `bigquery-public-data.overture_maps.place`
  WHERE addresses.list[SAFE_OFFSET(0)].element.country = 'US'
    AND brand.names.primary IS NOT NULL
),
agg AS (
  SELECT
    wikidata,
    APPROX_TOP_COUNT(brand, 1)[OFFSET(0)].value AS brand,
    COUNT(*) AS locations,
    COUNT(DISTINCT region) AS states,
    APPROX_TOP_COUNT(name, 5) AS top_name_counts,
    APPROX_TOP_COUNT(category, 1)[OFFSET(0)].value AS top_category
  FROM tagged
  GROUP BY wikidata
  HAVING locations >= 5
)
SELECT
  * EXCEPT (top_name_counts),
  ARRAY_TO_STRING(ARRAY(SELECT CONCAT(t.value, ' (', CAST(t.count AS STRING), ')') FROM UNNEST(top_name_counts) t), ' | ') AS top_names
FROM agg
ORDER BY locations DESC;
