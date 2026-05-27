'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — AI Skin Analysis Page (/skin-analysis)
// Full-page experience: upload 4 angles → Gemini AI → results + recommendations
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Camera, Trash2, Loader2, ArrowRight, ShieldCheck,
  Award, AlertCircle, RotateCcw, ShoppingBag, Star, CheckCircle2,
  ScanFace, Zap, Brain, FlaskConical,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import type { ProductCardData } from '@/types/product';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SkinConcernResult {
  name: string;
  severityPercent: number;
  details: string;
}

interface AnalysisResult {
  skinType: string;
  skinTypeDescription: string;
  concerns: SkinConcernResult[];
  routineExplanation: string;
  recommendedProductSlugs: string[];
  isMock: boolean;
}

type PageStep = 'landing' | 'upload' | 'scanning' | 'results' | 'error';

// ─── Scan angles config ───────────────────────────────────────────────────────
const SCAN_ANGLES = [
  {
    key: 'front',
    label: 'Front Profile',
    desc: 'Face the camera directly — natural light',
    guide: 'Look straight at camera',
    icon: '👁️',
  },
  {
    key: 'forehead',
    label: 'Forehead Zone',
    desc: 'T-zone, forehead close-up',
    guide: 'Tilt chin down slightly',
    icon: '⬆️',
  },
  {
    key: 'left',
    label: 'Left Cheek',
    desc: 'Left side profile, cheek & jaw',
    guide: 'Turn head to the right',
    icon: '◀️',
  },
  {
    key: 'right',
    label: 'Right Cheek',
    desc: 'Right side profile, cheek & jaw',
    guide: 'Turn head to the left',
    icon: '▶️',
  },
];

// ─── Scanning status messages ─────────────────────────────────────────────────
const SCAN_STATUSES = [
  'Calibrating facial vectors...',
  'Scanning skin pigmentation layers...',
  'Evaluating sebum levels in T-zone...',
  'Analyzing pore activity and size...',
  'Checking hydration barrier resilience...',
  'Comparing with dermatological standards...',
  'Generating your personalized profile...',
];

// ─── Concern colour helper ────────────────────────────────────────────────────
function getConcernColor(percent: number) {
  if (percent >= 70) return 'bg-red-400';
  if (percent >= 45) return 'bg-amber-400';
  return 'bg-emerald-400';
}

// ─── Animated severity bar ────────────────────────────────────────────────────
function SeverityBar({ percent, delay = 0 }: { percent: number; delay?: number }) {
  return (
    <div className="h-2 w-full bg-beige/40 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${getConcernColor(percent)}`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1.2, delay, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gold/20 rounded-pill px-4 py-2">
      <span className="text-gold">{icon}</span>
      <span className="text-xs font-body font-medium text-charcoal">{text}</span>
    </div>
  );
}

// ─── Image compression helper ─────────────────────────────────────────────────
function compressImage(base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SkinAnalysisPage() {
  const [step, setStep] = useState<PageStep>('landing');
  const [images, setImages] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanStatus, setScanStatus] = useState(SCAN_STATUSES[0]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { addItem } = useCartStore();

  const uploadedCount = Object.keys(images).length;
  const allUploaded = uploadedCount === 4;

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFileChange = useCallback((key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    if (file.size > 15 * 1024 * 1024) { toast.error('Image must be under 15MB.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const toastId = toast.loading(`Optimizing ${key === 'front' ? 'Front' : key === 'forehead' ? 'Forehead' : key === 'left' ? 'Left Cheek' : 'Right Cheek'} photo...`);
        try {
          const compressed = await compressImage(reader.result, 800, 800, 0.75);
          setImages(prev => ({ ...prev, [key]: compressed }));
          toast.success(`${key === 'front' ? 'Front' : key === 'forehead' ? 'Forehead' : key === 'left' ? 'Left cheek' : 'Right cheek'} photo added & optimized!`, { id: toastId });
        } catch (err) {
          setImages(prev => ({ ...prev, [key]: reader.result as string }));
          toast.success(`${key === 'front' ? 'Front' : key === 'forehead' ? 'Forehead' : key === 'left' ? 'Left cheek' : 'Right cheek'} photo added!`, { id: toastId });
        }
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback((key: string) => {
    setImages(prev => { const u = { ...prev }; delete u[key]; return u; });
    if (fileInputRefs.current[key]) fileInputRefs.current[key]!.value = '';
  }, []);

  // ── Analysis ───────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setStep('scanning');
    setScanStatus(SCAN_STATUSES[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < SCAN_STATUSES.length) setScanStatus(SCAN_STATUSES[idx]);
    }, 1400);

    try {
      const res = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: Object.values(images) }),
        signal: AbortSignal.timeout(60000),
      });
      
      let raw: any;
      try {
        raw = await res.json();
      } catch (e) {
        // Response is not JSON or empty
      }

      if (!res.ok) {
        throw new Error(raw?.error || 'Analysis failed. Please try again.');
      }

      const data: AnalysisResult = raw;
      setResult(data);
      setStep('results');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please retry.');
      setStep('error');
    } finally {
      clearInterval(interval);
    }
  };

  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = (product: ProductCardData) => {
    const v = product.variants[0];
    addItem({
      product_id: product.id,
      variant_id: v?.id || null,
      product_name: product.name,
      product_slug: product.slug,
      variant_name: v?.name || null,
      unit_price: v?.price ?? product.sale_price ?? product.base_price,
      quantity: 1,
      image_url: product.images[0]?.url || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  const recommendedProducts = DEMO_PRODUCTS.filter(p =>
    result?.recommendedProductSlugs?.includes(p.slug)
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setImages({});
    setResult(null);
    setErrorMsg('');
    setStep('upload');
    Object.values(fileInputRefs.current).forEach(ref => { if (ref) ref.value = ''; });
  };

  return (
    <div className="min-h-screen bg-ivory">

      {/* ══════════════════════════════════════════════════════════════
          LANDING / HERO — shown before user starts
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-obsidian via-charcoal to-obsidian min-h-[92vh] flex items-center">
              {/* Decorative glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 65%)' }} />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              </div>

              <div className="container-lanan relative z-10 py-20 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left — copy */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-pill px-4 py-1.5 mb-6">
                      <Sparkles size={12} className="text-gold" />
                      <span className="text-gold text-xs font-body font-medium tracking-widest uppercase">
                        Powered by Google Gemini AI
                      </span>
                    </div>

                    <h1 className="font-heading font-light text-ivory leading-[1.05] mb-6">
                      Discover Your{' '}
                      <em className="italic text-gold">True Skin</em>
                      <br />
                      Profile
                    </h1>

                    <p className="font-body text-ivory/70 text-base leading-relaxed mb-8 max-w-md">
                      Upload 4 close-up photos of your face. Our AI analyzes your skin type,
                      detects concerns like pigmentation and acne, and recommends a personalized
                      skincare routine — free, in under 30 seconds.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-10">
                      <FeaturePill icon={<Zap size={13} />} text="Results in 30 seconds" />
                      <FeaturePill icon={<Brain size={13} />} text="Gemini Vision AI" />
                      <FeaturePill icon={<FlaskConical size={13} />} text="Dermatologist-level analysis" />
                      <FeaturePill icon={<ShieldCheck size={13} />} text="100% Private — photos not stored" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setStep('upload')}
                        className="btn-gold text-sm px-8 py-4"
                        id="start-analysis-btn"
                      >
                        Start Free Skin Analysis
                        <ArrowRight size={16} />
                      </button>
                      <Link href="/shop" className="btn-outline-gold border-ivory/30 text-ivory hover:bg-ivory/10 text-sm px-8 py-4">
                        Browse Products
                      </Link>
                    </div>
                  </motion.div>
                </div>

                {/* Right — visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="hidden lg:block"
                >
                  <div className="relative aspect-square max-w-md mx-auto">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border border-gold/20 animate-spin-slow" />
                    <div className="absolute inset-6 rounded-full border border-gold/10" />

                    {/* Center image */}
                    <div className="absolute inset-10 rounded-full overflow-hidden shadow-glow-gold">
                      <Image
                        src="/Hero Banner Model.jpeg"
                        alt="AI Skin Analysis"
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Scan line animation */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-gold/10" />
                      <motion.div
                        className="absolute inset-x-0 h-0.5 bg-gold/60 shadow-glow-gold"
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>

                    {/* Floating badges */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-4 -right-4 bg-white rounded-card p-3 shadow-luxury"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center text-gold">
                          <ScanFace size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-body font-semibold text-obsidian">AI Analysis</p>
                          <p className="text-[10px] font-mono text-gold">Active</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      className="absolute bottom-8 -left-6 bg-white rounded-card p-3 shadow-luxury"
                    >
                      <p className="text-[10px] font-body text-obsidian font-medium">Skin Type Detected</p>
                      <p className="text-[10px] font-mono text-gold">Combination ✓</p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* How it works strip */}
              <div className="absolute bottom-0 left-0 right-0">
                <div className="container-lanan py-6 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { n: '01', t: 'Upload 4 Photos', d: 'Front, forehead, left & right cheek' },
                      { n: '02', t: 'AI Scans Your Skin', d: 'Gemini Vision analyzes pigmentation, pores & hydration' },
                      { n: '03', t: 'Get Your Routine', d: 'Personalized product recommendations for your skin' },
                    ].map(s => (
                      <div key={s.n} className="text-center">
                        <span className="text-gold/40 text-xs font-mono">{s.n}</span>
                        <p className="text-ivory/80 text-xs font-body font-semibold mt-1">{s.t}</p>
                        <p className="text-ivory/40 text-[10px] font-body mt-0.5 hidden sm:block">{s.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            UPLOAD STEP
        ══════════════════════════════════════════════════════════════ */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
            className="container-lanan py-12 max-w-3xl"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-pill px-4 py-1.5 mb-4">
                <Camera size={12} className="text-gold" />
                <span className="text-gold text-xs font-body font-semibold tracking-wider uppercase">Step 1 of 2 — Upload Photos</span>
              </div>
              <h1 className="font-heading text-3xl lg:text-4xl text-obsidian font-light mb-3">
                Upload Your Face Photos
              </h1>
              <p className="font-body text-taupe text-sm max-w-md mx-auto leading-relaxed">
                Upload 4 close-up selfies for the best results. Use <strong>natural light</strong>,
                remove glasses and pull hair back. On mobile, tap any slot to open your camera directly.
              </p>
            </div>

            {/* Upload tips banner */}
            <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 mb-8 grid sm:grid-cols-3 gap-3">
              {[
                { icon: '💡', tip: 'Use natural daylight — avoid harsh indoor lighting' },
                { icon: '📱', tip: 'On mobile, tap to open camera directly in selfie mode' },
                { icon: '😐', tip: 'Keep a neutral expression, face fully visible' },
              ].map(t => (
                <div key={t.tip} className="flex items-start gap-2">
                  <span className="text-base">{t.icon}</span>
                  <p className="text-[11px] font-body text-taupe">{t.tip}</p>
                </div>
              ))}
            </div>

            {/* 2×2 Upload grid */}
            <div className="grid grid-cols-2 gap-4 lg:gap-5 mb-6">
              {SCAN_ANGLES.map((angle, i) => {
                const hasImg = !!images[angle.key];
                return (
                  <motion.div
                    key={angle.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      ref={el => { fileInputRefs.current[angle.key] = el; }}
                      onChange={e => handleFileChange(angle.key, e)}
                      className="hidden"
                      id={`upload-${angle.key}`}
                    />
                    <label
                      htmlFor={`upload-${angle.key}`}
                      className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer overflow-hidden group block ${
                        hasImg
                          ? 'border-gold/40 bg-white shadow-card'
                          : 'border-dashed border-beige hover:border-gold hover:bg-ivory/60 bg-white'
                      }`}
                    >
                      {hasImg ? (
                        <>
                          <Image src={images[angle.key]} alt={angle.label} fill className="object-cover rounded-xl" />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-obsidian/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                            <button
                              type="button"
                              onClick={e => { e.preventDefault(); removeImage(angle.key); }}
                              className="p-2.5 rounded-full bg-red-500 text-white hover:scale-105 transition-transform"
                              title="Remove and retake"
                            >
                              <Trash2 size={15} />
                            </button>
                            <span className="text-ivory text-[10px] font-body">Tap to retake</span>
                          </div>
                          {/* Checkmark badge */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                          {/* Angle label */}
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                            <span className="bg-obsidian/70 text-ivory text-[9px] font-body font-semibold px-2.5 py-0.5 rounded-full">
                              {angle.label}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-gold/8 border border-gold/15 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                            {angle.icon}
                          </div>
                          <span className="text-sm font-body font-semibold text-charcoal mb-1">{angle.label}</span>
                          <span className="text-[10px] font-body text-taupe mb-2 leading-tight">{angle.desc}</span>
                          <span className="text-[9px] font-body text-gold/80 border border-gold/20 rounded-pill px-2.5 py-0.5">
                            {angle.guide}
                          </span>
                          <div className="mt-3 flex items-center gap-1.5 text-gold">
                            <Camera size={13} />
                            <span className="text-[10px] font-body font-medium">Tap to capture</span>
                          </div>
                        </>
                      )}
                    </label>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-body mb-2">
                <span className="text-taupe">Upload progress</span>
                <span className="text-gold font-semibold">{uploadedCount} of 4 photos</span>
              </div>
              <div className="h-2 bg-beige/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
                  animate={{ width: `${(uploadedCount / 4) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleAnalyze}
              disabled={!allUploaded}
              className="w-full btn-gold text-sm py-4 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={allUploaded ? { scale: 1.01 } : {}}
              whileTap={allUploaded ? { scale: 0.99 } : {}}
              id="analyze-skin-btn"
            >
              {allUploaded ? (
                <>
                  <Sparkles size={16} className="animate-pulse" />
                  Analyze My Skin Now
                  <ArrowRight size={16} />
                </>
              ) : (
                `Upload ${4 - uploadedCount} more photo${4 - uploadedCount !== 1 ? 's' : ''} to continue`
              )}
            </motion.button>

            <p className="text-center text-[10px] font-body text-taupe mt-3">
              🔒 Your photos are processed in real-time and never stored on our servers.
            </p>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCANNING STEP
        ══════════════════════════════════════════════════════════════ */}
        {step === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="min-h-[80vh] flex items-center justify-center"
          >
            <div className="text-center px-6 max-w-sm mx-auto">
              {/* Animated face scan circle */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full border border-gold/30 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-gold/40">
                  <Image
                    src={images['front'] || '/Hero Banner Model.jpeg'}
                    alt="Scanning"
                    fill
                    className="object-cover opacity-70"
                  />
                </div>
                {/* Scan bar */}
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent shadow-glow-gold z-10"
                  animate={{ top: ['5%', '95%', '5%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Corner brackets */}
                {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map(pos => (
                  <div key={pos} className={`absolute ${pos} w-4 h-4 border-gold/70 ${pos.includes('top') && pos.includes('left') ? 'border-t-2 border-l-2' : pos.includes('top') ? 'border-t-2 border-r-2' : pos.includes('left') ? 'border-b-2 border-l-2' : 'border-b-2 border-r-2'} rounded-sm`} />
                ))}
              </div>

              <h2 className="font-heading text-2xl text-obsidian font-light mb-2">Analyzing Your Skin</h2>
              <AnimatePresence mode="wait">
                <motion.p
                  key={scanStatus}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm font-body text-taupe mb-8"
                >
                  {scanStatus}
                </motion.p>
              </AnimatePresence>

              {/* Checklist */}
              <div className="space-y-3 text-left bg-white rounded-2xl border border-beige/60 p-5">
                {[
                  'Skin type classification',
                  'Pigmentation & tone analysis',
                  'Pore & sebum evaluation',
                  'Hydration barrier check',
                  'Product matching engine',
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                  >
                    <Loader2 size={13} className="text-gold animate-spin flex-shrink-0" />
                    <span className="text-xs font-body text-charcoal">{item}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-[10px] font-body text-taupe mt-4">This may take 15–30 seconds...</p>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            RESULTS STEP
        ══════════════════════════════════════════════════════════════ */}
        {step === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Results hero banner */}
            <div className="bg-obsidian relative overflow-hidden py-10">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-10"
                  style={{ background: 'radial-gradient(ellipse at center, #C9A96E 0%, transparent 70%)' }} />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              </div>
              <div className="container-lanan relative z-10 text-center">
                <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
                  <ShieldCheck size={28} />
                </div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="text-xs font-body text-gold uppercase tracking-widest font-semibold">Analysis Complete</span>
                  {result.isMock && (
                    <span className="text-[8px] bg-white/10 text-ivory/50 font-mono px-2 py-0.5 rounded-full uppercase">Demo Mode</span>
                  )}
                </div>
                <h1 className="font-heading text-3xl lg:text-4xl text-ivory font-light mb-2">
                  Your Skin Profile
                </h1>
                <p className="text-ivory/60 text-sm font-body">
                  Here's your personalized report — curated for Indian skin
                </p>
              </div>
            </div>

            <div className="container-lanan py-10 max-w-4xl">
              <div className="grid lg:grid-cols-3 gap-8">

                {/* ── Left column: skin type + concerns ── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Skin type card */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-beige/60 p-6 shadow-card"
                  >
                    <p className="text-[10px] font-body text-taupe uppercase tracking-wider font-semibold mb-1">Your Skin Type</p>
                    <h2 className="font-heading text-3xl text-gold font-medium mb-3">{result.skinType}</h2>
                    <p className="text-sm font-body text-charcoal leading-relaxed">{result.skinTypeDescription}</p>
                  </motion.div>

                  {/* Concerns section */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-beige/60 p-6 shadow-card"
                  >
                    <h3 className="text-xs uppercase font-body font-bold text-obsidian tracking-wider mb-5">
                      Skin Concern Analysis
                    </h3>
                    <div className="space-y-5">
                      {result.concerns?.map((concern, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-body font-semibold text-charcoal">{concern.name}</span>
                            <span className="text-xs font-mono font-bold text-obsidian">{concern.severityPercent}%</span>
                          </div>
                          <SeverityBar percent={concern.severityPercent} delay={i * 0.15 + 0.3} />
                          <p className="text-[11px] font-body text-taupe mt-1.5 leading-relaxed">{concern.details}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Routine explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gold/5 border border-gold/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award size={16} className="text-gold" />
                      <h3 className="text-xs font-body font-bold text-obsidian uppercase tracking-wider">
                        Your Personalized Routine
                      </h3>
                    </div>
                    <p className="text-sm font-body text-charcoal leading-relaxed">{result.routineExplanation}</p>
                  </motion.div>
                </div>

                {/* ── Right column: products + actions ── */}
                <div className="space-y-5">
                  {/* Coupon reward */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-obsidian rounded-2xl p-5 text-center"
                  >
                    <p className="text-[9px] font-body text-gold uppercase tracking-widest font-semibold mb-1">AI Scan Reward</p>
                    <h4 className="font-heading text-xl text-ivory font-light mb-3">15% Off Your Routine</h4>
                    <div className="flex items-center justify-between bg-white/10 border border-white/15 border-dashed rounded-xl px-4 py-3 mb-3">
                      <span className="font-mono text-sm tracking-wider font-bold text-gold">LANANAI</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText('LANANAI'); toast.success('Coupon copied!'); }}
                        className="text-[10px] font-body text-gold/80 hover:text-gold underline"
                      >
                        Copy
                      </button>
                    </div>
                    <Link
                      href="/shop"
                      className="btn-gold w-full justify-center text-xs py-2.5"
                    >
                      Shop With Code
                      <ArrowRight size={13} />
                    </Link>
                  </motion.div>

                  {/* Recommended products */}
                  {recommendedProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-white rounded-2xl border border-beige/60 p-5 shadow-card"
                    >
                      <h3 className="text-xs uppercase font-body font-bold text-obsidian tracking-wider mb-4">
                        Recommended For You
                      </h3>
                      <div className="space-y-3">
                        {recommendedProducts.map((prod, i) => (
                          <motion.div
                            key={prod.id}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                            className="flex gap-3 p-3 rounded-xl border border-beige/40 bg-ivory/40 hover:border-gold/30 hover:shadow-sm transition-all"
                          >
                            <div className="w-14 h-14 relative bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={prod.images[0]?.url || ''} alt={prod.name} fill sizes="56px" className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-body font-semibold text-obsidian truncate">{prod.name}</h5>
                              <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} size={8} className={j < Math.round(prod.rating_avg) ? 'text-gold fill-gold' : 'text-beige fill-beige'} />
                                ))}
                                <span className="text-[9px] font-body text-taupe ml-1">({prod.rating_count})</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono font-bold text-obsidian">
                                    {formatPrice(prod.sale_price ?? prod.base_price)}
                                  </span>
                                  {prod.sale_price && (
                                    <span className="text-[9px] font-mono text-taupe line-through">
                                      {formatPrice(prod.base_price)}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleAddToCart(prod)}
                                  className="flex items-center gap-1 bg-obsidian text-ivory text-[9px] font-body font-semibold px-2.5 py-1.5 rounded-pill hover:bg-gold hover:text-obsidian transition-colors"
                                >
                                  <ShoppingBag size={9} />
                                  Add
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Retry / new scan */}
                  <button
                    onClick={reset}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-beige rounded-xl text-sm font-body text-charcoal hover:border-gold/40 hover:text-gold transition-all"
                  >
                    <RotateCcw size={14} />
                    Scan Again with New Photos
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ERROR STEP
        ══════════════════════════════════════════════════════════════ */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[70vh] flex items-center justify-center px-6"
          >
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-400 mx-auto mb-5">
                <AlertCircle size={28} />
              </div>
              <h2 className="font-heading text-2xl text-obsidian font-light mb-2">Analysis Failed</h2>
              <p className="text-sm font-body text-taupe leading-relaxed mb-8 max-w-xs mx-auto">{errorMsg}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStep('upload')} className="btn-gold text-sm px-6 py-3">
                  <RotateCcw size={14} />
                  Try Again
                </button>
                <Link href="/shop" className="btn-outline-gold text-sm px-6 py-3">
                  Browse Products
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
