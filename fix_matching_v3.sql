-- ============================================================
-- FIX MATCHING V3
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Drop ALL overloads to avoid "multiple functions" conflict
DROP FUNCTION IF EXISTS public.match_beds_for_lead(text, numeric, text, text[]);
DROP FUNCTION IF EXISTS public.match_beds_for_lead(text, numeric);
DROP FUNCTION IF EXISTS public.match_beds_for_lead(numeric, text, text, text[]);
DROP FUNCTION IF EXISTS public.match_beds_for_lead(numeric, text);

-- 2. Unlock all auto-locked rooms so they appear in results
UPDATE public.rooms SET auto_locked = false WHERE auto_locked = true;

-- 3. Ensure at least some beds are vacant
UPDATE public.beds
SET status = 'vacant'
WHERE status = 'occupied'
  AND id IN (
    SELECT b.id FROM public.beds b
    JOIN public.rooms r ON r.id = b.room_id
    JOIN public.properties p ON p.id = r.property_id
    WHERE p.is_active = true
    LIMIT 50
  );

-- 4. Re-create the function cleanly (no auto_locked filter)
CREATE OR REPLACE FUNCTION public.match_beds_for_lead(
  p_location  text,
  p_budget    numeric,
  p_room_type text    DEFAULT NULL,
  p_interests text[]  DEFAULT '{}'
)
RETURNS TABLE(
  bed_id            uuid,
  bed_number        text,
  room_id           uuid,
  room_number       text,
  room_type         text,
  rent_per_bed      numeric,
  property_id       uuid,
  property_name     text,
  property_area     text,
  property_interests text[],
  match_score       integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_interests boolean;
  v_has_location  boolean;
  v_has_budget    boolean;
BEGIN
  v_has_interests := p_interests IS NOT NULL AND array_length(p_interests, 1) > 0;
  v_has_location  := p_location  IS NOT NULL AND p_location  <> '';
  v_has_budget    := p_budget    IS NOT NULL AND p_budget    > 0;

  RETURN QUERY
  SELECT
    b.id            AS bed_id,
    b.bed_number,
    r.id            AS room_id,
    r.room_number,
    r.room_type,
    COALESCE(r.rent_per_bed, 0) AS rent_per_bed,
    p.id            AS property_id,
    p.name          AS property_name,
    p.area          AS property_area,
    p.interests     AS property_interests,
    (
      -- LOCATION SCORE (30 pts)
      CASE
        WHEN NOT v_has_location THEN 10
        WHEN lower(p.area) = lower(p_location) THEN 30
        WHEN lower(p.area) LIKE '%' || lower(p_location) || '%'
          OR lower(p_location) LIKE '%' || lower(p.area) || '%' THEN 22
        WHEN lower(p.city) LIKE '%' || lower(p_location) || '%' THEN 12
        ELSE 5
      END

      -- BUDGET SCORE (30 pts)
      + CASE
        WHEN NOT v_has_budget OR r.rent_per_bed IS NULL THEN 10
        WHEN r.rent_per_bed <= p_budget              THEN 30
        WHEN r.rent_per_bed <= p_budget * 1.1        THEN 24
        WHEN r.rent_per_bed <= p_budget * 1.25       THEN 16
        WHEN r.rent_per_bed <= p_budget * 1.5        THEN 8
        ELSE 3
      END

      -- INTEREST SCORE (30 pts)
      + CASE
        WHEN NOT v_has_interests THEN 5
        WHEN p.interests IS NULL OR array_length(p.interests, 1) IS NULL THEN 0
        ELSE (
          SELECT LEAST(30,
            COUNT(*) * 30 / NULLIF(array_length(p_interests, 1), 0)
          )::integer
          FROM unnest(p_interests) AS li
          WHERE EXISTS (
            SELECT 1 FROM unnest(p.interests) AS pi
            WHERE lower(pi) = lower(li)
          )
        )
      END

      -- ROOM TYPE SCORE (5 pts)
      + CASE
        WHEN p_room_type IS NULL THEN 3
        WHEN r.room_type = p_room_type THEN 5
        ELSE 0
      END

      -- AVAILABILITY BONUS (5 pts)
      + CASE
        WHEN b.status = 'vacant'        THEN 5
        WHEN b.status = 'vacating_soon' THEN 3
        ELSE 1
      END
    )::integer AS match_score

  FROM public.beds b
  JOIN public.rooms r ON r.id = b.room_id
  JOIN public.properties p ON p.id = r.property_id
  WHERE
    b.status IN ('vacant', 'vacating_soon')
    AND p.is_active = true

  ORDER BY match_score DESC, p.name, b.bed_number
  LIMIT 20;
END;
$$;

-- 5. Grant execute to all authenticated users
GRANT EXECUTE ON FUNCTION public.match_beds_for_lead(text, numeric, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_beds_for_lead(text, numeric, text, text[]) TO anon;

-- 6. Quick verification
SELECT 'Vacant beds: ' || COUNT(*) FROM public.beds WHERE status IN ('vacant','vacating_soon');
SELECT 'Active properties: ' || COUNT(*) FROM public.properties WHERE is_active = true;
SELECT 'Unlocked rooms: ' || COUNT(*) FROM public.rooms WHERE auto_locked = false;
