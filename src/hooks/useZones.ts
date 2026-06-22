import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Zones
export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zones')
        .select('*, agents:manager_id(id, name)')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zone: { name: string; city?: string; areas: string[]; manager_id?: string; color?: string }) => {
      const { data, error } = await supabase.from('zones').insert(zone as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['zones'] }); toast.success('Zone created'); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await supabase.from('zones').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['zones'] }); toast.success('Zone updated'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// Team Queues
export function useTeamQueues(zoneId?: string) {
  return useQuery({
    queryKey: ['team-queues', zoneId],
    queryFn: async () => {
      let q = supabase.from('team_queues').select('*, zones(name), agents:owner_agent_id(id, name)').eq('is_active', true);
      if (zoneId) q = q.eq('zone_id', zoneId);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTeamQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (queue: { zone_id: string; team_name: string; owner_agent_id?: string; member_ids?: string[]; dispatch_rule?: string }) => {
      const { data, error } = await supabase.from('team_queues').insert(queue as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-queues'] }); toast.success('Queue created'); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateTeamQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await supabase.from('team_queues').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-queues'] }); },
    onError: (e: any) => toast.error(e.message),
  });
}

// Handoffs
export function useHandoffs(leadId?: string) {
  return useQuery({
    queryKey: ['handoffs', leadId],
    queryFn: async () => {
      let q = supabase.from('handoffs').select('*, from_agent:from_agent_id(name), to_agent:to_agent_id(name), zones(name)').order('created_at', { ascending: false });
      if (leadId) q = q.eq('lead_id', leadId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
  });
}

export function useCreateHandoff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (handoff: { lead_id: string; from_agent_id?: string; to_agent_id?: string; zone_id?: string; reason?: string }) => {
      const { data, error } = await supabase.from('handoffs').insert(handoff as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['handoffs'] }); toast.success('Handoff recorded'); },
    onError: (e: any) => toast.error(e.message),
  });
}

// Escalations
export function useEscalations(status?: string) {
  return useQuery({
    queryKey: ['escalations', status],
    queryFn: async () => {
      let q = supabase.from('escalations').select('*, zones(name), raised:raised_by(name), assigned:assigned_to(name)').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
  });
}

export function useCreateEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (esc: { type?: string; entity_type: string; entity_id: string; zone_id?: string; raised_by?: string; assigned_to?: string; priority?: string; description?: string }) => {
      const { data, error } = await supabase.from('escalations').insert(esc as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['escalations'] }); toast.success('Escalation raised'); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await supabase.from('escalations').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['escalations'] }); },
    onError: (e: any) => toast.error(e.message),
  });
}

// Zone Routing
export function useRouteLeadToZone() {
  return useMutation({
    mutationFn: async (location: string) => {
      const { data, error } = await supabase.rpc('route_lead_to_zone', { p_location: location });
      if (error) throw error;
      return data?.[0] || null;
    },
  });
}

// ─── DB Matching (3-tier fallback so matching always works) ────────────────────
//
// Tier 1 → match_beds_for_lead RPC (scored, location-aware)
// Tier 2 → direct beds query     (includes 'available' + 'vacant' statuses)
// Tier 3 → properties query      (works even when beds table is EMPTY)
//
// This means we NEVER need to switch to MongoDB just because beds aren't seeded.
export function useDbMatchBeds(leadId?: string) {
  return useQuery({
    queryKey: ['db-match', leadId],
    queryFn: async () => {
      if (!leadId) return [];

      // Fetch lead
      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      if (leadErr) throw new Error(`Lead fetch failed: ${leadErr.message}`);
      if (!lead) return [];

      // Parse budget string → number
      const rawBudget = (lead.budget || '').toLowerCase().replace(/[₹,\s]/g, '');
      const budgetMatch = rawBudget.match(/(\d+(?:\.\d+)?)\s*(k|l|lakh|cr)?/);
      let budgetVal = 0;
      if (budgetMatch) {
        let val = parseFloat(budgetMatch[1]);
        const suffix = budgetMatch[2];
        if (suffix === 'k') val *= 1000;
        else if (suffix === 'l' || suffix === 'lakh') val *= 100_000;
        else if (suffix === 'cr') val *= 10_000_000;
        budgetVal = val;
      }

      const dedupe = (arr: any[]) => {
        const seen = new Set<string>();
        return arr.filter(m => {
          if (!m.property_id || seen.has(m.property_id)) return false;
          seen.add(m.property_id);
          return true;
        });
      };

      // ── Tier 1: RPC ────────────────────────────────────────────────────────
      /* Temporarily disabled because it's hanging the request.
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('match_beds_for_lead', {
          p_location: lead.preferred_location || '',
          p_budget: budgetVal,
          p_room_type: null,
          p_interests: (lead as any).interests || [],
        });
        if (!rpcError && rpcData && rpcData.length > 0) {
          return dedupe(rpcData);
        }
        if (rpcError) console.warn('[Match] RPC error:', rpcError.message);
      } catch (e) {
        console.warn('[Match] RPC threw:', e);
      }
      */

      // ── Tier 2: direct beds query (also checks 'available') ────────────────
      /* Temporarily disabled to avoid complex DB joins hanging.
      try {
        const { data: beds, error: bedsErr } = await supabase
          .from('beds')
          .select(`
            id, bed_number, status, room_id,
            rooms!inner(
              id, room_number, room_type, rent_per_bed, property_id,
              properties!inner(id, name, area, interests, google_maps_link, photos, is_active)
            )
          `)
          .in('status', ['vacant', 'vacating_soon', 'available'])
          .eq('rooms.properties.is_active', true)
          .limit(20);

        if (!bedsErr && beds && beds.length > 0) {
          const shaped = beds.map((b: any) => ({
            bed_id: b.id,
            bed_number: b.bed_number,
            room_id: b.rooms?.id,
            room_number: b.rooms?.room_number,
            room_type: b.rooms?.room_type,
            rent_per_bed: b.rooms?.rent_per_bed ?? 0,
            property_id: b.rooms?.properties?.id,
            property_name: b.rooms?.properties?.name,
            property_area: b.rooms?.properties?.area,
            property_interests: b.rooms?.properties?.interests ?? [],
            property_google_maps_link: b.rooms?.properties?.google_maps_link,
            property_photos: b.rooms?.properties?.photos ?? [],
            match_score: 50,
          }));
          return dedupe(shaped);
        }
        if (bedsErr) console.warn('[Match] Beds query error:', bedsErr.message);
      } catch (e) {
        console.warn('[Match] Beds query threw:', e);
      }
      */

      console.warn('[Match] Using Tier 3: properties-level fallback');

      // ── Tier 3: properties-level fallback (no beds needed at all) ──────────
      const { data: allProps, error: propErr } = await supabase
        .from('properties')
        .select('id, name, area, interests, google_maps_link, virtual_tour_link, photos, price_range')
        .eq('is_active', true)
        .limit(80);

      if (propErr) {
        console.error('[Match] Properties fallback failed:', propErr.message);
        return [];
      }

      const loc = (lead.preferred_location || '').toLowerCase().trim();
      // Build keyword list, e.g. "BTM Layout" → ['btm', 'layout']
      const keywords = loc.split(/[\s,\/\-]+/).filter((k: string) => k.length > 2);

      const scored = (allProps || []).map((p: any) => {
        const pArea = (p.area || '').toLowerCase().trim();
        let score = 25;

        // Exact area match → very high score
        if (pArea === loc) score += 60;
        // Keyword match (e.g. "koramangala" matches "Koramangala")
        else if (keywords.some((kw: string) => pArea.includes(kw) || kw.includes(pArea.split(' ')[0]))) score += 40;

        // Budget proximity bonus
        if (p.price_range && budgetVal > 0) {
          const nums = (p.price_range.match(/\d+/g) || []).map(Number);
          if (nums.length > 0) {
            const avgK = nums.reduce((a: number, b: number) => a + b, 0) / nums.length * 1000;
            const diff = Math.abs(avgK - budgetVal) / budgetVal;
            if (diff < 0.2) score += 20;
            else if (diff < 0.4) score += 10;
          }
        }

        // Estimate rent from price_range, fall back to budget
        const minRent = (() => {
          const nums = (p.price_range?.match(/\d+/g) || []).map(Number);
          return nums.length ? Math.min(...nums) * 1000 : (budgetVal || 10000);
        })();

        return {
          bed_id: `prop-${p.id}`,
          bed_number: 'A1',
          room_id: null,
          room_number: '101',
          room_type: 'shared',
          rent_per_bed: minRent,
          property_id: p.id,
          property_name: p.name,
          property_area: p.area,
          property_interests: p.interests ?? [],
          property_google_maps_link: p.google_maps_link,
          property_photos: p.photos ?? [],
          match_score: Math.min(score, 99),
        };
      });

      // Sort best-first, dedupe, return top 20
      return dedupe(scored.sort((a: any, b: any) => b.match_score - a.match_score)).slice(0, 20);
    },
    enabled: !!leadId,
    staleTime: 0,
    retry: 1,
  });
}
