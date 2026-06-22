import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, ArrowRight, Bed, Building2, ChevronRight, Home, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePublicProperties } from '@/hooks/usePublicData';
import { motion } from 'framer-motion';
import { useState } from 'react';

const CITIES = [
  { name: 'Bangalore', tagline: '300+ Estates', active: true, icon: '⛩️' },
  { name: 'Hyderabad', tagline: 'Coming Soon', active: false, icon: '❁' },
  { name: 'Pune', tagline: 'Coming Soon', active: false, icon: '✧' },
];

const POPULAR_AREAS = [
  'Koramangala', 'HSR Layout', 'Marathahalli', 'Whitefield', 'BTM Layout',
  'Electronic City', 'Bellandur', 'Indiranagar'
];

const STATS = [
  { value: '300+', label: 'Verified Properties', icon: Home },
  { value: '5K+', label: 'Happy Residents', icon: Star },
  { value: '4.7', label: 'Average Rating', icon: Zap },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: featured } = usePublicProperties({ city: 'Bangalore', limit: 3 });

  const getAvailableBeds = (property: any) => {
    if (!property.rooms) return 0;
    return property.rooms.reduce((sum: number, room: any) => {
      if (!room.beds) return sum;
      return sum + room.beds.filter((b: any) => b.status === 'vacant').length;
    }, 0);
  };

  const getRentRange = (property: any) => {
    if (!property.rooms?.length) return property.price_range || '—';
    const rents = property.rooms.map((r: any) => r.rent_per_bed || r.expected_rent).filter(Boolean);
    if (!rents.length) return property.price_range || '—';
    const min = Math.min(...rents);
    return `₹${min.toLocaleString()}`;
  };

  const handleSearch = () => {
    navigate(`/explore${searchQuery ? `?area=${searchQuery}` : ''}`);
  };

  return (
    <div className="min-h-screen japanese-pattern-bg text-foreground overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Hanko Style Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded flex items-center justify-center font-display font-bold text-white bg-primary shadow-[3px_3px_0px_rgba(195,34,48,0.2)]">
                PS
              </div>
              <span className="font-display font-medium text-xl tracking-widest text-foreground">
                PGShaala
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm text-foreground/70 font-medium">
              <button onClick={() => navigate('/explore')} className="hover:text-primary transition-colors hover:-translate-y-0.5">Explore</button>
              <button onClick={() => navigate('/owner-login')} className="hover:text-primary transition-colors hover:-translate-y-0.5">Owners</button>
              <button className="hover:text-primary transition-colors hover:-translate-y-0.5">About</button>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-foreground/80 hover:text-primary">
                Login
              </Button>
              <button onClick={() => navigate('/explore')}
                className="px-6 py-2.5 rounded-sm font-medium text-sm transition-all bg-foreground text-background hover:bg-primary shadow-sm hidden sm:block">
                Find Estate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Minimalist Zen Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-12">

          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-3 mb-8 tracking-[0.15em] text-xs font-semibold text-primary/80 uppercase">
                <span className="w-4 h-[1px] bg-primary/60 inline-block" />
                Bangalore
                <span className="w-4 h-[1px] bg-primary/60 inline-block" />
              </div>

              <h1 className="font-display text-5xl sm:text-7xl mb-8 text-foreground/90 leading-[1.1] tracking-wide">
                Tranquil Spaces.<br />
                <span className="italic text-primary font-normal">Modern Living.</span>
              </h1>

              <p className="text-lg mb-12 text-foreground/60 max-w-[500px] leading-relaxed font-body mx-auto sm:mx-0">
                Discover refined accommodations crafted for focus and peace. Simple pricing, zero brokerage, instant clarity.
              </p>
            </motion.div>

            {/* Ink wash inspired search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <div className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto sm:mx-0 shadow-lg border border-border/80 bg-background rounded-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                  <input
                    type="text"
                    placeholder="Search an area (e.g. Koramangala)..."
                    className="w-full pl-12 pr-4 py-4 text-sm outline-none bg-transparent text-foreground placeholder:text-foreground/40 font-body"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button onClick={handleSearch}
                  className="px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all bg-primary text-white hover:bg-primary/90 flex items-center justify-center">
                  Search
                </button>
              </div>

              {/* Popular tags */}
              <div className="flex gap-3 mt-6 flex-wrap justify-center sm:justify-start items-center">
                {POPULAR_AREAS.slice(0, 5).map(area => (
                  <button
                    key={area}
                    onClick={() => navigate(`/explore?area=${area}`)}
                    className="text-xs px-3 py-1 bg-secondary/50 text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20 rounded-sm">
                    {area}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex-1 hidden md:block">
            {/* Minimalist illustration area instead of generic blobs */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full aspect-[4/5] object-cover relative pointer-events-none p-4">
              <div className="absolute inset-0 border-[1px] border-primary/20 m-8 rounded-bl-[100px] rounded-tr-[100px]" />
              <div className="absolute inset-0 bg-secondary/20 m-4 rounded-bl-[80px] rounded-tr-[80px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Division ── */}
      <div className="w-full flex justify-center py-8">
        <div className="w-px h-16 bg-primary/30" />
      </div>

      {/* ── Featured Estates ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="flex flex-col items-center mb-16 text-center">
          <p className="text-xs tracking-[0.2em] text-primary/70 uppercase mb-4">Curated Collection</p>
          <h2 className="font-display text-4xl text-foreground font-medium">Featured Properties</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured?.map((property: any, i: number) => {
            const beds = getAvailableBeds(property);
            const startingRent = getRentRange(property);
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/property/${property.id}`)}
                className="cursor-pointer group"
              >
                <div className="zen-card h-full flex flex-col p-4 bg-card">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-secondary/30 mb-5">
                    {property.photos?.length > 0 ? (
                      <img src={property.photos[0]} alt={property.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-in-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bed size={30} className="text-foreground/10" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 w-full h-full border border-foreground/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />

                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-background shadow-sm border border-border text-[10px] uppercase tracking-wider text-foreground/80 font-medium scale-[0.95] group-hover:scale-100 transition-transform">
                      {beds > 0 ? `${beds} available` : 'Full'}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{property.name}</h3>
                      {property.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={10} className="fill-primary text-primary" />
                          <span className="text-xs text-foreground/80">{property.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60 mb-6 font-body flex items-center gap-1.5">
                      <MapPin size={12} className="text-primary/50" />
                      {[property.area, property.city].filter(Boolean).join(', ')}
                    </p>
                    <div className="mt-auto border-t border-border/50 pt-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-foreground/50 tracking-wider">RENT</span>
                        <div className="font-medium text-foreground tracking-wide">{startingRent}</div>
                      </div>
                      <ArrowRight size={16} className="text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
          <Button variant="outline" className="px-8 font-medium tracking-widest uppercase text-xs" onClick={() => navigate('/explore')}>
            Discover All <ChevronRight size={14} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-foreground text-background flex items-center justify-center font-display font-medium text-xs tracking-wide">
              PS
            </div>
            <span className="font-display tracking-widest text-sm text-foreground/60 uppercase">PGShaala</span>
          </div>
          <p className="text-xs text-foreground/40 font-body">© 2026. Designed with intent.</p>
        </div>
      </footer>
    </div>
  );
}
