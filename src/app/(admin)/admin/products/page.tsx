'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Plus, Edit2, Trash2, X, AlertTriangle, Check, Filter,
  RefreshCw, Loader2, UploadCloud, ImagePlus, Star, Link as LinkIcon, Sparkles,
  Database
} from 'lucide-react';
import { DEMO_CATEGORIES } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState('Serums');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formInventory, setFormInventory] = useState('50');
  const [formSku, setFormSku] = useState('');

  // Multi-image upload state
  const [formImages, setFormImages] = useState<string[]>(['/lanan-face-wash.jpeg']);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real list of image files from /public
  useEffect(() => {
    fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.files)) {
          setMediaFiles(data.files);
        }
      })
      .catch((err) => console.warn('Could not load public media files:', err));
  }, []);

  // Clear notice after 4 seconds
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  // Fetch live products from Supabase API
  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();

      if (data.success && Array.isArray(data.products)) {
        // Accurately reflect whatever is in Supabase (even if empty!)
        setProducts(data.products);
      } else {
        console.warn('API returned error:', data.error);
        setNotice({ type: 'error', message: data.error || 'Failed to fetch products' });
      }
    } catch (err: any) {
      console.error('Failed to fetch products from Supabase:', err);
      setNotice({ type: 'error', message: 'Could not connect to database.' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Seed / Reset Starter Catalog
  const handleSeedCatalog = async () => {
    if (!confirm('Populate the 9 starter skincare products into your Supabase database?')) return;
    setIsSeeding(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to seed database');
      }

      setNotice({ type: 'success', message: '9 starter products seeded into Supabase!' });
      await fetchProducts();
    } catch (err: any) {
      console.error('Seeding error:', err);
      setNotice({ type: 'error', message: err.message || 'Seeding failed' });
    } finally {
      setIsSeeding(false);
    }
  };

  // Extract unique category names from loaded products + demo categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    DEMO_CATEGORIES.forEach(c => set.add(c.name));
    products.forEach(p => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [products]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.variants || []).some((v: any) => (v.sku || '').toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      (p.category?.name || '').toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormName('');
    setFormTagline('');
    setFormCategory('Serums');
    setFormPrice('');
    setFormSalePrice('');
    setFormInventory('50');
    setFormSku('');
    setFormImages(['/serum-bottle.jpeg']);
    setShowUrlInput(false);
    setCustomUrlInput('');
    setEditingProduct(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setFormName(p.name || '');
    setFormTagline(p.tagline || '');
    setFormCategory(p.category?.name || 'Serums');
    setFormPrice(p.base_price ? p.base_price.toString() : '');
    setFormSalePrice(p.sale_price ? p.sale_price.toString() : '');
    setFormInventory(p.variants?.[0]?.inventory?.toString() || '50');
    setFormSku(p.variants?.[0]?.sku || '');

    // Extract all image URLs from p.images
    const imgUrls = Array.isArray(p.images) && p.images.length > 0
      ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
      : [p.og_image_url || '/serum-bottle.jpeg'];

    setFormImages(imgUrls);
    setShowUrlInput(false);
    setCustomUrlInput('');
    setIsModalOpen(true);
  };

  // Client-side image compression to bypass Vercel 4.5MB serverless payload limit
  const compressImage = async (file: File, maxDim = 1920, quality = 0.85): Promise<File> => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                resolve(file);
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: outputType,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            outputType,
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Upload multiple files sequentially with automatic client-side compression
  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const fileArray = Array.from(files);
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Optimizing & uploading ${i + 1} of ${fileArray.length}...`);

        // Compress large camera/mobile images to ~300KB
        const optimizedFile = await compressImage(file);

        const formData = new FormData();
        formData.append('file', optimizedFile);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          let errMsg = `Upload failed (${res.status})`;
          try {
            const json = JSON.parse(text);
            errMsg = json.error || errMsg;
          } catch {
            if (res.status === 413) {
              errMsg = 'Image file too large for server limit.';
            } else if (text && text.length < 80) {
              errMsg = text;
            }
          }
          errors.push(`${file.name}: ${errMsg}`);
          continue;
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
          uploadedUrls.push(...data.urls);
        } else if (data.error) {
          errors.push(`${file.name}: ${data.error}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormImages((prev) => {
          const cleanPrev =
            prev.length === 1 && prev[0] === '/serum-bottle.jpeg' && !editingProduct
              ? []
              : prev;
          return [...cleanPrev, ...uploadedUrls];
        });

        setNotice({
          type: 'success',
          message: `Successfully uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} to Supabase Storage!`,
        });
      }

      if (errors.length > 0) {
        setNotice({
          type: 'error',
          message: `Some photos had issues: ${errors.join(', ')}`,
        });
      }
    } catch (err: any) {
      console.error('Error during photo upload:', err);
      setNotice({ type: 'error', message: err.message || 'Failed to upload photos' });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormImages(prev => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    setFormImages(prev => {
      const cleanPrev =
        prev.length === 1 && prev[0] === '/serum-bottle.jpeg' && !editingProduct
          ? []
          : prev;
      return [...cleanPrev, url];
    });
    setCustomUrlInput('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    setIsSaving(true);
    const basePriceNum = parseFloat(formPrice);
    const salePriceNum = formSalePrice ? parseFloat(formSalePrice) : null;
    const invNum = parseInt(formInventory, 10) || 50;

    const finalImages = formImages.length > 0 ? formImages : ['/serum-bottle.jpeg'];

    try {
      if (editingProduct) {
        // Edit existing product
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formName,
            tagline: formTagline,
            categoryName: formCategory,
            base_price: basePriceNum,
            sale_price: salePriceNum,
            inventory: invNum,
            sku: formSku,
            images: finalImages,
            image_url: finalImages[0],
          }),
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to update product in database');
        }

        // Update local state
        setProducts(prev =>
          prev.map(p => {
            if (p.id === editingProduct.id) {
              return {
                ...p,
                name: formName,
                tagline: formTagline,
                base_price: basePriceNum,
                sale_price: salePriceNum,
                category: { ...p.category, name: formCategory },
                images: finalImages.map((url, i) => ({
                  id: `img-${p.id}-${i}`,
                  url,
                  alt_text: formName,
                  sort_order: i,
                  is_video: false,
                })),
                variants: [
                  {
                    ...p.variants?.[0],
                    price: salePriceNum || basePriceNum,
                    sku: formSku || p.variants?.[0]?.sku,
                    inventory: invNum,
                  },
                  ...(p.variants?.slice(1) || []),
                ],
              };
            }
            return p;
          })
        );
        setNotice({ type: 'success', message: `"${formName}" updated successfully in Supabase!` });
      } else {
        // Add new product
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            tagline: formTagline,
            categoryName: formCategory,
            base_price: basePriceNum,
            sale_price: salePriceNum,
            inventory: invNum,
            sku: formSku,
            images: finalImages,
            image_url: finalImages[0],
          }),
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Failed to add product to database');
        }

        if (result.product) {
          setProducts(prev => [result.product, ...prev]);
        } else {
          await fetchProducts();
        }
        setNotice({ type: 'success', message: `"${formName}" added successfully to Supabase!` });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setNotice({ type: 'error', message: err.message || 'Error saving product' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product permanently from Supabase
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from Supabase?`)) {
      return;
    }

    // Check if UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      // Non-UUID mock product: immediately remove from view
      setProducts(prev => prev.filter(p => p.id !== id));
      setNotice({
        type: 'success',
        message: `"${name}" removed from view.`,
      });
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product from Supabase');
      }

      // Remove from client state immediately
      setProducts(prev => prev.filter(p => p.id !== id));
      setNotice({
        type: 'success',
        message: `"${name}" permanently deleted from Supabase.`,
      });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setNotice({
        type: 'error',
        message: err.message || 'Could not delete product from database.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleProductActive = async (id: string) => {
    const current = products.find(p => p.id === id);
    if (!current) return;
    const isCurrentlyActive = current.variants?.[0]?.is_active ?? (current.status !== 'draft');
    const newActiveState = !isCurrentlyActive;

    // Optimistically update
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const firstVariant = p.variants?.[0] || {};
          return {
            ...p,
            status: newActiveState ? 'active' : 'draft',
            variants: [
              { ...firstVariant, is_active: newActiveState },
              ...(p.variants?.slice(1) || []),
            ],
          };
        }
        return p;
      })
    );

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: newActiveState,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Failed to update product status:', err);
      fetchProducts();
      setNotice({ type: 'error', message: 'Failed to update product status in database.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-body shadow-sm ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium">{notice.message}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-taupe hover:text-obsidian p-1 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl text-obsidian">Products Catalog</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Live
            </span>
          </div>
          <p className="text-xs font-body text-taupe mt-0.5">
            Manage your catalog inventory, pricing, status, and multi-photo assets in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchProducts(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh Catalog from Supabase"
            className="p-2.5 rounded-xl border border-beige/60 bg-white hover:bg-ivory text-taupe hover:text-obsidian transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-gold' : ''} />
            <span className="hidden md:inline text-[11px] font-medium">Sync DB</span>
          </button>

          {products.length === 0 && (
            <button
              onClick={handleSeedCatalog}
              disabled={isSeeding}
              className="px-3 py-2 border border-gold/40 text-gold hover:bg-gold/10 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSeeding ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Seed Demo Data</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="btn-gold text-xs py-2.5 px-5 flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-card border border-beige/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-taupe/60">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury text-xs pl-9 pr-4 py-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-taupe font-body flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
              selectedCategory === 'all'
                ? 'bg-gold/20 text-gold font-medium'
                : 'bg-ivory/50 text-taupe hover:bg-ivory'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categoriesList.map((catName) => (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
                selectedCategory.toLowerCase() === catName.toLowerCase()
                  ? 'bg-gold/20 text-gold font-medium'
                  : 'bg-ivory/50 text-taupe hover:bg-ivory'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl shadow-card border border-beige/50 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border border-beige/60">
              <Loader2 size={16} className="animate-spin text-gold" />
              <span className="text-xs font-medium text-obsidian font-body">Loading products from Supabase...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-body">
            <thead>
              <tr className="bg-ivory/50 text-taupe border-b border-beige/60">
                <th className="py-3 px-5 font-semibold">Image</th>
                <th className="py-3 px-5 font-semibold">Product Name</th>
                <th className="py-3 px-5 font-semibold">SKU</th>
                <th className="py-3 px-5 font-semibold">Category</th>
                <th className="py-3 px-5 font-semibold">Price</th>
                <th className="py-3 px-5 font-semibold text-center">Stock</th>
                <th className="py-3 px-5 font-semibold text-center">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/30">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p) => {
                  const variants = p.variants || [];
                  const minInv = variants.length > 0
                    ? Math.min(...variants.map((v: any) => v.inventory ?? 0))
                    : 0;
                  const isActive = variants[0]?.is_active ?? (p.status !== 'draft');
                  const firstImage = p.images?.[0]?.url || p.og_image_url || '/serum-bottle.jpeg';
                  const isCurrentDeleting = deletingId === p.id;
                  const photoCount = p.images?.length || 1;

                  return (
                    <motion.tr
                      layout
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isCurrentDeleting ? 0.4 : 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="hover:bg-ivory/20 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-beige/60 bg-ivory flex items-center justify-center relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={firstImage}
                            alt={p.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {photoCount > 1 && (
                            <span className="absolute bottom-0 right-0 bg-obsidian/75 text-[8px] text-white px-1 font-mono rounded-tl">
                              +{photoCount - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-5 font-medium text-obsidian">
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-taupe line-clamp-1">{p.tagline}</p>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-mono text-[11px] text-obsidian">
                        {variants[0]?.sku || 'N/A'}
                      </td>
                      <td className="py-3 px-5 text-taupe">{p.category?.name || 'Uncategorized'}</td>
                      <td className="py-3 px-5 font-semibold font-mono text-obsidian">
                        {p.sale_price ? (
                          <div className="flex flex-col">
                            <span className="text-obsidian">{formatPrice(p.sale_price)}</span>
                            <span className="text-[10px] text-taupe line-through font-normal">{formatPrice(p.base_price)}</span>
                          </div>
                        ) : (
                          formatPrice(p.base_price)
                        )}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            minInv <= 5
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : minInv <= 25
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {minInv} left
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => toggleProductActive(p.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product & Photos"
                            className="p-1.5 rounded-lg text-taupe hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            disabled={isCurrentDeleting}
                            title="Delete Product from Supabase"
                            className="p-1.5 rounded-lg text-taupe hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {isCurrentDeleting ? (
                              <Loader2 size={13} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State when 0 products in Supabase */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16 px-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-3">
              <Package size={24} />
            </div>
            <h3 className="font-heading text-base text-obsidian font-semibold">
              {products.length === 0 ? 'Catalog is Empty (0 Products)' : 'No matching products found'}
            </h3>
            <p className="text-xs text-taupe mt-1 mb-5 font-body">
              {products.length === 0
                ? 'All products have been deleted from your Supabase database. You can add a new skincare product or restore the starter demo catalog.'
                : 'Try clearing your search query or category filters.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={handleOpenAddModal} className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5">
                <Plus size={14} /> Add Product
              </button>
              {products.length === 0 && (
                <button
                  onClick={handleSeedCatalog}
                  disabled={isSeeding}
                  className="px-4 py-2 border border-gold/40 text-gold hover:bg-gold/10 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSeeding ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  Restore Demo Catalog
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal with Multi-Photo Uploader */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && !isUploading && setIsModalOpen(false)}
              className="absolute inset-0 bg-obsidian/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-luxury max-w-xl w-full overflow-hidden border border-beige/60"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-beige/60 bg-ivory/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <Package size={15} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm text-obsidian font-semibold">
                      {editingProduct ? 'Edit Product Details' : 'Add New Skincare Product'}
                    </h3>
                    <p className="text-[10px] text-taupe font-body">Directly synced to Supabase database & storage</p>
                  </div>
                </div>
                <button
                  onClick={() => !isSaving && !isUploading && setIsModalOpen(false)}
                  className="p-1 rounded-lg text-taupe hover:bg-ivory transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                {/* Product Name + Live Image Preview */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-ivory/40 border border-beige/60">
                  <div className="relative w-14 h-14 rounded-xl border border-gold/40 bg-ivory overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                    {formImages[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={formImages[0]}
                        alt="Selected cover preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-[8px] text-taupe font-mono text-center">No Photo</span>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-obsidian/85 text-[7px] text-gold text-center py-0.5 font-bold uppercase tracking-wider">
                      Cover
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. LANAN Face Wash – 100 ml"
                      className="input-luxury text-xs py-2 bg-white"
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Tagline / Key Benefit</label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Brightening & Glow-Boosting Daily Serum"
                    className="input-luxury text-xs py-2"
                  />
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="input-luxury text-xs py-2"
                    >
                      <option>Serums</option>
                      <option>Moisturisers</option>
                      <option>Cleansers</option>
                      <option>Sunscreen</option>
                      <option>Masks</option>
                      <option>Eye Care</option>
                      <option>Toners</option>
                      <option>Lip Care</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">SKU Code</label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. RRS-30"
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Base Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="999"
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Sale Price (₹)</label>
                    <input
                      type="number"
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(e.target.value)}
                      placeholder="e.g. 799"
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Stock Inventory</label>
                    <input
                      type="number"
                      required
                      value={formInventory}
                      onChange={(e) => setFormInventory(e.target.value)}
                      placeholder="50"
                      className="input-luxury text-xs py-2"
                    />
                  </div>
                </div>

                {/* ─── UPLOAD PRODUCT PHOTOS IN ONE GO ─── */}
                <div className="pt-2 border-t border-beige/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-obsidian flex items-center gap-1.5">
                        <ImagePlus size={14} className="text-gold" />
                        Product Photos (Upload in One Go)
                      </label>
                      <p className="text-[10px] text-taupe font-body">
                        {formImages.length} photo{formImages.length === 1 ? '' : 's'} added · The first photo will be the main storefront cover.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[10px] text-gold hover:underline flex items-center gap-1 font-medium"
                    >
                      <LinkIcon size={11} />
                      {showUrlInput ? 'Hide Link Box' : 'Add via Link'}
                    </button>
                  </div>

                  {/* Hidden multi-file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelected(e.target.files);
                    }}
                  />

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                      isDragOver
                        ? 'border-gold bg-gold/10 scale-[1.01]'
                        : 'border-beige/80 hover:border-gold/60 bg-ivory/30 hover:bg-gold/5'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center py-2 gap-2 text-obsidian">
                        <Loader2 size={24} className="animate-spin text-gold" />
                        <span className="text-xs font-semibold">
                          {uploadProgress || 'Uploading photos to Supabase Storage...'}
                        </span>
                        <span className="text-[10px] text-taupe">Auto-optimizing & storing high-resolution product media</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center shadow-xs">
                          <UploadCloud size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-obsidian">
                            Click to browse or drag & drop multiple photos in one go
                          </p>
                          <p className="text-[10px] text-taupe mt-0.5">
                            PNG, JPG, WEBP up to 10MB each (Batch uploads supported)
                          </p>
                        </div>
                        <span className="btn-gold text-[10px] py-1 px-3 mt-1 pointer-events-none">
                          Browse Media Files
                        </span>
                      </>
                    )}
                  </div>

                  {/* Uploaded Photos Gallery Preview */}
                  {formImages.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-taupe font-body">
                        <span>Uploaded Gallery Preview:</span>
                        <span>Click ★ to set Main Cover</span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                        {formImages.map((url, idx) => {
                          const isPrimary = idx === 0;
                          return (
                            <div
                              key={`${url}-${idx}`}
                              className={`relative group rounded-xl overflow-hidden border aspect-square bg-ivory flex items-center justify-center transition-all ${
                                isPrimary
                                  ? 'border-gold ring-2 ring-gold/30 shadow-sm'
                                  : 'border-beige/70 hover:border-gold/40'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Product photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />

                              {/* Index badge */}
                              <span className="absolute top-1 left-1 bg-obsidian/75 text-[8px] text-white px-1.5 py-0.5 rounded-full font-mono z-10">
                                #{idx + 1}
                              </span>

                              {/* Primary Cover Badge */}
                              {isPrimary && (
                                <span className="absolute bottom-1 left-1 right-1 bg-gold text-obsidian text-[8px] font-bold py-0.5 px-1 rounded text-center shadow-xs flex items-center justify-center gap-0.5 z-10">
                                  <Star size={8} fill="currentColor" /> Main Cover
                                </span>
                              )}

                              {/* Hover actions */}
                              <div className="absolute inset-0 bg-obsidian/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetPrimaryImage(idx);
                                    }}
                                    title="Set as Main Cover Photo"
                                    className="p-1 rounded bg-white text-gold hover:scale-110 transition-transform shadow-xs"
                                  >
                                    <Star size={11} fill="currentColor" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(idx);
                                  }}
                                  title="Delete Photo"
                                  className="p-1 rounded bg-white text-red-600 hover:scale-110 transition-transform shadow-xs"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Optional Custom URL or Preset selector */}
                  {showUrlInput && (
                    <div className="bg-ivory/50 p-3 rounded-xl border border-beige/60 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          placeholder="Paste image URL (e.g. https://... or /filename.jpeg)"
                          className="input-luxury text-xs py-1.5 flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomUrl}
                          className="px-3 py-1.5 bg-obsidian text-white text-[10px] rounded-lg font-medium hover:bg-obsidian/90 transition-colors"
                        >
                          Add URL
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-taupe font-semibold">Pick from Real /public Image Files:</span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-beige/40">
                          {(mediaFiles.length > 0
                            ? mediaFiles
                            : [
                                '/lanan-face-wash.jpeg',
                                '/lanan-face-moisturizer.jpeg',
                                '/lanan-sunscreen-spf-50.jpeg',
                                '/lanan-glutathione-face-toner.jpeg',
                                '/lanan-glutathione-face-serum.jpeg',
                                '/serum-bottle.jpeg',
                                '/moisturiser-tube.jpeg',
                                '/sunscreen.jpeg',
                                '/saffron-face-mask.jpeg',
                                '/website-product-cards.jpeg',
                                '/product-in-hand.jpeg',
                                '/bathroom-shelf-mockup.jpeg',
                              ]
                          ).map((url) => {
                            const isSelected = formImages.includes(url);
                            return (
                              <button
                                key={url}
                                type="button"
                                onClick={() => {
                                  setFormImages((prev) => {
                                    if (prev.includes(url)) {
                                      return prev.filter((u) => u !== url);
                                    }
                                    const clean =
                                      prev.length === 1 && (prev[0] === '/serum-bottle.jpeg' || prev[0] === '/lanan-face-wash.jpeg') && !editingProduct
                                        ? []
                                        : prev;
                                    return [...clean, url];
                                  });
                                }}
                                className={`text-[9px] px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                                  isSelected
                                    ? 'border-gold bg-gold/15 text-obsidian font-semibold'
                                    : 'border-beige text-taupe bg-ivory/40 hover:border-gold hover:text-gold'
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="w-3.5 h-3.5 object-contain rounded" />
                                {url.replace('/', '')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-beige/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSaving || isUploading}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-beige/60 text-taupe text-xs rounded-full hover:bg-ivory transition-all font-body font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="btn-gold text-xs py-2 px-5 font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 size={13} className="animate-spin" />}
                    {editingProduct ? 'Update in Supabase' : 'Save to Supabase'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
