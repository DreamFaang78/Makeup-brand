'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Plus, Edit2, Trash2, X, AlertTriangle, Check, Filter,
  ArrowUpDown, Image as ImageIcon, Eye
} from 'lucide-react';
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
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
  const [formImageUrl, setFormImageUrl] = useState('/Serum Bottle.jpeg');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(search.toLowerCase()));
    
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
    setFormImageUrl('/Serum Bottle.jpeg');
    setEditingProduct(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormTagline(p.tagline || '');
    setFormCategory(p.category?.name || 'Serums');
    setFormPrice(p.base_price.toString());
    setFormSalePrice(p.sale_price ? p.sale_price.toString() : '');
    setFormInventory(p.variants[0]?.inventory.toString() || '0');
    setFormSku(p.variants[0]?.sku || '');
    setFormImageUrl(p.images[0]?.url || '/Serum Bottle.jpeg');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    const basePriceNum = parseFloat(formPrice);
    const salePriceNum = formSalePrice ? parseFloat(formSalePrice) : null;
    const invNum = parseInt(formInventory) || 0;

    if (editingProduct) {
      // Edit
      setProducts(prev =>
        prev.map(p => {
          if (p.id === editingProduct.id) {
            return {
              ...p,
              name: formName,
              tagline: formTagline,
              base_price: basePriceNum,
              sale_price: salePriceNum,
              category: p.category
                ? { ...p.category, name: formCategory }
                : { id: `cat-${p.id}`, name: formCategory, slug: formCategory.toLowerCase(), description: '', image_url: '', sort_order: 0, is_active: true },
              images: [{ ...p.images[0], url: formImageUrl }],
              variants: [
                {
                  ...p.variants[0],
                  price: salePriceNum || basePriceNum,
                  sku: formSku || p.variants[0]?.sku,
                  inventory: invNum,
                },
                ...p.variants.slice(1),
              ],
            };
          }
          return p;
        })
      );
    } else {
      // Add new
      const newId = (products.length + 1).toString();
      const slug = formName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const newProduct: any = {
        id: newId,
        name: formName,
        slug,
        tagline: formTagline,
        base_price: basePriceNum,
        sale_price: salePriceNum,
        rating_avg: 5.0,
        rating_count: 1,
        is_bestseller: false,
        skin_types: ['all'],
        skin_concerns: ['brightening'],
        images: [
          {
            id: `img-${newId}`,
            url: formImageUrl,
            alt_text: formName,
            sort_order: 0,
            is_video: false,
          },
        ],
        variants: [
          {
            id: `v-${newId}`,
            product_id: newId,
            name: 'Standard',
            sku: formSku || `LAN-${slug.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
            price: salePriceNum || basePriceNum,
            sale_price: null,
            inventory: invNum,
            is_active: true,
            sort_order: 0,
          },
        ],
        category: {
          id: `cat-${newId}`,
          name: formCategory,
          slug: formCategory.toLowerCase(),
          description: '',
          image_url: '',
          sort_order: 0,
          is_active: true,
        },
      };
      setProducts([newProduct, ...products]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleProductActive = (id: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const firstVariant = p.variants[0];
          if (firstVariant) {
            return {
              ...p,
              variants: [
                { ...firstVariant, is_active: !firstVariant.is_active },
                ...p.variants.slice(1),
              ],
            };
          }
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-obsidian">Products Catalog</h1>
          <p className="text-xs font-body text-taupe mt-0.5">
            Manage your catalog inventory, categories, pricing, and stock levels.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-gold text-xs py-2.5 px-5 self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Product
        </button>
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
            All Categories
          </button>
          {DEMO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-gold/20 text-gold font-medium'
                  : 'bg-ivory/50 text-taupe hover:bg-ivory'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl shadow-card border border-beige/50 overflow-hidden">
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
                  const minInv = Math.min(...p.variants.map((v) => v.inventory));
                  const isActive = p.variants[0]?.is_active ?? true;
                  const firstImage = p.images[0]?.url || '/Serum Bottle.jpeg';
                  
                  return (
                    <motion.tr
                      layout
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-ivory/20 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-beige/60 bg-ivory flex items-center justify-center relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={firstImage}
                            alt={p.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-5 font-medium text-obsidian">
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-taupe line-clamp-1">{p.tagline}</p>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-mono text-[11px] text-obsidian">
                        {p.variants[0]?.sku || 'N/A'}
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
                              ? 'bg-error-red/10 text-error-red'
                              : minInv <= 25
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-50 text-success-green'
                          }`}
                        >
                          {minInv} left
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => toggleProductActive(p.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                            isActive
                              ? 'bg-success-green/10 text-success-green border-success-green/20'
                              : 'bg-charcoal/10 text-charcoal/60 border-charcoal/10'
                          }`}
                        >
                          {isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-taupe hover:bg-gold/10 hover:text-gold transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-taupe hover:bg-error-red/10 hover:text-error-red transition-colors"
                          >
                            <Trash2 size={13} />
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
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 px-4 text-taupe">
            <Package size={28} className="mx-auto mb-2 opacity-40 text-taupe" />
            <p className="text-sm font-semibold">No products found</p>
            <p className="text-xs">Try adjusting your filters or search queries.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-luxury max-w-lg w-full overflow-hidden border border-beige/60"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-beige/60">
                <h3 className="font-body font-semibold text-sm text-obsidian flex items-center gap-1.5">
                  <Package size={15} className="text-gold" />
                  {editingProduct ? 'Edit Product Details' : 'Add New Skincare Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-taupe hover:bg-ivory transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Radiance Revival Serum"
                    className="input-luxury text-xs py-2"
                  />
                </div>

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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Base Price (₹)</label>
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
                      placeholder="e.g. 799 (Optional)"
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

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-taupe">Demo Product Image URL</label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="input-luxury text-xs py-2 font-mono text-[10px]"
                  />
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['/Serum Bottle.jpeg', '/Moisturiser Tube.jpeg', '/Saffron Face Mask.jpeg', '/Sunscreen.jpeg', '/website product cards..jpeg'].map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setFormImageUrl(url)}
                        className={`text-[9px] px-2 py-1 rounded border ${
                          formImageUrl === url
                            ? 'border-gold bg-gold/10 text-gold font-medium'
                            : 'border-beige text-taupe bg-ivory/50 hover:bg-ivory'
                        }`}
                      >
                        {url.split('/').pop()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-beige/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-beige/60 text-taupe text-xs rounded-full hover:bg-ivory transition-all font-body font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold text-xs py-2 px-5 font-semibold"
                  >
                    Save Product
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
