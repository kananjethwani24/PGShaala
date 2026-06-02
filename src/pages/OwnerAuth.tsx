import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Building2, Shield, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerAuth = () => {
  const navigate = useNavigate();
  const { user, isOwner, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingOwner, setVerifyingOwner] = useState(false);

  // If already logged in as owner, go to portal
  useEffect(() => {
    if (!authLoading && user && isOwner) {
      navigate('/owner-portal', { replace: true });
    }
  }, [authLoading, user, isOwner, navigate]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerifyingOwner(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message);
        setLoading(false);
        setVerifyingOwner(false);
        return;
      }

      if (!authData.user) {
        toast.error('Login failed. Please try again.');
        setLoading(false);
        setVerifyingOwner(false);
        return;
      }

      // Fast check for owner profile existence
      const { data: ownerProfile, error: ownerError } = await supabase
        .from('owners')
        .select('name')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (ownerError || !ownerProfile) {
        toast.error('No owner profile found. Please contact the PG Shaala team.');
        await supabase.auth.signOut();
        setLoading(false);
        setVerifyingOwner(false);
        return;
      }

      toast.success(`Welcome back, ${ownerProfile.name}!`);
      // Let the reactive useEffect handle the redirection to /owner-portal cleanly!
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An unexpected error occurred');
      setLoading(false);
      setVerifyingOwner(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success('Password reset link sent to your email');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, hsl(220, 16%, 8%) 0%, hsl(200, 20%, 12%) 50%, hsl(180, 15%, 10%) 100%)' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white tracking-tight">PG SHAALA</h1>
              <p className="text-[11px] text-white/40">Owner Portal</p>
            </div>
          </div>
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400 tracking-wider uppercase">Property Owner Access</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white leading-tight mb-4 tracking-tight">
            Your properties.<br />Your insights.<br />Your control.
          </h2>
          <p className="text-white/40 text-sm max-w-md leading-relaxed">
            Monitor occupancy, track bookings, confirm room status, and view effort reports — all in real time from your dedicated dashboard.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { label: 'Real-time Stats', value: 'Live', icon: '📊' },
              { label: 'Room Status', value: 'Confirm', icon: '🏠' },
              { label: 'Effort Reports', value: 'Track', icon: '📈' },
            ].map((s) => (
              <motion.div
                key={s.label}
                className="rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm"
                style={{ background: 'hsla(220, 14%, 12%, 0.7)' }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.2)' }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-lg mb-1">{s.icon}</p>
                <p className="font-display font-bold text-white text-base">{s.value}</p>
                <p className="text-[10px] text-white/30 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-[10px] text-white/20">© 2026 PG Shaala. All rights reserved.</p>

        {/* Background decorative elements */}
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(160, 90%, 45%), transparent)' }}
        />
        <div
          className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, hsl(180, 80%, 50%), transparent)' }}
        />
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground tracking-tight">PG SHAALA</h1>
              <p className="text-[10px] text-muted-foreground">Owner Portal</p>
            </div>
          </div>

          {/* Owner badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-6">
            <Shield size={12} />
            Property Owner Login
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-display font-bold text-xl text-foreground mb-1 tracking-tight">
                {mode === 'login' ? 'Owner Sign In' : 'Reset Password'}
              </h2>
              <p className="text-xs text-muted-foreground mb-8">
                {mode === 'login'
                  ? 'Access your property dashboard and manage your listings'
                  : 'Enter your registered email to reset your password'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Verifying overlay */}
          <AnimatePresence>
            {verifyingOwner && (
              <motion.div
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center animate-pulse">
                    <Shield size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Verifying owner account...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={mode === 'login' ? handleLogin : handleForgot} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-2xs">Email</Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 h-11 rounded-xl"
                  type="email"
                  placeholder="owner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="owner-email"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="space-y-1.5">
                <Label className="text-2xs">Password</Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-9 h-11 rounded-xl"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    id="owner-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-2xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              disabled={loading}
              id="owner-login-btn"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In to Owner Portal'
                : 'Send Reset Link'}
            </Button>
          </form>

          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="flex items-center gap-1.5 text-2xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              <ArrowLeft size={12} />
              Back to sign in
            </button>
          )}

          {/* Quick-Fill Demo Accounts Panel */}

          {/* Info box */}
          <motion.div
            className="mt-8 p-4 rounded-xl border border-border bg-secondary/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-2xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Don't have an account?</span>{' '}
              Owner accounts are created by the PG Shaala team when your property is onboarded. Contact your property manager or reach out to{' '}
              <span className="text-emerald-600 dark:text-emerald-400">support@pgshaala.com</span>{' '}
              for access.
            </p>
          </motion.div>

          {/* Link to CRM login */}
          <div className="mt-6 text-center">
            <p className="text-2xs text-muted-foreground">
              Looking for the staff login?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-accent hover:underline font-medium"
              >
                Go to CRM Login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerAuth;
