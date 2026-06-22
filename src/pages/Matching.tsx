import { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { useLeads, useCreateLead } from '@/hooks/useCrmData';
import { useDbMatchBeds } from '@/hooks/useZones';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, MapPin, IndianRupee, Loader2, CalendarCheck, Search, LayoutGrid, List, Send, Map, Image as ImageIcon, ExternalLink, Phone, Info, X } from 'lucide-react';
import ScheduleTourDialog from '@/components/ScheduleTourDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PG_EXCEL_LOOKUP, PG_AREAS_FROM_EXCEL } from '@/data/pgExcelData';
import { parseLeadText, type ParsedLead } from '@/lib/parseLeadText';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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

/** Safely ensure a URL starts with http */
function makeAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('maps.app') || url.startsWith('google.com') || url.startsWith('g.co')) return `https://${url}`;
  return url;
}

export default function Matching() {
  const { data: leads } = useLeads();
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [searchArea, setSearchArea] = useState<string>('BTM Layout');
  const [areaSearch, setAreaSearch] = useState<string>('');

  // Smart Add Lead state
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedLead | null>(null);
  const createLead = useCreateLead();

  // Custom filters
  const [activeZone, setActiveZone] = useState('All Zones');
  const [activeConfigArea, setActiveConfigArea] = useState('BTM Layout');

  // Detail modal state
  const [detailPg, setDetailPg] = useState<any | null>(null);

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

  const handleParse = (text: string) => {
    setRawText(text);
    if (!text.trim()) { setParsed(null); return; }
    setParsed(parseLeadText(text));
  };

  const handleCreateParsedLead = async () => {
    if (!parsed?.name || !parsed?.phone) {
      toast.error('Lead must have at least a Name and Phone to be created.');
      return;
    }
    try {
      const newLead = await createLead.mutateAsync({
        name: parsed.name.trim(),
        phone: parsed.phone.trim(),
        email: parsed.email?.trim() || null,
        source: 'whatsapp',
        budget: parsed.budget?.trim() || null,
        preferred_location: parsed.preferred_location?.trim() || null,
        notes: parsed.notes?.trim() || null,
        status: 'new',
      });
      toast.success('Lead created from text!');
      setRawText('');
      setParsed(null);
      setSelectedLead(newLead.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lead');
    }
  };

  // Build enriched match results with all links resolved
  const enrichedMatches = useMemo(() => {
    if (!dbMatch.data) return [];
    return dbMatch.data.map((m: any) => {
      const excelData = getExcelData(m.property_name);
      const mapLink = makeAbsoluteUrl(m.property_google_maps_link || excelData?.exactLocation || excelData?.googleMapsUrl);
      const photosLink = makeAbsoluteUrl(
        (m.property_photos && m.property_photos.length > 0) ? m.property_photos[0] : excelData?.driveLink ?? null
      );
      const exactName = excelData?.exactName?.trim() || null;
      const area = excelData?.area || m.property_area;
      return { ...m, mapLink, photosLink, exactName, area };
    });
  }, [dbMatch.data]);

  return (
    <AppLayout title="Property Matching" subtitle="">
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-80px)] p-6 space-y-6">

        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Lead <span className="text-muted-foreground">→</span> PG Matcher <Sparkles className="text-amber-500" size={24} />
            </h1>
            <p className="text-muted-foreground mt-1">Select a lead to instantly find best matching PGs from your inventory</p>
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
            <Button size="lg" className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold" onClick={() => toast.success(`Searching for PGs in ${searchArea}`)}>
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
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => toast("Advanced configuration coming soon")}>
                <LayoutGrid size={14} className="mr-2" /> Other Config
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => setActiveZone('All Zones')}>CLEAR ALL</Button>
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
                      <SelectItem key={l.id} value={l.id}>{l.name} — {l.preferred_location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {lead && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5 text-sm">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">{lead.name}</p>
                  <p className="text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.preferred_location}</p>
                  <p className="text-muted-foreground flex items-center gap-1"><IndianRupee size={12} /> Budget: ₹{lead.budget}</p>
                  <p className="text-muted-foreground flex items-center gap-1"><Phone size={12} /> {lead.phone}</p>
                  {lead.notes && <p className="text-xs italic text-muted-foreground/70 mt-1">"{lead.notes}"</p>}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">WhatsApp / LinkedIn Parsing</label>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste lead text, WhatsApp message, or company name here..."
                    className="resize-none h-24 bg-background border-border placeholder:text-muted-foreground/60"
                    value={rawText}
                    onChange={e => handleParse(e.target.value)}
                  />
                  {parsed && parsed.name && parsed.phone && (
                    <Button
                      className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                      onClick={handleCreateParsedLead}
                      disabled={createLead.isPending}
                    >
                      {createLead.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />}
                      Add {parsed.name}
                    </Button>
                  )}
                  {parsed && (!parsed.name || !parsed.phone) && rawText.trim() && (
                    <p className="text-xs text-destructive text-center mt-1">Need name & phone in text to parse.</p>
                  )}
                </div>
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
                  <p className="text-xs text-muted-foreground">Profile: <span className="text-foreground font-medium">Startup employees, tech workers, students</span></p>
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
                <Badge variant="secondary" className="font-normal bg-card border">{enrichedMatches.length || 0} Found</Badge>
              </div>
              <div className="flex items-center gap-1 bg-card border rounded-lg p-0.5">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-secondary/50" onClick={() => toast.success("Grid view active")}><LayoutGrid size={14} /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => toast("List view coming soon")}><List size={14} /></Button>
              </div>
            </div>

            {dbMatch.isFetching && (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Running matching algorithm...</p>
              </div>
            )}

            {!dbMatch.isFetching && !selectedLead && (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-card border rounded-2xl border-dashed">
                <Sparkles size={28} className="mb-3 text-amber-500/50" />
                <p className="font-medium">Select a lead above to see matching PGs</p>
                <p className="text-sm mt-1 opacity-60">The system will instantly find best matches based on location and budget</p>
              </div>
            )}

            {!dbMatch.isFetching && dbMatch.isError && (
              <div className="py-12 flex flex-col items-center justify-center text-red-500 bg-red-100/10 border border-red-500/20 rounded-2xl border-dashed">
                <p className="font-medium">Matching Failed!</p>
                <p className="text-sm mt-1 opacity-80">{dbMatch.error instanceof Error ? dbMatch.error.message : String(dbMatch.error)}</p>
              </div>
            )}

            {!dbMatch.isFetching && selectedLead && !dbMatch.isError && enrichedMatches.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-card border rounded-2xl border-dashed">
                <MapPin size={28} className="mb-3 opacity-40" />
                <p className="font-medium">No exact matches found in inventory</p>
                <p className="text-sm mt-1 opacity-60">No vacant beds matching this lead's area/budget. Try adjusting filters or check inventory.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!dbMatch.isFetching && enrichedMatches.map((m: any) => (
                <div key={m.bed_id} className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow">

                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base flex items-center gap-2 flex-wrap">
                        {m.property_name}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold border border-amber-500/20">{m.match_score}% MATCH</span>
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {m.area || m.property_area}
                      </p>
                      {m.exactName && (
                        <p className="text-[10px] text-muted-foreground/70 italic mt-0.5 truncate" title={m.exactName}>
                          🏠 {m.exactName}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mb-0.5">FROM ₹{(Number(m.rent_per_bed) / 1000).toFixed(1)}K/MO</p>
                      <p className="text-[10px] text-muted-foreground">Room: {m.room_number}</p>
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

                  {/* ACTION BUTTONS — fully functional */}
                  <div className="flex items-center gap-2 mt-auto">

                    {/* TOUR — opens ScheduleTourDialog */}
                    <ScheduleTourDialog leadId={selectedLead} propertyId={m.property_id} propertyName={m.property_name}>
                      <Button variant="outline" className="flex-1 font-bold text-xs h-10 border-foreground hover:bg-foreground hover:text-background transition-colors">
                        <CalendarCheck size={14} className="mr-2" /> TOUR
                      </Button>
                    </ScheduleTourDialog>

                    {/* DETAILS — opens modal */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground shrink-0 hover:bg-secondary"
                      title="View Details"
                      onClick={() => setDetailPg(m)}
                    >
                      <Info size={16} />
                    </Button>

                    {/* PHOTOS — opens Drive folder */}
                    {m.photosLink ? (
                      <a href={m.photosLink} target="_blank" rel="noopener noreferrer" title="View photos on Google Drive">
                        <Button variant="outline" size="icon" className="h-10 w-10 text-amber-500 border-amber-500/30 hover:bg-amber-500/10 shrink-0">
                          <ImageIcon size={16} />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground/40 shrink-0 cursor-not-allowed" disabled title="No photos available">
                        <ImageIcon size={16} />
                      </Button>
                    )}

                    {/* LOCATION — opens Google Maps */}
                    {m.mapLink ? (
                      <a href={m.mapLink} target="_blank" rel="noopener noreferrer" title="Open in Google Maps">
                        <Button variant="outline" size="icon" className="h-10 w-10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 shrink-0">
                          <MapPin size={16} />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground/40 shrink-0 cursor-not-allowed" disabled title="No location available">
                        <MapPin size={16} />
                      </Button>
                    )}

                  </div>
                </div>
              ))}
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
                    onClick={() => setActiveConfigArea(area.name)}
                  >
                    <span>{area.name}</span>
                    <span className={i === 0 && !areaSearch ? 'text-amber-400 font-bold' : 'text-amber-500 font-bold'}>{area.count}</span>
                  </div>
                ))}
                {filteredAreas.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No areas found</p>
                )}
              </div>

              <Button size="icon" className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg mt-6 flex items-center justify-center gap-2" onClick={() => toast.success("Add area modal activated")}>
                <span className="font-bold text-sm">Add Area</span>
                <span className="text-xl">+</span>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* PG Detail Modal */}
      <Dialog open={!!detailPg} onOpenChange={open => { if (!open) setDetailPg(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailPg?.property_name}
              <Badge variant="secondary" className="text-[10px] border bg-amber-500/10 text-amber-600 border-amber-500/20">
                {detailPg?.match_score}% MATCH
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {detailPg?.exactName && <span className="italic">🏠 {detailPg.exactName} · </span>}
              <MapPin size={12} className="inline mr-1" />
              {detailPg?.area || detailPg?.property_area}
            </DialogDescription>
          </DialogHeader>

          {detailPg && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-secondary/50 border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Monthly Rent</p>
                  <p className="font-bold text-lg">₹{Number(detailPg.rent_per_bed).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Room</p>
                  <p className="font-bold text-lg">{detailPg.room_number}</p>
                </div>
              </div>

              {detailPg.property_interests?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Amenities / Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailPg.property_interests.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {detailPg.photosLink && (
                  <a href={detailPg.photosLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                      <ImageIcon size={16} className="mr-2" /> View Photos (Google Drive)
                    </Button>
                  </a>
                )}
                {detailPg.mapLink && (
                  <a href={detailPg.mapLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-bold">
                      <MapPin size={16} className="mr-2" /> Open in Google Maps
                    </Button>
                  </a>
                )}
                <ScheduleTourDialog leadId={selectedLead} propertyId={detailPg.property_id} propertyName={detailPg.property_name}>
                  <Button variant="outline" className="w-full font-bold border-foreground hover:bg-foreground hover:text-background">
                    <CalendarCheck size={16} className="mr-2" /> Schedule Tour
                  </Button>
                </ScheduleTourDialog>
                {!detailPg.photosLink && !detailPg.mapLink && (
                  <p className="text-xs text-muted-foreground text-center py-2">No photos or map link available for this property.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
