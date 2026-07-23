import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Search, Filter, Check, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import { Product } from "../types";
import { products } from "../data";

interface ShopViewProps {
  onNavigateToProduct: (productId: string) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  selectedCategory: string;
  onSetCategory: (category: string) => void;
  filterSize: string;
  onSetSize: (size: string) => void;
  filterColor: string;
  onSetColor: (color: string) => void;
  filterFabric: string;
  onSetFabric: (fabric: string) => void;
}

export default function ShopView({
  onNavigateToProduct,
  wishlistIds,
  onToggleWishlist,
  selectedCategory,
  onSetCategory,
  filterSize,
  onSetSize,
  filterColor,
  onSetColor,
  filterFabric,
  onSetFabric,
}: ShopViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"size" | "color" | "fabric" | null>(null);
  const [heartAnim, setHeartAnim] = useState<string | null>(null);

  const sizesList = ["ALL", "XS", "S", "M", "L"];
  const colorsList = ["ALL", "MONO", "GOLD"];
  const fabricsList = ["ALL", "WOOL", "SILK", "COTTON", "LEATHER", "METAL"];
  const categories = ["ALL", "Dresses", "Outerwear", "Tailoring", "Accessories", "Footwear"];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "ALL" || p.categories.some((cat) => cat.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSize = filterSize === "ALL" || p.sizes.includes(filterSize);
      const matchesColor = filterColor === "ALL" || p.color.toUpperCase() === filterColor.toUpperCase();
      const matchesFabric = filterFabric === "ALL" || p.fabric.toUpperCase() === filterFabric.toUpperCase();
      const matchesSearch = searchQuery.trim() === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSize && matchesColor && matchesFabric && matchesSearch;
    });
  }, [selectedCategory, filterSize, filterColor, filterFabric, searchQuery]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const hasActiveFilters = filterSize !== "ALL" || filterColor !== "ALL" || filterFabric !== "ALL" || selectedCategory !== "ALL";

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setHeartAnim(product.id);
    setTimeout(() => setHeartAnim(null), 500);
    onToggleWishlist(product);
  };

  const toggleDropdown = (type: "size" | "color" | "fabric") => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const clearAllFilters = () => {
    onSetCategory("ALL");
    onSetSize("ALL");
    onSetColor("ALL");
    onSetFabric("ALL");
    setSearchQuery("");
  };

  return (
    <div className="pb-44 font-body max-w-7xl mx-auto px-6" id="shop-view">

      {/* ── Editorial Header ── */}
      <section className="mb-14 pt-6">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ duration: 0.6 }}
          className="font-label text-[9px] uppercase tracking-[0.4em] text-outline/50 mb-4"
        >
          Collection 004 / L'Essence
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="font-headline text-5xl sm:text-7xl max-w-2xl leading-[0.95] font-light select-none"
        >
          Quiet Elegance <br />
          <span className="italic text-primary/80">in Monochrome.</span>
        </motion.h2>
      </section>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-14 pb-6 border-b border-outline-variant/10">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 overflow-x-auto hide-scrollbar select-none">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onSetCategory(cat); setVisibleCount(6); }}
              className={`px-4 py-2 text-[10px] font-label uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? "text-on-primary border-primary"
                  : "bg-transparent text-outline/70 border-outline-variant/25 hover:border-primary/50 hover:text-primary"
              }`}
              id={`filter-pill-${cat.toLowerCase()}`}
              style={selectedCategory === cat ? {
                background: "linear-gradient(135deg, #a78bfa, #7c5ce1)",
                boxShadow: "0 0 16px rgba(167,139,250,0.3)",
              } : {}}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Search + Filter controls */}
        <div className="flex items-center gap-3">
          {/* Clear filters badge */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-label uppercase tracking-widest text-amber-400 border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear
              </motion.button>
            )}
          </AnimatePresence>

          {/* Search input */}
          <div className="relative group w-64">
            <Search className="w-3.5 h-3.5 text-outline/40 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search anthology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest/50 border border-outline-variant/20 py-2.5 pl-9 pr-4 text-[11px] font-label uppercase tracking-wider focus:outline-none focus:border-primary/50 focus:bg-surface-container-lowest placeholder:text-outline/30 transition-all"
              id="product-search-input"
            />
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      {visibleProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-28 text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
            <Search className="w-7 h-7 text-outline/30" />
          </div>
          <p className="font-headline text-2xl italic">No elements found</p>
          <p className="text-xs text-outline/50 tracking-wider max-w-sm mx-auto">
            Try resetting your active filters or clear search keywords to browse our full curation.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={clearAllFilters}
            className="px-10 py-4 font-label text-xs uppercase tracking-widest btn-luxury cursor-pointer"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
            id="reset-all-filters-btn"
          >
            Clear All Filters
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-20 md:gap-x-10 select-none">
          {visibleProducts.map((product, idx) => {
            const isFav = wishlistIds.includes(product.id);

            let colSpanClass = "md:col-span-6";
            let aspectClass = "aspect-[4/5]";

            if (idx % 6 === 0) { colSpanClass = "md:col-span-7"; aspectClass = "aspect-[4/5]"; }
            else if (idx % 6 === 1) { colSpanClass = "md:col-span-5 md:mt-24"; aspectClass = "aspect-square"; }
            else if (idx % 6 === 2) { colSpanClass = "md:col-span-4"; aspectClass = "aspect-[2/3]"; }
            else if (idx % 6 === 3) { colSpanClass = "md:col-span-8 md:mt-16"; aspectClass = "aspect-[16/9]"; }
            else if (idx % 6 === 4) { colSpanClass = "md:col-span-5"; aspectClass = "aspect-square"; }
            else if (idx % 6 === 5) { colSpanClass = "md:col-span-7"; aspectClass = "aspect-[4/3]"; }

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => onNavigateToProduct(product.id)}
                className={`${colSpanClass} group cursor-pointer`}
                id={`product-card-${product.id}`}
              >
                {/* Product Image Frame */}
                <div className="relative bg-surface-container-lowest overflow-hidden border border-outline-variant/10 card-lift">
                  <img
                    alt={product.title}
                    className={`w-full ${aspectClass} object-cover grayscale transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:grayscale-0`}
                    src={product.mainImage}
                    referrerPolicy="no-referrer"
                  />

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(to top, rgba(13,11,24,0.75) 0%, transparent 50%)" }} />

                  {/* Hover bottom text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                    <p className="text-white/60 font-label text-[9px] tracking-widest uppercase">
                      {product.sizes.join(" · ")}
                    </p>
                  </div>

                  {/* Wishlist button */}
                  <motion.button
                    onClick={(e) => handleToggleWishlist(e, product)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg cursor-pointer z-10 transition-all"
                    style={{
                      background: isFav ? "rgba(248,113,113,0.2)" : "rgba(13,11,24,0.75)",
                      border: isFav ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(167,139,250,0.2)",
                    }}
                    aria-label={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                    id={`fav-btn-${product.id}`}
                  >
                    <Heart
                      className={`w-4.5 h-4.5 transition-all duration-300 ${
                        heartAnim === product.id ? "animate-heart-burst" : ""
                      } ${isFav ? "fill-red-400 text-red-400" : "text-primary"}`}
                      style={{ width: "18px", height: "18px" }}
                    />
                  </motion.button>
                </div>

                {/* Product Info */}
                <div className="mt-5 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-headline text-xl group-hover:text-primary transition-colors duration-300 animated-underline">
                      {product.title}
                    </h3>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline/60 mt-1.5">
                      {product.subtitle}
                    </p>
                  </div>
                  <span className="font-body text-sm font-semibold text-primary flex-shrink-0 mt-0.5">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Load More ── */}
      {filteredProducts.length > visibleCount && (
        <div className="mt-28 flex flex-col items-center gap-3">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline/40">
            Showing {visibleCount} of {filteredProducts.length}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-14 py-5 font-label text-xs uppercase tracking-[0.3em] btn-luxury cursor-pointer flex items-center gap-3"
            style={{
              background: "transparent",
              border: "1px solid rgba(167,139,250,0.4)",
              color: "#a78bfa",
            }}
            id="discover-more-btn"
          >
            <span>DISCOVER MORE</span>
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          </motion.button>
        </div>
      )}

      {/* ── FAB Filter Trigger ── */}
      <div className="fixed bottom-24 right-6 z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFilterPanelOpen(true)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer relative"
          style={{
            background: "linear-gradient(135deg, #a78bfa, #7c5ce1)",
            boxShadow: "0 8px 32px rgba(167,139,250,0.4)",
          }}
          aria-label="Open filter settings"
          id="fab-filter-trigger"
        >
          <SlidersHorizontal className="w-5 h-5 text-white" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ background: "#c9a96e", color: "#0d0b18" }}>
              ✓
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Sticky bottom filter bar ── */}
      <div className="fixed bottom-[68px] left-0 right-0 z-20 frosted-glass border-t border-outline-variant/10 px-5 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {(["size", "color", "fabric"] as const).map((type) => {
              const labels = { size: filterSize, color: filterColor, fabric: filterFabric };
              const lists = { size: sizesList, color: colorsList, fabric: fabricsList };
              return (
                <div key={type} className="relative flex-shrink-0">
                  <button
                    onClick={() => toggleDropdown(type)}
                    className="flex items-center gap-1.5 cursor-pointer font-label text-[10px] text-outline/70 hover:text-primary transition-colors"
                    id={`filter-dropdown-${type}-btn`}
                  >
                    <span className="uppercase tracking-widest">{type}:</span>
                    <span className={`font-bold ${labels[type] !== "ALL" ? "text-primary" : "text-outline/50"}`}>
                      {labels[type]}
                    </span>
                    <span className="text-[8px] opacity-50">▼</span>
                  </button>
                  <AnimatePresence>
                    {activeDropdown === type && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute bottom-9 left-0 mb-1 border border-outline-variant/20 shadow-2xl p-1.5 min-w-[130px] z-50"
                        style={{ background: "#0d0b18" }}
                      >
                        {lists[type].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              if (type === "size") onSetSize(val);
                              if (type === "color") onSetColor(val);
                              if (type === "fabric") onSetFabric(val);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2.5 text-[10px] font-label uppercase tracking-wider hover:bg-surface-container-high transition-colors flex items-center justify-between gap-3"
                          >
                            <span>{val}</span>
                            {labels[type] === val && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block select-none flex-shrink-0">
            <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline/40">
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Full Filter Drawer ── */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterPanelOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-50 p-8 flex flex-col justify-between select-none"
              style={{
                background: "linear-gradient(135deg, #0f0d1a 0%, #12101e 100%)",
                borderLeft: "1px solid rgba(167,139,250,0.15)",
                boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
              }}
              id="filter-fullscreen-panel"
            >
              {/* Gold top accent */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.7), transparent)" }} />

              <div className="space-y-8 overflow-y-auto styled-scrollbar">
                <div className="flex justify-between items-center pb-5 border-b border-outline-variant/10">
                  <h3 className="font-headline text-xl tracking-widest uppercase">Filter Anthology</h3>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Size */}
                <div className="space-y-3">
                  <label className="font-label text-[9px] uppercase tracking-[0.3em] text-outline/50">Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {sizesList.map((sz) => (
                      <motion.button
                        key={sz}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSetSize(sz)}
                        className={`py-3 text-[10px] font-label uppercase tracking-wider border transition-all cursor-pointer ${
                          filterSize === sz ? "text-on-primary border-primary" : "text-outline/60 border-outline-variant/20 hover:border-primary/50"
                        }`}
                        style={filterSize === sz ? { background: "linear-gradient(135deg, #a78bfa, #7c5ce1)" } : {}}
                      >
                        {sz}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <label className="font-label text-[9px] uppercase tracking-[0.3em] text-outline/50">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorsList.map((cl) => (
                      <motion.button
                        key={cl} whileTap={{ scale: 0.95 }}
                        onClick={() => onSetColor(cl)}
                        className={`px-5 py-2.5 text-[10px] font-label uppercase tracking-widest border transition-all cursor-pointer ${
                          filterColor === cl ? "text-on-primary border-primary" : "text-outline/60 border-outline-variant/20 hover:border-primary/50"
                        }`}
                        style={filterColor === cl ? { background: "linear-gradient(135deg, #a78bfa, #7c5ce1)" } : {}}
                      >
                        {cl}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Fabric */}
                <div className="space-y-3">
                  <label className="font-label text-[9px] uppercase tracking-[0.3em] text-outline/50">Fabric</label>
                  <div className="flex flex-wrap gap-2">
                    {fabricsList.map((fb) => (
                      <motion.button
                        key={fb} whileTap={{ scale: 0.95 }}
                        onClick={() => onSetFabric(fb)}
                        className={`px-5 py-2.5 text-[10px] font-label uppercase tracking-widest border transition-all cursor-pointer ${
                          filterFabric === fb ? "text-on-primary border-primary" : "text-outline/60 border-outline-variant/20 hover:border-primary/50"
                        }`}
                        style={filterFabric === fb ? { background: "linear-gradient(135deg, #a78bfa, #7c5ce1)" } : {}}
                      >
                        {fb}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-outline-variant/10">
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="w-full py-4 font-label text-xs uppercase tracking-widest btn-luxury cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
                >
                  APPLY FILTERS ({filteredProducts.length})
                </motion.button>
                <button
                  onClick={clearAllFilters}
                  className="w-full py-4 border border-outline-variant/20 text-outline/60 hover:text-primary hover:border-primary/40 font-label text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
