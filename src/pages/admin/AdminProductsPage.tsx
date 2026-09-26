import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Upload, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Check, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  DollarSign,
  Layers,
  Ruler,
  AlertCircle
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import type { Product, ProductCategory } from '../../types';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';

export const AdminProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('oxfords');
  const [formPriceNGN, setFormPriceNGN] = useState<number>(245000);
  const [formPriceUSD, setFormPriceUSD] = useState<number>(320);
  const [formImage, setFormImage] = useState<string>('/images/hero-bespoke-oxford.jpg');
  const [formDescription, setFormDescription] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formUpper, setFormUpper] = useState('Grade-A French Box Calfskin');
  const [formSole, setFormSole] = useState('Oak bark vegetable-tanned leather sole');
  const [formConstruction, setFormConstruction] = useState('Goodyear Hand-Welted');
  const [formLeadTime, setFormLeadTime] = useState('3 to 4 weeks for handcrafted production');
  const [formFeatured, setFormFeatured] = useState(true);
  const [formSizes, setFormSizes] = useState<number[]>([39, 40, 41, 42, 43, 44, 45, 46, 47]);

  // Check if opened with action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateModal();
    }
  }, [searchParams]);

  const presetPhotos = [
    { url: '/images/hero-bespoke-oxford.jpg', name: 'Sovereign Oxford' },
    { url: '/images/product-tassel-loafer.jpg', name: 'Èkó Tassel Loafer' },
    { url: '/images/product-monkstrap-espresso.jpg', name: 'Ikoyi Double Monk' },
    { url: '/images/product-chelsea-boot.jpg', name: 'Savannah Chelsea Boot' },
    { url: '/images/product-bespoke-sandal.jpg', name: 'Àbíkẹ́ Artisan Sandal' },
    { url: '/images/craft-workshop-lasts.jpg', name: 'Bespoke Atelier Lasts' }
  ];

  const allAvailableSizes = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormTagline('');
    setFormCategory('oxfords');
    setFormPriceNGN(245000);
    setFormPriceUSD(320);
    setFormImage('/images/hero-bespoke-oxford.jpg');
    setFormDescription('Sculpted from prime full-grain leather, hand-lasted over custom wooden formers in Lagos.');
    setFormStory('Designed for discerning patrons who demand uncompromised craft and comfort.');
    setFormUpper('Grade-A French Box Calfskin');
    setFormSole('Oak bark vegetable-tanned leather sole');
    setFormConstruction('Goodyear Hand-Welted with hidden channel');
    setFormLeadTime('3 to 4 weeks for handcrafted production');
    setFormFeatured(true);
    setFormSizes([39, 40, 41, 42, 43, 44, 45, 46, 47]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormTagline(product.tagline);
    setFormCategory(product.category);
    setFormPriceNGN(product.priceNGN);
    setFormPriceUSD(product.priceUSD);
    setFormImage(product.primaryImage);
    setFormDescription(product.description);
    setFormStory(product.story);
    setFormUpper(product.materials.upper);
    setFormSole(product.materials.sole);
    setFormConstruction(product.materials.construction);
    setFormLeadTime(product.standardLeadTime);
    setFormFeatured(product.isFeatured || false);
    setFormSizes(product.sizesAvailable || [39, 40, 41, 42, 43, 44, 45, 46]);
    setIsModalOpen(true);
  };

  // Handle local image file upload (converts to base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceNGNChange = (val: number) => {
    setFormPriceNGN(val);
    setFormPriceUSD(Math.round(val / 760));
  };

  const toggleSize = (size: number) => {
    if (formSizes.includes(size)) {
      setFormSizes(formSizes.filter(s => s !== size));
    } else {
      setFormSizes([...formSizes, size].sort((a, b) => a - b));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formImage) {
      alert('Please provide product name and image.');
      return;
    }

    if (editingProduct) {
      // Update existing
      updateProduct(editingProduct.id, {
        name: formName,
        tagline: formTagline,
        category: formCategory,
        categoryLabel: formCategory.toUpperCase(),
        priceNGN: formPriceNGN,
        priceUSD: formPriceUSD,
        primaryImage: formImage,
        description: formDescription,
        story: formStory,
        materials: {
          upper: formUpper,
          lining: 'Drum-dyed buttery soft calf lining',
          sole: formSole,
          construction: formConstruction,
          finishing: 'Hand-burnished organic wax patina'
        },
        sizesAvailable: formSizes,
        standardLeadTime: formLeadTime,
        isFeatured: formFeatured
      });
      showToast(`Updated "${formName}" successfully!`);
    } else {
      // Create new
      addProduct({
        name: formName,
        tagline: formTagline,
        category: formCategory,
        categoryLabel: formCategory.toUpperCase(),
        priceNGN: formPriceNGN,
        priceUSD: formPriceUSD,
        primaryImage: formImage,
        description: formDescription,
        story: formStory,
        materials: {
          upper: formUpper,
          lining: 'Drum-dyed buttery soft calf lining',
          sole: formSole,
          construction: formConstruction,
          finishing: 'Hand-burnished organic wax patina'
        },
        sizesAvailable: formSizes,
        standardLeadTime: formLeadTime,
        isFeatured: formFeatured
      });
      showToast(`Published "${formName}" to live store!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the store catalog?`)) {
      deleteProduct(id);
      showToast(`Removed "${name}" from catalog.`);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered list
  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs rounded shadow-2xl flex items-center gap-2 font-mono">
          <Check size={16} strokeWidth={3} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CBB8]/15">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            Atelier Products Management
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
            Footwear Catalog & Self-Upload
          </h1>
          <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
            Add new creations, upload photographs, set pricing, and modify specifications visible to patrons.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase hover:bg-[#D4BD86] transition-colors shadow-lg shadow-[#B89B5E]/10"
        >
          <PlusCircle size={16} />
          <span>Upload New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121212] p-4 border border-[#D8CBB8]/15">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search footwear by title, leather..."
            className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'oxfords', 'loafers', 'boots', 'sandals', 'custom'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                  : 'bg-[#181818] text-[#D8CBB8]/70 hover:text-[#F5F1E8] border border-[#D8CBB8]/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D8CBB8]/15 bg-[#161616] text-[#D8CBB8]/50 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Silhouette</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (NGN / USD)</th>
                <th className="py-3 px-4">Available Sizes</th>
                <th className="py-3 px-4">Status / Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8CBB8]/10 text-xs">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#161616] transition-colors">
                  {/* Silhouette & Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-black rounded overflow-hidden border border-[#D8CBB8]/15 shrink-0">
                        <img
                          src={prod.primaryImage}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif text-sm text-[#F5F1E8] font-medium block truncate">
                          {prod.name}
                        </span>
                        <span className="text-[11px] text-[#D8CBB8]/50 block truncate max-w-xs">
                          {prod.tagline}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-[#D8CBB8]/80 uppercase font-mono text-[11px]">
                    {prod.category}
                  </td>

                  {/* Pricing */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-medium text-[#F5F1E8]">
                      {formatCurrencyNGN(prod.priceNGN)}
                    </div>
                    <div className="text-[10px] text-[#B89B5E] font-mono">
                      ≈ {formatCurrencyUSD(prod.priceUSD)} USD
                    </div>
                  </td>

                  {/* Sizes */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#D8CBB8]/70">
                    EU {prod.sizesAvailable?.[0]} - {prod.sizesAvailable?.[prod.sizesAvailable.length - 1]}
                  </td>

                  {/* Status / Featured */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#181818] border border-[#D8CBB8]/20 text-[#D8CBB8] inline-block w-max">
                        {prod.status}
                      </span>
                      {prod.isFeatured && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-[#B89B5E]/20 text-[#B89B5E] inline-block w-max">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/product/${prod.slug}`}
                        target="_blank"
                        title="View Live on Storefront"
                        className="p-1.5 text-[#D8CBB8]/60 hover:text-[#B89B5E] hover:bg-[#181818] rounded transition-colors"
                      >
                        <Eye size={15} />
                      </Link>

                      <button
                        onClick={() => openEditModal(prod)}
                        title="Edit Product"
                        className="p-1.5 text-[#D8CBB8]/60 hover:text-[#B89B5E] hover:bg-[#181818] rounded transition-colors"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        title="Delete Product"
                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#121212] border border-[#B89B5E]/40 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8CBB8]/15">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] font-mono">
                  {editingProduct ? 'Update Footwear' : 'Atelier Upload'}
                </span>
                <h2 className="font-serif text-2xl text-[#F5F1E8]">
                  {editingProduct ? `Edit "${editingProduct.name}"` : 'Upload New Bespoke Footwear'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#D8CBB8]/60 hover:text-[#F5F1E8]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
              
              {/* Product Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. The Victoria Wholecut"
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Tagline / One-Liner *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. French box calfskin with hand-burnished glacage."
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono uppercase"
                  >
                    <option value="oxfords">Oxfords</option>
                    <option value="loafers">Loafers</option>
                    <option value="boots">Boots</option>
                    <option value="sandals">Sandals</option>
                    <option value="custom">Custom / Bespoke</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Price in Naira (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="5000"
                    value={formPriceNGN}
                    onChange={(e) => handlePriceNGNChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Price in USD ($)
                  </label>
                  <input
                    type="number"
                    value={formPriceUSD}
                    onChange={(e) => setFormPriceUSD(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD & PRESETS */}
              <div className="space-y-3 bg-[#161616] p-4 border border-[#D8CBB8]/15 rounded">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold flex items-center gap-1.5">
                    <ImageIcon size={14} />
                    <span>Product Photography *</span>
                  </label>
                  <span className="text-[10px] text-[#D8CBB8]/50">
                    Upload from computer or paste URL
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Image Preview Box */}
                  <div className="md:col-span-4 h-36 bg-black border border-[#D8CBB8]/20 rounded overflow-hidden flex items-center justify-center relative group">
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-[#D8CBB8]/40">No Image</span>
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[9px] font-mono text-[#B89B5E]">
                      Live Preview
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="md:col-span-8 space-y-3">
                    {/* File Picker */}
                    <div>
                      <label className="flex items-center gap-2 px-3 py-2 bg-[#202020] hover:bg-[#282828] border border-[#D8CBB8]/30 rounded cursor-pointer transition-colors text-xs text-[#F5F1E8]">
                        <Upload size={14} className="text-[#B89B5E]" />
                        <span>Choose Photo from Device...</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image URL Input */}
                    <div>
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="Or enter image web URL / path..."
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
                      />
                    </div>

                    {/* Preset Picker */}
                    <div>
                      <span className="text-[10px] text-[#D8CBB8]/50 block mb-1 font-mono">
                        Quick Atelier Presets:
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {presetPhotos.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setFormImage(preset.url)}
                            className={`px-2 py-1 rounded text-[10px] font-mono truncate max-w-xs border ${
                              formImage === preset.url
                                ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold border-[#B89B5E]'
                                : 'bg-[#181818] text-[#D8CBB8]/60 border-[#D8CBB8]/15 hover:text-[#F5F1E8]'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Story */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1 font-mono">
                    Crafting Story & Provenance
                  </label>
                  <textarea
                    rows={2}
                    value={formStory}
                    onChange={(e) => setFormStory(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>
              </div>

              {/* Leather Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                    Upper Leather
                  </label>
                  <input
                    type="text"
                    value={formUpper}
                    onChange={(e) => setFormUpper(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                    Sole Type
                  </label>
                  <input
                    type="text"
                    value={formSole}
                    onChange={(e) => setFormSole(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                    Welt Construction
                  </label>
                  <input
                    type="text"
                    value={formConstruction}
                    onChange={(e) => setFormConstruction(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8]"
                  />
                </div>
              </div>

              {/* Available Sizes Checkbox Pills */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/80 mb-1.5 font-mono">
                  Available EU Sizes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allAvailableSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                        formSizes.includes(s)
                          ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold border-[#B89B5E]'
                          : 'bg-[#181818] text-[#D8CBB8]/50 border-[#D8CBB8]/20 hover:border-[#D8CBB8]/40'
                      }`}
                    >
                      EU {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#B89B5E]"
                />
                <label htmlFor="featuredToggle" className="text-xs text-[#F5F1E8] cursor-pointer">
                  Feature this product on homepage and main showcase
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#D8CBB8]/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#D8CBB8]/20 text-[#D8CBB8] text-xs uppercase tracking-wider hover:bg-[#181818]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-widest hover:bg-[#D4BD86] transition-colors shadow-lg"
                >
                  {editingProduct ? 'Save Product Changes' : 'Publish Product to Website'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
