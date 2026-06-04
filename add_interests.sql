-- Add interests to leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- Add interests to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- Update the match_beds_for_lead RPC to use interests
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
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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
    (
      -- Location match (30 pts)
      CASE WHEN lower(p.area) = lower(p_location) THEN 30
           WHEN lower(p.area) LIKE '%' || lower(p_location) || '%' THEN 20
           WHEN lower(p.city) = lower(p_location) THEN 10
           ELSE 0 END
      +
      -- Budget match (30 pts)
      CASE WHEN r.rent_per_bed IS NOT NULL AND p_budget > 0 THEN
        CASE WHEN r.rent_per_bed <= p_budget THEN 30
             WHEN r.rent_per_bed <= p_budget * 1.15 THEN 20
             WHEN r.rent_per_bed <= p_budget * 1.3 THEN 10
             ELSE 0 END
      ELSE 10 END
      +
      -- Interests match (20 pts)
      CASE WHEN p_interests IS NOT NULL AND array_length(p_interests, 1) > 0 THEN
        -- Add 20 points if there is any overlap in interests
        (
          SELECT CASE WHEN count(*) > 0 THEN 20 ELSE 0 END
          FROM unnest(p_interests) AS u_i
          JOIN unnest(p.interests) AS p_i ON lower(u_i) = lower(p_i)
        )
      ELSE 0 END
      +
      -- Room type match (10 pts)
      CASE WHEN p_room_type IS NOT NULL AND r.room_type = p_room_type THEN 10
           WHEN p_room_type IS NULL THEN 5
           ELSE 0 END
      +
      -- Availability bonus (10 pts)
      CASE WHEN b.status = 'vacant' THEN 10
           WHEN b.status = 'vacating_soon' THEN 5
           ELSE 0 END
    )::integer AS match_score
  FROM beds b
  JOIN rooms r ON r.id = b.room_id
  JOIN properties p ON p.id = r.property_id
  WHERE b.status IN ('vacant', 'vacating_soon')
    AND r.auto_locked = false
    AND p.is_active = true
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$;

-- Seed some dummy interests for testing
UPDATE public.properties SET interests = ARRAY['Fitness', 'Gaming', 'Reading'] WHERE name ILIKE '%comfort%';
UPDATE public.properties SET interests = ARRAY['Music', 'Art', 'Socializing'] WHERE name ILIKE '%luxury%';
UPDATE public.properties SET interests = ARRAY['Coding', 'Startups', 'Tech'] WHERE name ILIKE '%tech%' OR name ILIKE '%hub%';
UPDATE public.properties SET interests = ARRAY['Fitness', 'Music'] WHERE interests = '{}';

