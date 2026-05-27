'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — AI Skin Scanner Floating Popup
// Teaser banner → redirects to /skin-analysis for the full experience
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, AlertCircle, Camera, Trash2, 
  Loader2, ArrowRight, ShieldCheck, Award
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { toast } from 'sonner';
import type { ProductCardData } from '@/types/product';

// 4 distinct angles needed for scan
const SCAN_ANGLES = [
  { key: 'front', label: 'Front Profile', desc: 'Direct face photo' },
  { key: 'forehead', label: 'Forehead Zone', desc: 'T-zone focus' },
  { key: 'left', label: 'Left Profile', desc: 'Left cheek & jaw' },
  { key: 'right', label: 'Right Profile', desc: 'Right cheek & jaw' }
];

export default function AIPopup() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [scanStep, setScanStep] = useState<'intro' | 'upload' | 'scanning' | 'results' | 'error'>('intro');
  const [images, setImages] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loadingStatusText, setLoadingStatusText] = useState('Initializing scan...');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { popupVisible, showPopup, hidePopup } = useUIStore();
  const { addItem } = useCartStore();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const router = useRouter();

  useEffect(() => {
    // Show popup after 5 seconds delay
    const showTimer = setTimeout(() => {
      setVisible(true);
      showPopup('ai-skin-scanner');
      
      // Auto-hide popup after 12 seconds
      const hideTimer = setTimeout(() => {
        setVisible(false);
        hidePopup();
      }, 12000);
      
      return () => clearTimeout(hideTimer);
    }, 5000);

    return () => clearTimeout(showTimer);
  }, [showPopup, hidePopup]);

  const handleClosePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    hidePopup();
  };

  // Banner click → go to the full /skin-analysis page
  const goToSkinAnalysis = () => {
    setVisible(false);
    hidePopup();
    router.push('/skin-analysis');
  };

  const startScanWizard = () => {
    setModalOpen(true);
    setScanStep('intro');
    setVisible(false);
    hidePopup();
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages((prev) => ({ ...prev, [key]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }
  };

  const triggerFileInput = (key: string) => {
    fileInputRefs.current[key]?.click();
  };

  const handleAnalyze = async () => {
    setScanStep('scanning');
    setLoadingStatusText('Calibrating facial vectors...');
    
    // Status text rotation for natural AI feel
    const statuses = [
      'Scanning skin pigmentation layers...',
      'Evaluating sebum levels in T-zone...',
      'Analyzing pore activity and size...',
      'Checking hydration barrier resilience...',
      'Comparing scores with dermatological standards...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < statuses.length) {
        setLoadingStatusText(statuses[idx]);
        idx++;
      }
    }, 1200);

    try {
      const res = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: Object.values(images) })
      });

      if (!res.ok) {
        throw new Error('Analysis request failed. Please check your network and try again.');
      }

      const data = await res.json();
      setAnalysisResult(data);
      setScanStep('results');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete skin analysis.');
      setScanStep('error');
    } finally {
      clearInterval(interval);
    }
  };

  const handleAddToCart = (product: ProductCardData) => {
    const primaryVariant = product.variants[0];
    addItem({
      product_id: product.id,
      variant_id: primaryVariant?.id || null,
      product_name: product.name,
      product_slug: product.slug,
      variant_name: primaryVariant?.name || null,
      unit_price: primaryVariant?.price ?? product.sale_price ?? product.base_price,
      quantity: 1,
      image_url: product.images[0]?.url || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  // Find actual products from catalog matching slugs
  const recommendedProducts = DEMO_PRODUCTS.filter((p) =>
    analysisResult?.recommendedProductSlugs?.includes(p.slug)
  );

  return (
    <>
      {/* ── Sticky Floating Popup Banner ── clicks → /skin-analysis ── */}
      <AnimatePresence>
        {visible && popupVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto mx-auto sm:mx-0 z-40 w-[calc(100%-2rem)] sm:w-[380px] max-w-sm sm:max-w-none bg-white border border-beige/60 shadow-luxury rounded-card overflow-hidden flex group cursor-pointer"
            onClick={goToSkinAnalysis}
          >
            {/* Left side: Model photo with scanning SVG overlay */}
            <div className="w-28 sm:w-32 relative bg-beige/30 flex-shrink-0 overflow-hidden">
              <Image
                src="/Hero Banner Model.jpeg"
                alt="AI Skin Scanner"
                fill
                sizes="128px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-obsidian/10 transition-colors" />
              {/* Scan line animation */}
              <motion.div
                className="absolute inset-x-0 h-0.5 bg-gold/70 shadow-[0_0_8px_#C9A96E]"
                animate={{ top: ['8%', '92%', '8%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Face outline SVG */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="#C9A96E" strokeWidth="1.5" opacity="0.7">
                  <path d="M20 30 C20 30, 25 15, 50 15 C75 15, 80 30, 80 30 C80 30, 85 45, 80 65 C75 85, 50 90, 50 90 C50 90, 25 85, 20 65 C15 45, 20 30, 20 30 Z" />
                  <path d="M35 45 Q50 35 65 45" />
                  <path d="M40 65 Q50 72 60 65" />
                </svg>
              </div>
            </div>

            {/* Right side: Text */}
            <div className="flex-1 p-4 pr-7 flex flex-col justify-center">
              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-beige/40 text-taupe hover:text-obsidian transition-all"
                aria-label="Close banner"
              >
                <X size={14} />
              </button>

              <div className="inline-flex items-center gap-1 bg-gold/10 border border-gold/20 rounded-pill px-2.5 py-0.5 w-fit mb-2">
                <Sparkles size={9} className="text-gold animate-pulse" />
                <span className="text-gold text-[8px] font-body font-semibold tracking-wider uppercase">Free AI Analysis</span>
              </div>
              <h3 className="font-heading text-base text-obsidian leading-tight mb-1.5 font-medium">
                Know Your Skin Type — Free
              </h3>
              <p className="text-[10px] font-body text-taupe leading-relaxed mb-3">
                AI scan in 30 seconds. Personalized routine included.
              </p>
              <div className="btn-gold text-[10px] py-1.5 px-4 w-fit shadow-sm font-medium inline-flex items-center gap-1.5">
                Start Analysis
                <ArrowRight size={10} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Interactive AI Scanner Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-card overflow-hidden shadow-luxury border border-beige/60 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-beige/40 hover:bg-beige/80 text-charcoal hover:text-obsidian transition-colors z-20"
              >
                <X size={15} />
              </button>

              {/* Step 1: Intro */}
              {scanStep === 'intro' && (
                <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                  {/* Left Side cover */}
                  <div className="w-full md:w-5/12 bg-ivory relative h-48 md:h-auto min-h-[180px]">
                    <Image
                      src="/Hero Banner Model.jpeg"
                      alt="Skin Scan Guide"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-ivory">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold">Lanan Rituals</span>
                      <h4 className="font-heading text-lg font-light mt-0.5">Advanced Skin Diagnosis</h4>
                    </div>
                  </div>
                  {/* Right Side details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-gold">
                        <Sparkles size={16} />
                        <span className="text-xs uppercase font-body font-semibold tracking-wider">Lanan AI Diagnostics</span>
                      </div>
                      <h3 className="font-heading text-2xl text-obsidian font-light leading-tight">
                        Discover Your True Indian Skin Profile
                      </h3>
                      <p className="text-xs text-taupe font-body leading-relaxed">
                        Different environments and genetics require tailored solutions. Upload 4 different photos of your face to analyze sebum levels, pore depth, hydration, and UV pigmentation.
                      </p>
                      
                      <div className="space-y-2.5 pt-2">
                        {[
                          { title: 'Upload 4 angles', desc: 'Front, forehead, left cheek, and right cheek.' },
                          { title: 'Instant AI Evaluation', desc: 'Powered by advanced vision models.' },
                          { title: 'Tailored Skincare Routine', desc: 'Precise product recommendations matched to you.' }
                        ].map((item, i) => (
                          <div key={i} className="flex gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[10px] font-bold font-mono">
                              {i + 1}
                            </div>
                            <div>
                              <h5 className="text-xs font-body font-semibold text-charcoal">{item.title}</h5>
                              <p className="text-[10px] font-body text-taupe mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setScanStep('upload')}
                      className="btn-gold text-xs py-3 w-full justify-center mt-6"
                    >
                      Start Free Analysis
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Upload Grid */}
              {scanStep === 'upload' && (
                <div className="p-6 md:p-8 overflow-y-auto flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-heading text-2xl text-obsidian font-light text-center">Upload Face Angles</h3>
                    <p className="text-[11px] font-body text-taupe text-center mt-1">
                      Upload exactly 4 pictures showing the following facial regions.
                    </p>

                    {/* Upload Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {SCAN_ANGLES.map((angle) => {
                        const hasImg = !!images[angle.key];
                        return (
                          <div
                            key={angle.key}
                            onClick={() => !hasImg && triggerFileInput(angle.key)}
                            className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer overflow-hidden ${
                              hasImg
                                ? 'border-beige bg-white'
                                : 'border-dashed border-beige hover:border-gold hover:bg-ivory/40'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              capture="user"
                              ref={(el) => { fileInputRefs.current[angle.key] = el; }}
                              onChange={(e) => handleFileChange(angle.key, e)}
                              className="hidden"
                            />

                            {hasImg ? (
                              <>
                                <Image
                                  src={images[angle.key]}
                                  alt={angle.label}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-obsidian/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    onClick={(e) => removeImage(angle.key, e)}
                                    className="p-2.5 rounded-full bg-error-red text-white hover:scale-105 transition-transform"
                                    title="Remove photo"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-9 h-9 rounded-full bg-gold/5 border border-gold/15 flex items-center justify-center text-gold mb-2">
                                  <Camera size={16} />
                                </div>
                                <span className="text-xs font-body font-semibold text-charcoal">{angle.label}</span>
                                <span className="text-[9px] font-body text-taupe mt-0.5">{angle.desc}</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    {/* Progress details */}
                    <div className="flex justify-between items-center text-[10px] font-body text-taupe">
                      <span>Uploading Progress</span>
                      <span className="font-semibold text-gold">
                        {Object.keys(images).length} of 4 angles complete
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-beige/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-gold rounded-full transition-all duration-300"
                        style={{ width: `${(Object.keys(images).length / 4) * 100}%` }}
                      />
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={Object.keys(images).length < 4}
                      className="w-full btn-gold text-xs py-3 justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {Object.keys(images).length < 4 ? 'Upload all 4 photos to scan' : 'Analyze Skin Profile'}
                      {Object.keys(images).length === 4 && <Sparkles size={14} className="ml-1 animate-pulse" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Scanning */}
              {scanStep === 'scanning' && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                  <div className="w-28 h-28 rounded-full border-4 border-gold/15 relative flex items-center justify-center mb-6 overflow-hidden bg-beige/10">
                    <Image
                      src={images['front'] || '/Hero Banner Model.jpeg'}
                      alt="AI Face Scan"
                      fill
                      className="object-cover opacity-60"
                    />
                    {/* Glowing Scanning Bar */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-gold shadow-glow-gold top-0 animate-[scan_2.5s_infinite_linear]" />
                    <div className="absolute inset-0 border-2 border-gold/40 rounded-full animate-ping opacity-20" />
                  </div>
                  <h3 className="font-heading text-2xl text-obsidian">Analyzing Skin Profile</h3>
                  <p className="text-xs font-body text-taupe mt-1 max-w-xs">{loadingStatusText}</p>
                  
                  {/* Status checklist */}
                  <div className="w-full max-w-xs space-y-2.5 mt-6 text-left border-t border-beige/40 pt-4">
                    <div className="flex items-center gap-2 text-xs font-body text-charcoal">
                      <Loader2 size={12} className="animate-spin text-gold" />
                      <span>Calibrating facial vectors...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-body text-taupe">
                      <div className="w-2.5 h-2.5 rounded-full bg-beige/40" />
                      <span>Analyzing skin barrier health...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Results */}
              {scanStep === 'results' && analysisResult && (
                <div className="overflow-y-auto max-h-[90vh]">
                  {/* Header result */}
                  <div className="bg-ivory p-6 border-b border-beige/60 text-center relative">
                    <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold mx-auto mb-2.5 border border-gold/25">
                      <ShieldCheck size={22} />
                    </div>
                    <h3 className="font-heading text-2xl text-obsidian font-light">Analysis Complete!</h3>
                    <p className="text-xs font-body text-taupe mt-0.5">Here is your customized Indian skin report</p>
                    
                    {analysisResult.isMock && (
                      <span className="absolute top-4 left-4 text-[8px] bg-taupe/15 text-taupe font-mono px-2 py-0.5 rounded-full uppercase">
                        Demo Mode
                      </span>
                    )}
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    {/* Skin Type Box */}
                    <div className="bg-ivory/50 rounded-xl border border-beige/40 p-4">
                      <span className="text-[10px] font-body text-taupe uppercase tracking-wider block font-semibold">Overall Skin Type</span>
                      <h4 className="font-heading text-xl text-gold font-medium mt-1">
                        {analysisResult.skinType}
                      </h4>
                      <p className="text-xs font-body text-charcoal leading-relaxed mt-2">
                        {analysisResult.skinTypeDescription}
                      </p>
                    </div>

                    {/* Concerns Section */}
                    <div>
                      <h4 className="text-xs uppercase font-body font-bold text-obsidian tracking-wider mb-3">Skin Concerns Analysis</h4>
                      <div className="space-y-4">
                        {analysisResult.concerns?.map((concern: any, idx: number) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-body text-charcoal">
                              <span className="font-semibold">{concern.name}</span>
                              <span className="font-mono text-gold">{concern.severityPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-beige/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-gold rounded-full transition-all duration-1000"
                                style={{ width: `${concern.severityPercent}%` }}
                              />
                            </div>
                            <p className="text-[10px] font-body text-taupe leading-relaxed">{concern.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Routine Breakdown */}
                    <div className="border border-gold/20 rounded-xl p-4 bg-gold/5">
                      <h4 className="text-xs font-body font-semibold text-obsidian flex items-center gap-1.5">
                        <Award size={14} className="text-gold" />
                        AI Skin Routine Explanation
                      </h4>
                      <p className="text-[11px] font-body text-taupe leading-relaxed mt-1.5">
                        {analysisResult.routineExplanation}
                      </p>
                    </div>

                    {/* Recommended Products */}
                    {recommendedProducts.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase font-body font-bold text-obsidian tracking-wider mb-3">Recommended Products</h4>
                        <div className="space-y-3">
                          {recommendedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="flex gap-4 p-3 rounded-xl border border-beige/40 bg-white hover:shadow-card transition-all"
                            >
                              <div className="w-16 h-16 relative bg-ivory rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={prod.images[0]?.url || ''}
                                  alt={prod.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <h5 className="text-xs font-body font-semibold text-obsidian truncate">{prod.name}</h5>
                                  <p className="text-[10px] font-body text-taupe line-clamp-1 mt-0.5">{prod.tagline}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="font-mono text-xs font-semibold text-obsidian">
                                    ₹{prod.sale_price ?? prod.base_price}
                                  </span>
                                  <button
                                    onClick={() => handleAddToCart(prod)}
                                    className="btn-gold text-[9px] py-1 px-3"
                                  >
                                    Add to Cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coupon Box */}
                    <div className="bg-obsidian rounded-xl p-4 text-center text-ivory">
                      <p className="text-[10px] font-body text-gold uppercase tracking-widest font-semibold">Special AI Reward</p>
                      <h4 className="font-heading text-lg text-ivory font-light mt-1.5">Get 15% Off Your Routine</h4>
                      <div className="my-3 py-2.5 px-4 rounded-lg bg-white/10 border border-white/15 border-dashed flex items-center justify-between">
                        <span className="font-mono text-sm tracking-wider font-semibold text-gold">LANANAI</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('LANANAI');
                            toast.success('Coupon code copied to clipboard!');
                          }}
                          className="text-[9px] font-body text-gold uppercase hover:underline cursor-pointer"
                        >
                          Copy Code
                        </button>
                      </div>
                      <Link
                        href="/shop"
                        onClick={() => setModalOpen(false)}
                        className="btn-gold w-full text-xs py-2.5 justify-center mt-1"
                      >
                        Shop All Recommended Products
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Error View */}
              {scanStep === 'error' && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-error-red/10 flex items-center justify-center text-error-red mb-4">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="font-heading text-xl text-obsidian mb-2">Scan Failed</h3>
                  <p className="text-xs font-body text-taupe max-w-xs mb-6 leading-relaxed">
                    {errorMessage}
                  </p>
                  <div className="flex gap-3 w-full max-w-xs">
                    <button
                      onClick={() => setScanStep('upload')}
                      className="btn-gold text-xs py-2.5 flex-1 justify-center"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="border border-beige hover:bg-ivory/50 rounded-pill text-xs py-2.5 flex-1 text-center font-body text-charcoal font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
        }
      `}</style>
    </>
  );
}
