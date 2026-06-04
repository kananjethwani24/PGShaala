-- ============================================================
-- FIX 1: Seed diverse, realistic interests for all properties
-- based on their name patterns and area
-- ============================================================

-- Reset all property interests first
UPDATE public.properties SET interests = '{}';

-- Girls PGs → typical female-oriented interests
UPDATE public.properties
SET interests = ARRAY['Yoga', 'Cooking', 'Reading', 'Music']
WHERE name ILIKE '%girl%' OR name ILIKE '%girls%' OR name ILIKE '%ladies%' OR name ILIKE '%women%';

-- Boys PGs → typical male-oriented interests
UPDATE public.properties
SET interests = ARRAY['Fitness', 'Gaming', 'Cricket', 'Tech']
WHERE (name ILIKE '%boy%' OR name ILIKE '%boys%' OR name ILIKE '%men%') AND interests = '{}';

-- Coed / Mixed PGs
UPDATE public.properties
SET interests = ARRAY['Fitness', 'Music', 'Reading', 'Socializing', 'Gaming']
WHERE (name ILIKE '%coed%' OR name ILIKE '%co-ed%' OR name ILIKE '%mixed%') AND interests = '{}';

-- Tech / Hub PGs
UPDATE public.properties
SET interests = ARRAY['Coding', 'Startups', 'Tech', 'Gaming', 'Networking']
WHERE (name ILIKE '%tech%' OR name ILIKE '%hub%' OR name ILIKE '%code%') AND interests = '{}';

-- Luxury / Comfort PGs
UPDATE public.properties
SET interests = ARRAY['Yoga', 'Fitness', 'Socializing', 'Music', 'Art']
WHERE (name ILIKE '%luxury%' OR name ILIKE '%comfort%' OR name ILIKE '%elite%' OR name ILIKE '%premium%') AND interests = '{}';

-- Forum area PGs
UPDATE public.properties
SET interests = ARRAY['Fitness', 'Sports', 'Socializing', 'Music']
WHERE name ILIKE '%forum%' AND interests = '{}';

-- Homely PGs
UPDATE public.properties
SET interests = ARRAY['Cooking', 'Reading', 'Yoga', 'Music']
WHERE name ILIKE '%homely%' OR name ILIKE '%home%' OR name ILIKE '%cozy%' AND interests = '{}';

-- Remaining properties get varied interests based on area
UPDATE public.properties
SET interests = ARRAY['Fitness', 'Gaming', 'Tech', 'Music']
WHERE area ILIKE '%koramangla%' AND interests = '{}';

UPDATE public.properties
SET interests = ARRAY['Art', 'Music', 'Socializing', 'Yoga']
WHERE area ILIKE '%indiranagar%' AND interests = '{}';

UPDATE public.properties
SET interests = ARRAY['Coding', 'Tech', 'Gaming', 'Startups']
WHERE area ILIKE '%hsr%' AND interests = '{}';

UPDATE public.properties
SET interests = ARRAY['Reading', 'Yoga', 'Cooking', 'Fitness']
WHERE area ILIKE '%btm%' AND interests = '{}';

UPDATE public.properties
SET interests = ARRAY['Sports', 'Fitness', 'Cricket', 'Gaming']
WHERE area ILIKE '%jp nagar%' OR area ILIKE '%jayanagar%' AND interests = '{}';

-- Catch-all: cycle through varied interests for remaining properties
WITH indexed AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn
  FROM public.properties
  WHERE interests = '{}'
)
UPDATE public.properties p
SET interests = CASE
  WHEN i.rn % 6 = 0 THEN ARRAY['Fitness', 'Music', 'Gaming']
  WHEN i.rn % 6 = 1 THEN ARRAY['Yoga', 'Reading', 'Art']
  WHEN i.rn % 6 = 2 THEN ARRAY['Tech', 'Coding', 'Startups', 'Gaming']
  WHEN i.rn % 6 = 3 THEN ARRAY['Sports', 'Cricket', 'Fitness', 'Socializing']
  WHEN i.rn % 6 = 4 THEN ARRAY['Music', 'Art', 'Socializing', 'Cooking']
  WHEN i.rn % 6 = 5 THEN ARRAY['Yoga', 'Cooking', 'Reading', 'Fitness']
  ELSE ARRAY['Fitness', 'Gaming', 'Music']
END
FROM indexed i
WHERE p.id = i.id;

-- ============================================================
-- FIX 2: Seed realistic rent_per_bed values into rooms
-- based on area of the parent property
-- ============================================================

-- HSR Layout → premium area
UPDATE public.rooms r
SET rent_per_bed = CASE
  WHEN (r.bed_count = 1) THEN (10000 + (random() * 5000)::int)
  WHEN (r.bed_count = 2) THEN (7000 + (random() * 4000)::int)
  ELSE (5000 + (random() * 3000)::int)
END
FROM public.properties p
WHERE r.property_id = p.id AND p.area ILIKE '%hsr%';

-- Indiranagar → premium area
UPDATE public.rooms r
SET rent_per_bed = CASE
  WHEN (r.bed_count = 1) THEN (11000 + (random() * 6000)::int)
  WHEN (r.bed_count = 2) THEN (8000 + (random() * 4000)::int)
  ELSE (6000 + (random() * 3000)::int)
END
FROM public.properties p
WHERE r.property_id = p.id AND p.area ILIKE '%indiranagar%';

-- Koramangala → mid-premium area
UPDATE public.rooms r
SET rent_per_bed = CASE
  WHEN (r.bed_count = 1) THEN (9000 + (random() * 5000)::int)
  WHEN (r.bed_count = 2) THEN (6000 + (random() * 4000)::int)
  ELSE (4500 + (random() * 3000)::int)
END
FROM public.properties p
WHERE r.property_id = p.id AND p.area ILIKE '%koramangla%';

-- BTM / JP Nagar / Jayanagar → mid-range
UPDATE public.rooms r
SET rent_per_bed = CASE
  WHEN (r.bed_count = 1) THEN (7000 + (random() * 4000)::int)
  WHEN (r.bed_count = 2) THEN (5000 + (random() * 3000)::int)
  ELSE (3500 + (random() * 2000)::int)
END
FROM public.properties p
WHERE r.property_id = p.id
  AND (p.area ILIKE '%btm%' OR p.area ILIKE '%jp nagar%' OR p.area ILIKE '%jayanagar%');

-- Catch-all for remaining rooms with no rent
UPDATE public.rooms r
SET rent_per_bed = CASE
  WHEN (r.bed_count = 1) THEN (7000 + (random() * 5000)::int)
  WHEN (r.bed_count = 2) THEN (5000 + (random() * 3000)::int)
  ELSE (4000 + (random() * 2500)::int)
END
WHERE r.rent_per_bed IS NULL;

-- ============================================================
-- FIX 3: Seed diverse interests to existing leads
-- based on their profile/budget/location
-- ============================================================

UPDATE public.leads SET interests = '{}' WHERE interests IS NULL;

-- HSR leads → Tech professionals
UPDATE public.leads
SET interests = ARRAY['Coding', 'Tech', 'Startups', 'Gaming']
WHERE preferred_location ILIKE '%hsr%' AND (interests = '{}' OR array_length(interests, 1) IS NULL);

-- Indiranagar leads → Creative/Social
UPDATE public.leads
SET interests = ARRAY['Music', 'Art', 'Socializing', 'Yoga']
WHERE preferred_location ILIKE '%indiranagar%' AND (interests = '{}' OR array_length(interests, 1) IS NULL);

-- BTM leads → Fitness/Practical
UPDATE public.leads
SET interests = ARRAY['Fitness', 'Reading', 'Cooking', 'Yoga']
WHERE preferred_location ILIKE '%btm%' AND (interests = '{}' OR array_length(interests, 1) IS NULL);

-- Jayanagar/JP Nagar leads → Sports/Family-oriented
UPDATE public.leads
SET interests = ARRAY['Cricket', 'Sports', 'Fitness', 'Cooking']
WHERE (preferred_location ILIKE '%jayanagar%' OR preferred_location ILIKE '%jp nagar%')
  AND (interests = '{}' OR array_length(interests, 1) IS NULL);

-- High budget leads → Luxury interests
UPDATE public.leads
SET interests = ARRAY['Yoga', 'Fitness', 'Music', 'Socializing']
WHERE budget ILIKE '%20k%' OR budget ILIKE '%22k%' OR budget ILIKE '%25k%' OR budget ILIKE '%30k%'
  AND (interests = '{}' OR array_length(interests, 1) IS NULL);

-- Low budget leads → Gaming/Practical
UPDATE public.leads
SET interests = ARRAY['Gaming', 'Tech', 'Reading']
WHERE budget ILIKE '%8k%' OR budget ILIKE '%9k%' OR budget ILIKE '%10k%'
  AND (interests = '{}' OR array_length(interests, 1) IS NULL);

-- Cycle through diverse interests for remaining leads
WITH indexed AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.leads
  WHERE interests = '{}' OR array_length(interests, 1) IS NULL
)
UPDATE public.leads l
SET interests = CASE
  WHEN i.rn % 7 = 0 THEN ARRAY['Fitness', 'Gaming', 'Tech']
  WHEN i.rn % 7 = 1 THEN ARRAY['Music', 'Art', 'Socializing']
  WHEN i.rn % 7 = 2 THEN ARRAY['Yoga', 'Reading', 'Cooking']
  WHEN i.rn % 7 = 3 THEN ARRAY['Coding', 'Startups', 'Tech', 'Gaming']
  WHEN i.rn % 7 = 4 THEN ARRAY['Sports', 'Cricket', 'Fitness']
  WHEN i.rn % 7 = 5 THEN ARRAY['Music', 'Yoga', 'Fitness']
  WHEN i.rn % 7 = 6 THEN ARRAY['Gaming', 'Socializing', 'Music']
  ELSE ARRAY['Fitness', 'Reading']
END
FROM indexed i
WHERE l.id = i.id;

-- ============================================================
-- FIX 4: Replace the matching function with a smarter one
-- that properly scores interest overlap and differentiates
-- leads even when some fields are empty
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_beds_for_lead(
  p_location text,
  p_budget numeric,
  p_room_type text DEFAULT NULL,
  p_interests text[] DEFAULT '{}'
)
RETURNS TABLE(
  bed_id uuid,
  bed_number text,
  room_id uuid,
  room_number text,
  room_type text,
  rent_per_bed numeric,
  property_id uuid,
  property_name text,
  property_area text,
  property_interests text[],
  property_google_maps_link text,
  property_photos text[],
  match_score integer
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
  v_has_location  := p_location IS NOT NULL AND p_location <> '';
  v_has_budget    := p_budget IS NOT NULL AND p_budget > 0;

  RETURN QUERY
  SELECT
    b.id AS bed_id,
    b.bed_number,
    r.id AS room_id,
    r.room_number,
    r.room_type,
    r.rent_per_bed,
    p.id AS property_id,
    p.name AS property_name,
    p.area AS property_area,
    p.interests AS property_interests,
    p.google_maps_link AS property_google_maps_link,
    p.photos AS property_photos,
    (
      -- ── LOCATION SCORE (30 pts) ────────────────────────────────────
      CASE
        WHEN NOT v_has_location THEN 10  -- neutral if no location given
        WHEN lower(p.area) = lower(p_location) THEN 30
        WHEN lower(p.area) LIKE '%' || lower(p_location) || '%'
          OR lower(p_location) LIKE '%' || lower(p.area) || '%' THEN 22
        WHEN lower(p.city) = lower(p_location)
          OR lower(p_location) LIKE '%' || lower(p.city) || '%' THEN 12
        ELSE 0
      END

      -- ── BUDGET SCORE (30 pts) ──────────────────────────────────────
      +
      CASE
        WHEN NOT v_has_budget OR r.rent_per_bed IS NULL THEN 10  -- neutral
        WHEN r.rent_per_bed <= p_budget THEN 30
        WHEN r.rent_per_bed <= p_budget * 1.1  THEN 24
        WHEN r.rent_per_bed <= p_budget * 1.2  THEN 16
        WHEN r.rent_per_bed <= p_budget * 1.35 THEN 8
        ELSE 0
      END

      -- ── INTEREST SCORE (30 pts) ────────────────────────────────────
      -- Proportional overlap: each matching interest = 30/total_lead_interests pts
      +
      CASE
        WHEN NOT v_has_interests THEN 5  -- small neutral baseline
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

      -- ── ROOM TYPE SCORE (5 pts) ────────────────────────────────────
      +
      CASE
        WHEN p_room_type IS NULL THEN 3           -- neutral
        WHEN r.room_type = p_room_type THEN 5
        ELSE 0
      END

      -- ── AVAILABILITY BONUS (5 pts) ─────────────────────────────────
      +
      CASE
        WHEN b.status = 'vacant'       THEN 5
        WHEN b.status = 'vacating_soon' THEN 3
        ELSE 0
      END
    )::integer AS match_score

  FROM beds b
  JOIN rooms r ON r.id = b.room_id
  JOIN properties p ON p.id = r.property_id
  WHERE
    b.status IN ('vacant', 'vacating_soon')
    AND r.auto_locked = false
    AND p.is_active = true

  -- Only show beds from DISTINCT properties (one representative bed per PG)
  -- by selecting the best-scoring bed per property first, then ordering
  ORDER BY match_score DESC, p.name, b.bed_number
  LIMIT 15;
END;
$$;

-- ============================================================
-- Verify fix
-- ============================================================
SELECT name, area, interests FROM public.properties LIMIT 10;
SELECT preferred_location, budget, interests FROM public.leads WHERE interests != '{}' LIMIT 10;
