import { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { useLeads } from '@/hooks/useCrmData';
import { useDbMatchBeds } from '@/hooks/useZones';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, MapPin, IndianRupee, Loader2, CalendarCheck, Search, LayoutGrid, List, Send, Map } from 'lucide-react';
import ScheduleTourDialog from '@/components/ScheduleTourDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon } from 'lucide-react';
import { PG_EXCEL_LOOKUP, PG_AREAS_FROM_EXCEL } from '@/data/pgExcelData';

const ZONES = ['All Zones', 'KORA', 'MWB', 'MTP', 'YPR'];
const CONFIG_AREAS = [
  'BTM Layout', 'Bannerghatta', 'Bellandur', 'Electronic City', 'HSR Layout',
  'Hebbal', 'Indiranagar', 'Jayanagar', 'Koramangala', 'MG Road',
  'Mahadevapura', 'Marathahalli', 'Mathikere', 'Vasanthnagar', 'Whitefield', 'Yeshwanthpur'
];

/** Look up Excel data for a PG by its name (case-insensitive, trimmed) */
function getExcelData(propertyName: string | undefined) {
  if (!propertyName) return null;
  return PG_EXCEL_LOOKUP[propertyName.trim().toLowerCase()] ?? null;
}

export default function Matching() {
  const { data: leads } = useLeads();
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [searchArea, setSearchArea] = useState<string>('BTM Layout');
  const [areaSearch, setAreaSearch] = useState<string>('');

  // Custom filters based on screenshot
  const [activeZone, setActiveZone] = useState('All Zones');
  const [activeConfigArea, setActiveConfigArea] = useState('BTM Layout');

  const activeLeads = (leads || []).filter(l => l.status !== 'booked' && l.status !== 'lost');
  const lead = activeLeads.find(l => l.id === selectedLead);

  // Auto-run match whenever a lead is selected
  const dbMatch = useDbMatchBeds(selectedLead);

  // Filter areas from Excel by search
  const filteredAreas = useMemo(() => {
    if (!areaSearch) return PG_AREAS_FROM_EXCEL;
    const q = areaSearch.toLowerCase();
    return PG_AREAS_FROM_EXCEL.filter(a => a.name.toLowerCase().includes(q));
  }, [areaSearch]);

  const totalPGs = PG_AREAS_FROM_EXCEL.reduce((s, a) => s + a.count, 0);
  const totalAreas = PG_AREAS_FROM_EXCEL.length;

  return (
    <AppLayout title="Property Matching" subtitle="">
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-80px)] p-6 space-y-6">

        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Lead <span className="text-muted-foreground">→</span> PG Matcher <Sparkles className="text-amber-500" size={24} />
            </h1>
            <p className="text-muted-foreground mt-1">Type a lead's office, area or landmark — get best matching PGs instantly</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-card border rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px]">
              <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">Total PGs</span>
              <span className="text-2xl font-bold">{totalPGs}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px] dark:text-amber-500">
              <span className="text-xs opacity-80 font-semibold tracking-wider uppercase">Areas</span>
              <span className="text-2xl font-bold">{totalAreas}</span>
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="bg-card border rounded-2xl p-4 shadow-sm">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={searchArea}
                onChange={e => setSearchArea(e.target.value)}
                className="pl-10 h-12 text-base bg-background/50 border-border"
                placeholder="Search area..."
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              Find PGs
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ZONES.map(z => (
                <Badge
                  key={z}
                  variant={activeZone === z ? 'default' : 'secondary'}
                  className={`cursor-pointer px-4 py-1.5 ${activeZone === z ? 'bg-foreground text-background' : 'hover:bg-secondary/80'}`}
                  onClick={() => setActiveZone(z)}
                >
                  {z}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                <LayoutGrid size={14} className="mr-2" /> Other Config
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">CLEAR ALL</Button>
            </div>
          </div>
        </div>

        {/* Config Areas Pills */}
        <div className="flex flex-wrap gap-2">
          {CONFIG_AREAS.map(area => (
            <Badge
              key={area}
              variant="outline"
              className={`cursor-pointer px-4 py-1.5 font-normal rounded-full ${activeConfigArea === area ? 'border-amber-500 text-amber-600 bg-amber-500/5 dark:text-amber-400 dark:border-amber-400' : 'text-muted-foreground hover:bg-secondary'}`}
              onClick={() => setActiveConfigArea(area)}
            >
              {area}
            </Badge>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Sidebar - Lead Intelligence */}
          <div className="lg:col-span-3 space-y-6">

            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Select CRM Lead</label>
                <Select value={selectedLead} onValueChange={setSelectedLead}>
                  <SelectTrigger className="h-10 bg-background border-border">
                    <SelectValue placeholder="Search CRM Leads..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLeads.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">WhatsApp / LinkedIn Parsing</label>
                <Textarea
                  placeholder="Paste lead text, WhatsApp message, or company name here..."
                  className="resize-none h-24 bg-background border-border placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {lead && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-semibold text-sm tracking-wide">
                  <Sparkles size={16} /> MEGA INTELLIGENCE - {lead.preferred_location || 'ANY'}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background border rounded-xl p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Budget Range</p>
                    <p className="font-semibold text-sm">₹{lead.budget || '5,500-15,000'}</p>
                  </div>
                  <div className="bg-background border border-emerald-500/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">PG Demand</p>
                    <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-500">Very High</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Commute</p>
                  <p className="font-medium text-sm">5-15 min metro/bus</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Target: <span className="text-foreground font-medium">Adjacent to Koramangala and HSR ecosystem</span></p>
                  <p className="text-xs text-muted-foreground">Profile: <span className="text-foreground font-medium">Startup employees, tech workers, students</span></p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="bg-background border text-[10px] uppercase font-normal">btm layout stage 1</Badge>
                  <Badge variant="secondary" className="bg-background border text-[10px] uppercase font-normal">btm layout stage 2</Badge>
                  <Badge variant="secondary" className="bg-background border text-[10px] uppercase font-normal">madiwala</Badge>
                </div>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-500 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Map size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">GIS Node Active</p>
                <p className="font-bold">{activeConfigArea}</p>
              </div>
            </div>

          </div>

          {/* Center - PG Match Results */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">PG Match Results</h2>
                <Badge variant="secondary" className="font-normal bg-card border">{dbMatch.data?.length || 0} Found</Badge>
              </div>
              <div className="flex items-center gap-1 bg-card border rounded-lg p-0.5">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-secondary/50"><LayoutGrid size={14} /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground"><List size={14} /></Button>
              </div>
            </div>

            {dbMatch.isFetching && (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Running matching algorithm...</p>
              </div>
            )}

            {!dbMatch.isFetching && (!dbMatch.data || dbMatch.data.length === 0) && (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-card border rounded-2xl border-dashed">
                <p>{lead ? 'No matching properties found.' : 'Select a lead to see matches.'}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!dbMatch.isFetching && dbMatch.data?.map((m: any) => {
                // Lookup Excel data by the property name stored in DB
                const excelData = getExcelData(m.property_name);
                // Resolve map link: prefer DB's google_maps_link, then Excel's exactLocation, then Excel's googleMapsUrl
                const mapLink = m.property_google_maps_link || excelData?.exactLocation || excelData?.googleMapsUrl || null;
                // Resolve image/drive link: prefer DB's photos, then Excel's driveLink
                const imageLink = (m.property_photos && m.property_photos.length > 0)
                  ? m.property_photos[0]
                  : excelData?.driveLink ?? null;
                // Show exact building name from Excel as a subtitle
                const exactName = excelData?.exactName?.trim() || null;

                return (
                  <div key={m.bed_id} className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col">

                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base flex items-center gap-2 flex-wrap">
                          {m.property_name}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold border border-amber-500/20">{m.match_score}% MATCH</span>
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {m.property_area} • <span className="opacity-70">Near Metro</span>
                        </p>
                        {exactName && (
                          <p className="text-[10px] text-muted-foreground/70 italic mt-0.5 truncate" title={exactName}>
                            🏠 {exactName}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mb-0.5">FROM ₹{(Number(m.rent_per_bed) / 1000).toFixed(1)}K/MO</p>
                        <p className="text-[10px] text-muted-foreground">R: {m.room_number}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4 mt-2 pt-2">
                      {m.property_name.toLowerCase().includes('girl') ? (
                        <Badge variant="secondary" className="bg-pink-500/10 text-pink-600 border border-pink-500/20 text-[9px] px-1.5">GIRLS</Badge>
                      ) : m.property_name.toLowerCase().includes('boy') ? (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] px-1.5">BOYS</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-secondary text-foreground border text-[9px] px-1.5">COED</Badge>
                      )}
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] px-1.5">MID</Badge>
                      {m.property_interests?.slice(0, 2).map((i: string) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-1.5 text-muted-foreground">{i}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <ScheduleTourDialog leadId={selectedLead} propertyId={m.property_id} propertyName={m.property_name}>
                        <Button variant="outline" className="flex-1 font-bold text-xs h-10 border-foreground hover:bg-foreground hover:text-background transition-colors">
                          <CalendarCheck size={14} className="mr-2" /> TOUR
                        </Button>
                      </ScheduleTourDialog>
                      <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground shrink-0"><List size={16} /></Button>

                      {/* Photos button — Excel Drive Link preferred, DB photos fallback */}
                      {imageLink ? (
                        <a href={imageLink} target="_blank" rel="noopener noreferrer" title="View photos">
                          <Button variant="outline" size="icon" className="h-10 w-10 text-amber-500 border-amber-500/30 hover:bg-amber-500/10 shrink-0">
                            <ImageIcon size={16} />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground shrink-0" disabled>
                          <ImageIcon size={16} />
                        </Button>
                      )}

                      {/* Location button — Excel map links preferred */}
                      {mapLink ? (
                        <a href={mapLink} target="_blank" rel="noopener noreferrer" title="Open in Google Maps">
                          <Button variant="outline" size="icon" className="h-10 w-10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 shrink-0">
                            <MapPin size={16} />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground shrink-0" disabled>
                          <MapPin size={16} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 shrink-0">Details</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar - Areas with PGs (real data from Excel) */}
          <div className="lg:col-span-3">
            <div className="bg-card border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">Areas With PGs</h3>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  className="pl-9 h-9 text-xs bg-background border-border"
                  placeholder="Search areas..."
                  value={areaSearch}
                  onChange={e => setAreaSearch(e.target.value)}
                />
              </div>

              <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                {filteredAreas.map((area, i) => (
                  <div
                    key={area.name}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer transition-colors ${i === 0 && !areaSearch ? 'bg-foreground text-background font-medium' : 'hover:bg-secondary/50 text-muted-foreground'}`}
                  >
                    <span>{area.name}</span>
                    <span className={i === 0 && !areaSearch ? 'text-amber-400 font-bold' : 'text-amber-500 font-bold'}>{area.count}</span>
                  </div>
                ))}
                {filteredAreas.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No areas found</p>
                )}
              </div>

              <Button size="icon" className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg mt-6 flex items-center justify-center gap-2">
                <span className="font-bold text-sm">Add Area</span>
                <span className="text-xl">+</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
