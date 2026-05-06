import React, { useState, useEffect, useMemo, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Zap, Users, Activity, ShieldCheck, Wifi, MapPin, ChevronLeft, ChevronRight, Building2, Search, X, IndianRupee, DoorOpen, Map, Image, Utensils, Fan, Lightbulb, Lock, Unlock } from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

const API_URL = "http://localhost:5000/api/pg-with-iot";

const IoTDashboard = () => {
  const [pgs, setPgs] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState({ supabase: false, mongodb: false });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPgId, setSelectedPgId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [telemetry, setTelemetry] = useState<Record<string, any[]>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLiveIoTData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch IoT data");
      const { data, dbStatus } = await response.json();
      
      setPgs(data);
      setDbHealth(dbStatus);
      setIsLoading(false);

      // Update telemetry history for charts (keyed by roomId now)
      setTelemetry(prev => {
        const next = { ...prev };
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        data.forEach((pg: any) => {
          if (pg.rooms) {
            pg.rooms.forEach((room: any) => {
              if (room.sensor) {
                // Parse Supabase status string into Capitalized
                const capStatus = room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : 'Unknown';
                
                const snap = {
                  time: timeStr,
                  temp: room.sensor.temperature,
                  elec: room.sensor.electricity,
                  occ: capStatus === 'Occupied' ? 10 : 0,
                  status: capStatus
                };
                const history = next[room._id] || [];
                next[room._id] = [...history.slice(-19), snap]; // Keep last 20 records
              }
            });
          }
        });
        return next;
      });
    } catch (err) {
      console.error("Error fetching IoT data:", err);
    }
  };

  useEffect(() => {
    fetchLiveIoTData();
    intervalRef.current = setInterval(fetchLiveIoTData, 5000); // Poll every 5s
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first PG and room on initial load
  useEffect(() => {
    if (pgs.length > 0 && !selectedPgId) {
      setSelectedPgId(pgs[0]._id);
      if (pgs[0].rooms && pgs[0].rooms.length > 0) {
        setSelectedRoomId(pgs[0].rooms[0]._id);
      }
    }
  }, [pgs, selectedPgId]);

  const filteredPgs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pgs;
    return pgs.filter((p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
  }, [pgs, searchQuery]);

  const selectedPg  = pgs.find(p => p._id === selectedPgId);
  const selectedRoom = selectedPg?.rooms?.find((r: any) => r._id === selectedRoomId) || selectedPg?.rooms?.[0];
  const chartData   = telemetry[selectedRoom?._id] || [];
  const current     = chartData.length > 0 ? chartData[chartData.length - 1] : { temp: 0, elec: 0, status: 'Unknown' };

  // When changing PG, auto-select its first room
  const handlePgSelect = (pgId: string) => {
    setSelectedPgId(pgId);
    const pg = pgs.find(p => p._id === pgId);
    if (pg?.rooms?.length > 0) {
      setSelectedRoomId(pg.rooms[0]._id);
    } else {
      setSelectedRoomId('');
    }
  };

  const [roomStates, setRoomStates] = useState<Record<string, any>>({});

  const toggleDevice = async (roomId: string, device: string, currentState: boolean) => {
    try {
      const response = await fetch("http://localhost:5000/api/room-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, device, state: !currentState })
      });
      if (response.ok) {
        const { state } = await response.json();
        setRoomStates(prev => ({ ...prev, [roomId]: state }));
      }
    } catch (err) {
      console.error("Control error:", err);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <AppLayout title="Smart Infrastructure" subtitle="Real-time telemetry & IoT synchronization">
      <div className="space-y-8">

        {/* ── PG Selector ─────────────────────────────────────────── */}
        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" /> Select PG to Monitor
              <span className="ml-1 text-muted-foreground font-normal normal-case tracking-normal">
                ({filteredPgs.length} of {pgs.length})
              </span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-2 px-3 py-1.5 ${dbHealth.supabase ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'} rounded-full border`}>
                <div className={`h-1.5 w-1.5 rounded-full ${dbHealth.supabase ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${dbHealth.supabase ? 'text-success' : 'text-destructive'}`}>
                  Supabase: {dbHealth.supabase ? 'Connected' : 'Offline'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 ${dbHealth.mongodb ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'} rounded-full border`}>
                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${dbHealth.mongodb ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-warning shadow-[0_0_8px_hsl(var(--warning))]'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${dbHealth.mongodb ? 'text-success' : 'text-warning'}`}>
                  MongoDB: {dbHealth.mongodb ? 'Telemetry Live' : 'Mocking Data'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search PG by name or location…"
              className="pl-9 pr-9 h-9 text-xs bg-white/[0.03] border-white/10 focus:border-primary/40 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="shrink-0 p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground"
            >
              <ChevronLeft size={14} />
            </button>
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 w-32 rounded-full bg-white/5 animate-pulse shrink-0" />
                  ))
                : filteredPgs.length === 0
                ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-[10px] text-muted-foreground italic">
                      <Search size={12} /> No PGs match "{searchQuery}"
                    </div>
                  )
                : filteredPgs.map((pg: any) => (
                    <button
                      key={pg._id}
                      onClick={() => handlePgSelect(pg._id)}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                        selectedPgId === pg._id
                          ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                          : 'border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground'
                      }`}
                    >
                      <MapPin size={10} />
                      {pg.name}
                      {pg.location && (
                        <span className="opacity-50 font-normal normal-case tracking-normal">
                          · {pg.location}
                        </span>
                      )}
                    </button>
                  ))}
            </div>
            <button
              onClick={() => scroll('right')}
              className="shrink-0 p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Active PG & Room Header ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {selectedPg && (
            <motion.div
              key={selectedPg._id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 px-6 py-6 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 font-bold">Smart Property</p>
                    {selectedPg.food_details && (
                      <Badge variant="outline" className="text-[8px] px-2 py-0.5 bg-warning/10 text-warning border-warning/20">
                        <Utensils className="h-2.5 w-2.5 mr-1" /> {selectedPg.food_details}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-display font-bold tracking-tight text-white mt-1">{selectedPg.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    {selectedPg.google_maps_link && (
                      <a 
                        href={selectedPg.google_maps_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-primary hover:text-white flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full transition-all border border-primary/20"
                      >
                        <MapPin size={11} /> View on Maps
                      </a>
                    )}
                    {selectedPg.virtual_tour_link && (
                      <a 
                        href={selectedPg.virtual_tour_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-info hover:text-white flex items-center gap-1.5 bg-info/10 px-3 py-1.5 rounded-full transition-all border border-info/20"
                      >
                        <Image size={11} /> Images & Videos
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Room Selector */}
              {selectedPg.rooms && selectedPg.rooms.length > 0 && (
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 w-full lg:w-auto overflow-x-auto no-scrollbar">
                  {selectedPg.rooms.map((room: any) => (
                    <button
                      key={room._id}
                      onClick={() => setSelectedRoomId(room._id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedRoomId === room._id
                          ? 'bg-primary text-primary-foreground shadow-[0_8px_16px_rgba(0,0,0,0.3)] scale-105'
                          : 'hover:bg-white/10 text-muted-foreground'
                      }`}
                    >
                      <DoorOpen size={15} />
                      Room {room.roomNumber}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI Grid ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {selectedRoom && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  key={selectedRoomId + '-kpis'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <StatCard 
                    title="Temperature"     
                    value={current.temp ? `${current.temp}°C` : '--'} 
                    icon={Thermometer} 
                    color={current.temp > 26 ? "text-destructive" : "text-primary"} 
                    trend={current.temp > 26 ? "High Temp Alert!" : "Optimal Range"}
                    isAlert={current.temp > 26}
                  />
                  <StatCard 
                    title="Electricity Use" 
                    value={current.elec ? `${current.elec} kW` : '--'} 
                    icon={Zap}         
                    color={current.elec > 1.8 ? "text-warning" : "text-info"} 
                    trend={current.elec > 1.8 ? "Peak Load Detected" : "Standard Consumption"}
                    isAlert={current.elec > 1.8}
                  />
                  
                  <Card className="relative border border-white/5 bg-card/30 backdrop-blur-2xl shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Occupancy Status</p>
                        <div className={`p-2.5 rounded-xl border border-white/5 transition-all duration-500 group-hover:scale-110`}>
                          <Users className={`h-5 w-5 ${current.status === 'Vacant' ? 'text-success' : 'text-destructive'} drop-shadow-[0_0_8px_currentColor]`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {current.status === 'Vacant' ? '🟢' : '🔴'}
                        </span>
                        <h3 className="text-2xl font-display font-bold tracking-tight">
                          {current.status || 'Loading...'}
                        </h3>
                      </div>
                    </CardContent>
                    <div className={`absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 ${current.status === 'Vacant' ? 'bg-success shadow-[0_0_15px_hsl(var(--success))]' : 'bg-destructive shadow-[0_0_15px_hsl(var(--destructive))]'}`} />
                  </Card>
                </motion.div>

                {/* Telemetry Flow */}
                <motion.div
                   key={selectedRoomId + '-charts'}
                   initial={{ opacity: 0, y: 12 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.35, delay: 0.05 }}
                >
                  <Card className="overflow-hidden border border-white/5 bg-card/30 backdrop-blur-2xl shadow-2xl rounded-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02] py-5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-3 text-primary/80">
                          <Activity className="h-4 w-4" /> Telemetry Flow — Room {selectedRoom.roomNumber}
                        </CardTitle>
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                          Live Sync
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="gtTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 600 }} axisLine={false} tickLine={false} minTickGap={40} />
                            <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(20px)' }}
                              itemStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Area type="monotone" dataKey="temp" name="Temp (°C)"    stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#gtTemp)" />
                            <Area type="monotone" dataKey="elec" name="Power (kW)"   stroke="hsl(var(--info))"    strokeWidth={2} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Side Panel: Smart Controls & Alerts */}
              <div className="space-y-8">
                <Card className="border border-white/5 bg-card/40 backdrop-blur-3xl shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-white/5 bg-white/[0.03] py-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-white/80">
                      <Zap className="h-3.5 w-3.5 text-primary" /> Smart Room Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <ControlRow 
                      label="Climate Control (AC)" 
                      icon={Fan} 
                      active={roomStates[selectedRoomId]?.ac ?? false} 
                      onClick={() => toggleDevice(selectedRoomId, 'ac', roomStates[selectedRoomId]?.ac ?? false)}
                      color="bg-primary"
                    />
                    <ControlRow 
                      label="Smart Lighting" 
                      icon={Lightbulb} 
                      active={roomStates[selectedRoomId]?.lights ?? true} 
                      onClick={() => toggleDevice(selectedRoomId, 'lights', roomStates[selectedRoomId]?.lights ?? true)}
                      color="bg-info"
                    />
                    <ControlRow 
                      label="Digital Door Lock" 
                      icon={roomStates[selectedRoomId]?.lock ?? true ? Lock : Unlock} 
                      active={roomStates[selectedRoomId]?.lock ?? true} 
                      onClick={() => toggleDevice(selectedRoomId, 'lock', roomStates[selectedRoomId]?.lock ?? true)}
                      color="bg-success"
                    />
                  </CardContent>
                </Card>

                <Card className="border border-white/5 bg-destructive/5 backdrop-blur-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="py-4 bg-destructive/10">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-destructive">
                      <ShieldCheck className="h-3.5 w-3.5" /> Security & Safety
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <p className="text-[10px] font-bold text-white/70 uppercase">Smoke Detectors Active</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <p className="text-[10px] font-bold text-white/70 uppercase">Intrusion Sensor: Secure</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
};

const ControlRow = ({ label, icon: Icon, active, onClick, color }: any) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${active ? color + '/20' : 'bg-white/5'} transition-colors group-hover:scale-110 duration-300`}>
        <Icon className={`h-4 w-4 ${active ? color.replace('bg-', 'text-') : 'text-muted-foreground'}`} />
      </div>
      <span className="text-[11px] font-bold text-white/80">{label}</span>
    </div>
    <button 
      onClick={onClick}
      className={`w-10 h-5 rounded-full p-1 transition-all duration-500 ${active ? color : 'bg-white/10'}`}
    >
      <div className={`w-3 h-3 bg-white rounded-full transition-all duration-500 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, trend, isAlert }: any) => (
  <Card className={`relative border ${isAlert ? 'border-destructive/30 bg-destructive/5' : 'border-white/5 bg-card/30'} backdrop-blur-2xl shadow-xl overflow-hidden group transition-all duration-500 rounded-2xl`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isAlert ? 'text-destructive/80' : 'text-muted-foreground/60'}`}>{title}</p>
        <div className={`p-2.5 rounded-xl border border-white/5 transition-all duration-500 group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${color} ${isAlert ? 'animate-bounce' : ''} drop-shadow-[0_0_8px_currentColor]`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-3xl font-display font-bold tracking-tight ${isAlert ? 'text-destructive' : ''}`}>{value}</h3>
      </div>
      {trend && (
        <p className={`text-[9px] mt-3 flex items-center gap-2 font-bold uppercase tracking-widest ${isAlert ? 'text-destructive' : 'text-muted-foreground/50'}`}>
          <Activity className={`h-3 w-3 ${isAlert ? 'text-destructive' : 'text-primary/40'}`} /> {trend}
        </p>
      )}
    </CardContent>
    <div className={`absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 ${isAlert ? 'bg-destructive shadow-[0_0_15px_hsl(var(--destructive))]' : 'bg-primary shadow-[0_0_15px_hsl(var(--primary))]'}`} />
  </Card>
);

      </div>
    </AppLayout>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <Card className="relative border border-white/5 bg-card/30 backdrop-blur-2xl shadow-xl overflow-hidden group hover:border-primary/20 transition-all duration-500 rounded-2xl">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>
        <div className={`p-2.5 rounded-xl border border-white/5 transition-all duration-500 group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${color} drop-shadow-[0_0_8px_currentColor]`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-display font-bold tracking-tight">{value}</h3>
      </div>
      {trend && (
        <p className="text-[9px] text-muted-foreground/50 mt-3 flex items-center gap-2 font-bold uppercase tracking-widest">
          <Activity className="h-3 w-3 text-primary/40" /> {trend}
        </p>
      )}
    </CardContent>
    <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 bg-primary shadow-[0_0_15px_hsl(var(--primary))]" />
  </Card>
);

export default IoTDashboard;
