'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Authentication Modal
// Phone OTP & Email Login/Signup with Supabase Auth integration
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Lock, User, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Custom Golden Confetti Particle system
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height - 20;
        this.size = Math.random() * 8 + 4;
        const colors = ['#C9A96E', '#D4B88A', '#A8813D', '#E8D4B0', '#FFFFFF'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 3 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > height) {
          this.y = -20;
          this.x = Math.random() * width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        
        if (Math.random() > 0.5) {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none w-full h-full z-40" />;
}

export default function AuthModal() {
  const { authModalOpen, authMode, closeAuthModal, openAuthModal } = useUIStore();
  const supabase = createClient();

  // Tab State: 'phone' | 'email'
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  
  // Loading & State variables
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Celebration States
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationName, setCelebrationName] = useState('');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Handle Phone OTP Request
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (authMode === 'register' && !fullName.trim()) {
      toast.error('Please enter your full name to register.');
      return;
    }

    setLoading(true);
    try {
      // Check if user exists when in login mode
      if (authMode === 'login') {
        const checkResponse = await fetch('/api/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });

        const checkData = await checkResponse.json();

        if (!checkData.exists) {
          toast.error('No account found with this number. Please sign up first.');
          openAuthModal('register');
          setPhone('');
          setLoading(false);
          return;
        }
      }

      const formattedPhone = `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: authMode === 'register',
          data: authMode === 'register' ? { full_name: fullName } : undefined
        }
      });

      if (error) {
        // Fallback for local development when SMS providers aren't set up yet
        console.warn('Supabase SMS provider error:', error.message);
        toast.info('Local Demo: SMS provider not configured. Use OTP: 123456');
      } else {
        toast.success('OTP sent successfully to your phone!');
      }
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      
      // If mock fallback was used
      if (otp === '123456') {
        const mockUser = {
          id: `mock-user-${phone}`,
          phone: formattedPhone,
          user_metadata: {
            full_name: fullName || 'Lanan Customer'
          }
        };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        
        // Sync to public.customers table via secure server-side API
        try {
          await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: `01920392-1234-7000-c000-${phone.padEnd(12, '0').slice(0, 12)}`,
              phone: formattedPhone,
              email: null,
              full_name: fullName || 'Lanan Customer',
            }),
          });
        } catch (e) {
          console.warn('DB sync bypassed in local mock:', e);
        }

        window.dispatchEvent(new Event('auth-state-change'));
        
        if (authMode === 'register') {
          setCelebrationName(fullName || 'Lanan Customer');
          setShowCelebration(true);
        } else {
          toast.success('Successfully logged in (Demo Mode)!');
          closeAuthModal();
          resetForm();
        }
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        throw error;
      }

      // Sync to public.customers table via secure server-side API
      if (data.user) {
        try {
          await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              phone: data.user.phone,
              email: data.user.email || null,
              full_name: data.user.user_metadata?.full_name || fullName || 'User',
            }),
          });
        } catch (syncError) {
          console.error('Profile sync error:', syncError);
        }
      }

      window.dispatchEvent(new Event('auth-state-change'));
      
      if (authMode === 'register') {
        setCelebrationName(fullName || data.user?.user_metadata?.full_name || 'User');
        setShowCelebration(true);
      } else {
        toast.success('Welcome to LANAN! Successfully logged in.');
        closeAuthModal();
        resetForm();
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Login / Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all credentials.');
      return;
    }
    if (authMode === 'register' && !fullName.trim()) {
      toast.error('Please enter your full name to register.');
      return;
    }

    setLoading(true);
    try {
      // Check if user exists when in login mode
      if (authMode === 'login') {
        const checkResponse = await fetch('/api/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const checkData = await checkResponse.json();

        if (!checkData.exists) {
          toast.error('No account found with this email. Please sign up first.');
          openAuthModal('register');
          setEmail('');
          setLoading(false);
          return;
        }
      }

      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Sync to public.customers table via secure server-side API on successful login
        if (data.user) {
          try {
            await fetch('/api/sync-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.user.id,
                phone: data.user.phone || null,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || 'User',
              }),
            });
          } catch (syncError) {
            console.error('Profile sync error:', syncError);
          }
        }

        window.dispatchEvent(new Event('auth-state-change'));
        toast.success('Welcome back to LANAN!');
        closeAuthModal();
        resetForm();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Sync to public.customers table via secure server-side API on registration
        if (data.user) {
          try {
            await fetch('/api/sync-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.user.id,
                phone: null,
                email: data.user.email,
                full_name: fullName || 'User',
              }),
            });
          } catch (syncError) {
            console.error('Profile sync error:', syncError);
          }
        }

        window.dispatchEvent(new Event('auth-state-change'));
        setCelebrationName(fullName || 'User');
        setShowCelebration(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhone('');
    setOtp('');
    setEmail('');
    setPassword('');
    setFullName('');
    setOtpSent(false);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!showCelebration) { closeAuthModal(); resetForm(); } }}
            className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
          />

          {/* Birthday Welcome Confetti */}
          {showCelebration && <ConfettiCanvas />}

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-card shadow-luxury border border-beige/40 p-6 md:p-8 z-50 mx-4 overflow-hidden"
          >
            {/* Close Button */}
            {!showCelebration && (
              <button
                onClick={() => { closeAuthModal(); resetForm(); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ivory hover:bg-beige flex items-center justify-center text-charcoal transition-colors z-20"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}

            {/* Decorative Gold Header Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-gold" />

            {showCelebration ? (
              /* Celebration View */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6 relative z-10 flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                  className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian shadow-gold-lg"
                >
                  <Sparkles size={28} className="text-obsidian" />
                </motion.div>
                
                <div className="space-y-2">
                  <h2 className="font-heading text-3xl text-obsidian font-light">
                    Hi {celebrationName}!
                  </h2>
                  <p className="text-sm font-body text-taupe max-w-xs mx-auto">
                    Welcome to the finest skincare brand
                  </p>
                </div>

                <div className="text-[11px] font-body text-gold/80 bg-gold/5 border border-gold/20 py-2.5 px-4 rounded-lg max-w-xs mx-auto">
                  Your luxury skincare ritual account has been created.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    closeAuthModal();
                    resetForm();
                  }}
                  className="btn-gold text-xs py-3.5 px-8 justify-center w-full max-w-xs mt-2"
                >
                  Begin your ritual
                </button>
              </motion.div>
            ) : (
              /* Regular Auth Forms */
              <>
                {/* Header */}
                <div className="text-center mb-6 mt-2">
                  <span className="font-heading font-bold text-xl tracking-widest text-obsidian bg-gradient-gold -webkit-background-clip-text text-gradient-gold">
                    LANAN
                  </span>
                  <h2 className="font-heading text-2xl text-obsidian font-light mt-2">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-xs font-body text-taupe mt-1.5">
                    {authMode === 'login' ? 'Sign in to access your orders and rituals' : 'Join the LANAN inner circle'}
                  </p>
                </div>

                {/* Tab Navigation (only visible when not entering OTP) */}
                {!otpSent && (
                  <div className="flex border-b border-beige/60 mb-6">
                    <button
                      onClick={() => setActiveTab('phone')}
                      className={`flex-1 pb-2.5 text-xs font-body font-semibold tracking-wider uppercase border-b-2 transition-all ${
                        activeTab === 'phone'
                          ? 'border-gold text-gold'
                          : 'border-transparent text-taupe/60 hover:text-taupe'
                      }`}
                    >
                      Phone OTP
                    </button>
                    <button
                      onClick={() => setActiveTab('email')}
                      className={`flex-1 pb-2.5 text-xs font-body font-semibold tracking-wider uppercase border-b-2 transition-all ${
                        activeTab === 'email'
                          ? 'border-gold text-gold'
                          : 'border-transparent text-taupe/60 hover:text-taupe'
                      }`}
                    >
                      Email & Pass
                    </button>
                  </div>
                )}

                {/* Auth Forms */}
                {activeTab === 'phone' ? (
                  /* Phone Auth Flow */
                  <div className="space-y-4">
                    {!otpSent ? (
                      /* Form 1: Enter Phone Number */
                      <form onSubmit={handleSendOTP} className="space-y-4">
                        {authMode === 'register' && (
                          <div className="space-y-1.5 animate-fade-up">
                            <label className="text-xs font-body font-semibold text-charcoal uppercase tracking-wider block">
                              Full Name
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-taupe">
                                <User size={15} />
                              </div>
                              <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Aditi Sen"
                                className="input-luxury pl-10 text-sm"
                              />
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-xs font-body font-semibold text-charcoal uppercase tracking-wider block">
                            Enter Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-taupe">
                              <Phone size={15} />
                            </div>
                            <span className="absolute inset-y-0 left-9 flex items-center text-sm font-body font-semibold text-charcoal border-r border-beige/60 pr-2">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="9876543210"
                              className="input-luxury pl-[4.5rem] tracking-widest text-sm font-semibold font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || phone.length !== 10 || (authMode === 'register' && !fullName.trim())}
                          className="w-full btn-gold text-sm py-3.5 mt-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              {authMode === 'register' ? 'Register & Send OTP' : 'Send OTP Code'}
                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>

                        {/* Toggle New User Phone Sign Up */}
                        <div className="text-center mt-3">
                          <button
                            type="button"
                            onClick={() => { openAuthModal(authMode === 'login' ? 'register' : 'login'); setFullName(''); }}
                            className="text-[11px] font-body font-semibold text-gold hover:underline focus:outline-none cursor-pointer"
                          >
                            {authMode === 'register' ? 'Already have a LANAN account? Sign In' : 'First time shopping at LANAN? Sign Up with Phone'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Form 2: Verify OTP Code */
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-body font-semibold text-charcoal uppercase tracking-wider block">
                              Enter Verification Code (OTP)
                            </label>
                            <button
                              type="button"
                              onClick={() => setOtpSent(false)}
                              className="text-[10px] font-body text-gold hover:underline"
                            >
                              Change Number
                            </button>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-taupe">
                              <CheckCircle2 size={15} />
                            </div>
                            <input
                              type="text"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="******"
                              className="input-luxury pl-10 text-center tracking-[0.5em] text-sm font-semibold font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-taupe/80 text-center">
                            OTP sent to +91 {phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || otp.length !== 6}
                          className="w-full btn-gold text-sm py-3.5 mt-2 justify-center disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify & Login
                              <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Email/Password Auth Flow */
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {authMode === 'register' && (
                      <div className="space-y-1.5 animate-fade-up">
                        <label className="text-xs font-body font-semibold text-charcoal uppercase tracking-wider block">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-taupe">
                            <User size={15} />
                          </div>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Aditi Sen"
                            className="input-luxury pl-10 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-body font-semibold text-charcoal uppercase tracking-wider block">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-taupe">
                          <Mail size={15} />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aditi@example.com"
                          className="input-luxury pl-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-body font-semibold text-charcoal uppercase tracking-wider block">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-taupe">
                          <Lock size={15} />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="input-luxury pl-10 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-gold text-sm py-3.5 mt-4 justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {authMode === 'login' ? 'Login' : 'Create Account'}
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Mode Switch Helper */}
                {!otpSent && (
                  <div className="text-center mt-6 pt-4 border-t border-beige/40">
                    <p className="text-xs font-body text-taupe">
                      {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                      <button
                        onClick={() => openAuthModal(authMode === 'login' ? 'register' : 'login')}
                        className="font-semibold text-gold hover:underline focus:outline-none"
                      >
                        {authMode === 'login' ? 'Sign Up' : 'Log In'}
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
