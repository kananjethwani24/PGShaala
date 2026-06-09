import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Kanban, CalendarCheck, BarChart3,
  MessageSquare, History, X, Moon, Sun, Building2, Bed, TrendingUp,
  Map, Sparkles, Receipt, Globe, Radio, Cpu, LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const salesItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/visits', icon: CalendarCheck, label: 'Visits' },
  { to: '/conversations', icon: MessageSquare, label: 'Messages' },
  { to: '/bookings', icon: Receipt, label: 'Bookings' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/historical', icon: History, label: 'Historical' },
];

const supplyItems = [
  { to: '/owners', icon: Building2, label: 'Owners' },
  { to: '/inventory', icon: Bed, label: 'Inventory' },
  { to: '/availability', icon: Map, label: 'Availability' },
  { to: '/effort', icon: TrendingUp, label: 'Effort' },
  { to: '/matching', icon: Sparkles, label: 'Matching' },
  { to: '/zones', icon: Globe, label: 'Zones' },
];

const simulationItems = [
  { to: '/iot', icon: Radio, label: 'Smart Infrastructure' },
  { to: '/math', icon: Cpu, label: 'Smart Optimization' },
];

// Consistent avatar colour based on first character
const avatarColors: Record<string, string> = {
  a: '#6366f1', b: '#8b5cf6', c: '#ec4899', d: '#f97316',
  e: '#10b981', f: '#3b82f6', g: '#14b8a6', h: '#f59e0b',
};
function getAvatarColor(char: string) {
  return avatarColors[char.toLowerCase()] ?? '#6366f1';
}

const AppSidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const { user, role, isAdmin, isManager, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(() =>
    document.documentElement.classList.contains('light')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    if (isLight) document.documentElement.classList.remove('dark');
  }, [isLight]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderGroup = (label: string, items: any[]) => {
    const visible = items;
    if (visible.length === 0) return null;

    return (
      <div className="sb-group">
        <p className="sb-group-label">{label}</p>
        <div className="sb-items">
          {visible.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`sb-link${active ? ' sb-link--active' : ''}`}
              >
                <item.icon
                  size={16}
                  strokeWidth={active ? 2 : 1.6}
                  className={active ? 'sb-icon--active' : 'sb-icon'}
                />
                <span className="sb-label">{item.label}</span>
                {active && <span className="sb-active-dot" />}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  const emailChar = (user?.email?.[0] ?? 'U').toUpperCase();
  const avatarBg = getAvatarColor(emailChar);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sb-root fixed left-0 top-0 z-50 h-screen w-[240px] flex flex-col
          transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Logo ── */}
        <div className="sb-logo">
          <div className="sb-logo-avatar">PG</div>
          <div className="sb-logo-text">
            <span className="sb-logo-name">PG SHAALA</span>
            <span className="sb-logo-sub">THE PG SUITE</span>
          </div>
          <button className="sb-close lg:hidden" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="sb-nav">
          {renderGroup('Demand Management', salesItems)}
          {renderGroup('Supply Chain', supplyItems)}
          {renderGroup('System Core', simulationItems)}
        </nav>

        {/* ── Footer actions ── */}
        <div className="sb-footer">
          <button onClick={() => setIsLight(!isLight)} className="sb-footer-btn">
            {isLight ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
            <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button onClick={handleLogout} className="sb-footer-btn sb-footer-btn--danger">
            <LogOut size={15} strokeWidth={1.5} />
            <span>Terminate Session</span>
          </button>
        </div>

        {/* ── User strip ── */}
        <div className="sb-user">
          <div className="sb-user-avatar" style={{ background: avatarBg }}>
            {emailChar}
          </div>
          <div className="sb-user-info">
            <span className="sb-user-name capitalize">{role ?? 'Admin'}</span>
            <span className="sb-user-email">{user?.email}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
