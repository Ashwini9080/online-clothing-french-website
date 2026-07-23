import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ChevronDown, Check, Ruler, ShoppingBag, ArrowLeft, Sparkles, Star } from "lucide-react";
import { Product } from "../types";
import { products } from "../data";

interface ProductDetailViewProps {
  productId: string;
  onNavigateToProduct: (productId: string) => void;
  onNavigateBack: () => void;
  onAddToBag: (product: Product, size: string) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
}

export default function ProductDetailView({
  productId,
  onNavigateToProduct,
  onNavigateBack,
  onAddToBag,
  wishlistIds,
  onToggleWishlist,
}: ProductDetailViewProps) {
  const product = products.find((p) => p.id === productId) || products[0];
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [addingToBag, setAddingToBag] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (product.sizes.length > 0) {
      setSelectedSize(product.sizes.includes("S") ? "S" : product.sizes[0]);
    }
    setActiveImageIdx(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product]);

  const isFav = wishlistIds.includes(product.id);
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);
  const gallery = product.galleryImages || [product.mainImage, product.mainImage, product.mainImage, product.mainImage];

  const handleAddToBag = () => {
    if (!selectedSize || addingToBag) return;
    setAddingToBag(true);
    setTimeout(() => {
      onAddToBag(product, selectedSize);
      setAddingToBag(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    }, 600);
  };

  const handleToggleWishlist = () => {
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 500);
    onToggleWishlist(product);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="pt-6 pb-24 font-body max-w-7xl mx-auto px-6" id="product-detail-view">

      {/* ── Breadcrumb / Back ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex items-center gap-2"
      >
        <motion.button
          onClick={onNavigateBack}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-outline/60 hover:text-primary transition-colors cursor-pointer group"
          id="detail-back-btn"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Anthology</span>
        </motion.button>
        <span className="text-outline/20 text-xs">/</span>
        <span className="text-[10px] font-label uppercase tracking-widest text-outline/40 truncate max-w-[160px]">
          {product.title}
        </span>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-16">

        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-7 space-y-4 select-none">
          {/* Main image */}
          <motion.div
            className="relative aspect-[3/4] overflow-hidden border border-outline-variant/10 cursor-zoom-in"
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIdx}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                src={gallery[activeImageIdx]}
                alt={`${product.title} view ${activeImageIdx + 1}`}
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {gallery.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`h-0.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeImageIdx ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Thumbnail row */}
          <div className="grid grid-cols-3 gap-3">
            {gallery.slice(1, 4).map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImageIdx(i + 1)}
                className={`aspect-[3/4] overflow-hidden cursor-pointer border transition-all duration-300 ${
                  activeImageIdx === i + 1 ? "border-primary/60" : "border-outline-variant/10 hover:border-primary/30"
                }`}
              >
                <img
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  src={img}
                  alt={`${product.title} detail ${i + 2}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Info Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 self-start flex flex-col space-y-8">

          {/* Title block */}
          <div className="border-b border-outline-variant/10 pb-7">
            <div className="flex justify-between items-start mb-5 select-none">
              <p className="font-label text-[10px] tracking-[0.3em] text-outline/60 uppercase">{product.subtitle}</p>
              <motion.button
                onClick={handleToggleWishlist}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer"
                aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                id="detail-wishlist-toggle"
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    heartAnim ? "scale-125" : ""
                  } ${isFav ? "fill-red-400 text-red-400" : "text-primary/80 hover:text-red-400"}`}
                />
              </motion.button>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-headline text-4xl md:text-5xl mb-5 leading-[1.05] font-light select-none"
            >
              {product.title}
            </motion.h2>

            <div className="flex items-center gap-3">
              <p className="font-headline text-2xl font-semibold"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #c9a96e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                ${product.price.toLocaleString()}.00
              </p>
              {/* Rating decoration */}
              <div className="flex gap-0.5 ml-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400/60 text-amber-400/60" />
                ))}
              </div>
            </div>
          </div>

          {/* Description + Specs */}
          <div className="space-y-5">
            <p className="font-body text-sm leading-relaxed text-on-surface-variant/80 select-none">
              {product.description}
            </p>
            <div className="space-y-0 select-none">
              {[
                { label: "Material", value: product.material },
                { label: "Origin", value: product.origin },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-3.5 border-b border-outline-variant/10">
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-outline/50">{label}</span>
                  <span className="font-body text-xs italic font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center select-none">
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline/60">
                Select Size
              </label>
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => setIsSizeGuideOpen(true)}
                className="font-label text-[10px] uppercase tracking-widest text-outline/50 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                id="size-guide-trigger"
              >
                <Ruler className="w-3 h-3" />
                <span>Size Guide</span>
              </motion.button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((sz) => (
                <motion.button
                  key={sz}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-4 text-[11px] font-label uppercase tracking-widest transition-all cursor-pointer border relative overflow-hidden ${
                    selectedSize === sz ? "text-on-primary border-transparent font-bold" : "text-outline/60 border-outline-variant/20 hover:border-primary/40 hover:text-primary"
                  }`}
                  style={selectedSize === sz ? {
                    background: "linear-gradient(135deg, #a78bfa, #7c5ce1)",
                    boxShadow: "0 0 16px rgba(167,139,250,0.4)",
                  } : {}}
                  id={`detail-size-${sz}`}
                >
                  {sz}
                  {selectedSize === sz && (
                    <motion.span
                      layoutId="size-active-indicator"
                      className="absolute inset-0 rounded-none"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="space-y-3 pt-2">
            <motion.button
              onClick={handleAddToBag}
              disabled={!selectedSize || addingToBag}
              whileHover={selectedSize && !addingToBag ? { scale: 1.02 } : {}}
              whileTap={selectedSize && !addingToBag ? { scale: 0.98 } : {}}
              className="w-full py-5 px-8 font-label text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 cursor-pointer btn-luxury disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: selectedSize && !addingToBag
                  ? "linear-gradient(135deg, #a78bfa 0%, #7c5ce1 100%)"
                  : "rgba(167,139,250,0.3)",
                color: "#f5f0ff",
                boxShadow: selectedSize && !addingToBag ? "0 0 30px rgba(167,139,250,0.35), 0 8px 24px rgba(0,0,0,0.3)" : "none",
              }}
              id="add-to-bag-btn"
            >
              {addingToBag ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Adding…</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG</span>
                </>
              )}
            </motion.button>
            <p className="text-center font-label text-[9px] text-outline/40 tracking-wider select-none flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400/40" />
              Complimentary carbon-neutral express shipping on all curated orders
            </p>
          </div>

          {/* Accordions */}
          <div className="pt-4 border-t border-outline-variant/10 space-y-1 select-none">
            {[
              { key: "sustainability", label: "Sustainability", content: product.sustainability },
              { key: "care", label: "Care Instructions", content: product.careInstructions },
            ].map(({ key, label, content }) => (
              <div key={key} className="border-b border-outline-variant/10">
                <button
                  onClick={() => toggleAccordion(key)}
                  className="w-full py-4 flex justify-between items-center text-left hover:text-primary transition-colors cursor-pointer group"
                  id={`accordion-trigger-${key}`}
                >
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] font-medium group-hover:text-primary transition-colors">
                    {label}
                  </span>
                  <motion.div
                    animate={{ rotate: activeAccordion === key ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className="w-4 h-4 text-outline/40" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-xs text-outline/60 leading-relaxed">{content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Complete the Look ── */}
      <section className="mt-36 border-t border-outline-variant/10 pt-20">
        <motion.div
          className="flex items-center gap-4 mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-px flex-1 bg-outline-variant/10" />
          <h3 className="font-headline text-3xl italic select-none text-center">Complete the Look</h3>
          <div className="h-px flex-1 bg-outline-variant/10" />
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {relatedProducts.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => onNavigateToProduct(p.id)}
              className={`space-y-4 group cursor-pointer ${idx === 2 ? "hidden md:block" : ""}`}
              id={`related-item-card-${p.id}`}
            >
              <div className="aspect-[3/4] overflow-hidden border border-outline-variant/10 card-lift">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                  src={p.mainImage}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1.5 select-none">
                <h4 className="font-label text-[11px] uppercase tracking-widest font-bold group-hover:text-primary transition-colors animated-underline">
                  {p.title}
                </h4>
                <p className="font-body text-sm text-outline/60">${p.price.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Size Guide Modal ── */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md z-50 p-8 shadow-2xl font-body select-none"
              style={{
                background: "linear-gradient(135deg, #0f0d1a, #12101e)",
                border: "1px solid rgba(167,139,250,0.2)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(167,139,250,0.1)",
              }}
              id="size-guide-modal"
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)" }} />
              <h3 className="font-headline text-lg tracking-widest uppercase mb-1 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" /> Size Guide (CM)
              </h3>
              <p className="text-[10px] text-outline/40 mb-5 font-label uppercase tracking-wider">Lumière International Standard</p>
              <table className="w-full text-xs font-label uppercase tracking-wider mb-6">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-outline/50">
                    <th className="text-left py-2.5">Size</th>
                    <th className="text-center py-2.5">Bust</th>
                    <th className="text-center py-2.5">Waist</th>
                    <th className="text-center py-2.5">Hips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {[["XS","80–84","60–64","86–90"],["S","84–88","64–68","90–94"],["M","88–92","68–72","94–98"],["L","92–96","72–76","98–102"]].map(([sz,...vals]) => (
                    <tr key={sz} className={selectedSize === sz ? "text-primary" : ""}>
                      <td className="py-3 font-bold">{sz}</td>
                      {vals.map((v, i) => <td key={i} className="text-center py-3 text-outline/70">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setIsSizeGuideOpen(false)}
                className="w-full py-4 font-label text-xs uppercase tracking-widest btn-luxury"
                style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
              >
                Close Guide
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            className="fixed bottom-28 left-6 right-6 sm:left-auto sm:right-6 sm:w-auto z-50 py-4 px-6 shadow-2xl flex items-center gap-3 font-label text-xs tracking-widest uppercase select-none"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #7c5ce1 100%)",
              color: "#f5f0ff",
              boxShadow: "0 8px 32px rgba(167,139,250,0.5)",
              border: "1px solid rgba(167,139,250,0.3)",
            }}
            id="detail-success-toast"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{product.title} (SIZE {selectedSize}) added to bag.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
