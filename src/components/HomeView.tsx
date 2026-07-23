import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Category } from "../types";
import { categories } from "../data";

interface HomeViewProps {
  onNavigateToShop: (categoryFilter?: string) => void;
  onNavigateToProduct: (productId: string) => void;
}

const MARQUEE_ITEMS = [
  "New Arrivals", "✦", "Curated Pieces", "✦", "Quiet Luxury", "✦",
  "Italian Craft", "✦", "Sustainable", "✦", "Couture Details", "✦",
  "New Arrivals", "✦", "Curated Pieces", "✦", "Quiet Luxury", "✦",
  "Italian Craft", "✦", "Sustainable", "✦", "Couture Details", "✦",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
};

export default function HomeView({ onNavigateToShop, onNavigateToProduct }: HomeViewProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="space-y-0 pb-16 font-body" id="home-view">

      {/* ── HERO SECTION ── */}
      <section ref={heroRef} className="relative h-[90vh] w-full overflow-hidden">
        {/* Parallax background image */}
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: heroY }}>
          <img
            alt="Seasonal Editorial Collection"
            className="w-full h-[110%] object-cover select-none"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhsDE-a4ChHKniOaaSNcJGPUiAdooTqSGn6fs5OmpH-pIThHIJWCHdhMMsW3NDq6O1MsCGlsibX93KZfnQmsKII5u1P6V1rGrn0cbJWU3bzLFDYaEkDTzK61-AtJhX0daktTP2p3VEEGsNsGI1jL0GTXj_Oo6g_Ic5V7Z8dPfTtmn8mbTQ60ezZUmB5bWeNAhKioDnbb2BOvxuHdMPIbymFzKG1Ll1gUbRL1p5QS03fyMngE3KuDmTpGXK9wbwSXQ9ieLQzbKN4vg"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10" />

        {/* Floating decorative orbs */}
        <div className="absolute top-12 right-12 w-48 h-48 rounded-full opacity-[0.06] orb-1 pointer-events-none"
          style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-32 left-8 w-32 h-32 rounded-full opacity-[0.08] orb-3 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c9a96e 0%, transparent 70%)", filter: "blur(30px)" }} />

        {/* Content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-20 sm:pb-28 text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          {/* Issue label */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-[9px] font-label uppercase text-amber-400/70 mb-6 tracking-[0.5em]"
          >
            ✦ &nbsp; Issue No. 04 — Winter 2026 &nbsp; ✦
          </motion.p>

          {/* Main headline — word-by-word stagger */}
          <div className="overflow-hidden mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-headline text-6xl md:text-8xl text-white leading-[0.95] select-none"
            >
              The&nbsp;Winter<br />
              <span className="italic text-amber-200/90">Anthology</span>
            </motion.h2>
          </div>

          {/* Sub text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-[11px] font-label tracking-[0.35em] text-white/50 mb-10 uppercase"
          >
            Curated silhouettes · Italian craft · Quiet luxury
          </motion.p>

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6, ease: "backOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigateToShop("ALL")}
            className="relative group btn-luxury overflow-hidden px-12 py-5 text-[11px] tracking-[0.35em] font-label uppercase cursor-pointer"
            id="hero-cta-btn"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.9), rgba(124,92,225,0.9))",
              color: "#f5f0ff",
              boxShadow: "0 0 40px rgba(167,139,250,0.3), 0 16px 32px rgba(0,0,0,0.4)",
              border: "1px solid rgba(167,139,250,0.4)",
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              SHOP THE LOOK
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-white/0 via-white/40 to-white/0"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="relative overflow-hidden py-4 border-y border-outline-variant/10"
        style={{ background: "linear-gradient(90deg, #0d0b18, #14121f, #0d0b18)" }}>
        <div className="flex whitespace-nowrap animate-marquee">
          {MARQUEE_ITEMS.map((item, i) => (
            <span
              key={i}
              className={`inline-block mx-6 font-label text-[10px] uppercase tracking-[0.35em] select-none ${
                item === "✦" ? "text-amber-400/60" : "text-outline/60"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── COLLECTIONS SECTION ── */}
      <section className="px-6 max-w-7xl mx-auto pt-24">
        <motion.div
          className="flex items-end justify-between mb-12 pb-4 border-b border-outline-variant/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="font-label text-[9px] uppercase tracking-[0.4em] text-outline/50 mb-2">Browse by</p>
            <h3 className="font-headline text-3xl tracking-wide">Collections</h3>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => onNavigateToShop("ALL")}
            className="font-label text-[10px] tracking-[0.25em] text-primary flex items-center gap-2 animated-underline cursor-pointer pb-1"
            id="view-all-collections"
          >
            VIEW ALL <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          className="flex overflow-x-auto hide-scrollbar gap-5 sm:gap-8 pb-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              variants={itemVariants}
              onClick={() => onNavigateToShop(cat.name)}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group select-none"
              id={`collection-circle-${cat.name.toLowerCase()}`}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Circle with glow */}
              <div className="relative w-28 h-28 mb-4">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: "0 0 24px rgba(167,139,250,0.5)", background: "rgba(167,139,250,0.05)" }} />
                {/* Border */}
                <div className="absolute inset-0 rounded-full border border-outline-variant/30 group-hover:border-primary/60 transition-all duration-500" />
                {/* Outer ring */}
                <div className="absolute -inset-1 rounded-full border border-transparent group-hover:border-primary/20 transition-all duration-500" />
                {/* Image */}
                <div className="absolute inset-1.5 rounded-full overflow-hidden">
                  <img
                    alt={cat.displayName}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-700"
                    src={cat.thumbnailImage}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="font-label text-[10px] tracking-widest uppercase text-outline/70 group-hover:text-primary transition-colors duration-300">
                {cat.displayName}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURED EDITORIAL GRID ── */}
      <section className="px-6 max-w-7xl mx-auto pt-28">
        <motion.div
          className="col-span-12 mb-8 border-b border-outline-variant/10 pb-5 flex items-center justify-between"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="font-label text-[9px] uppercase tracking-[0.4em] text-amber-400/50 mb-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Editorial
            </p>
            <h3 className="font-label text-[10px] tracking-[0.45em] text-outline uppercase font-medium">
              Issue No. 04 — Essentialism
            </h3>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-y-16 md:gap-x-12">
          {/* Left Column: Big feature */}
          <motion.div
            className="col-span-12 md:col-span-7 pr-0 md:pr-4 group"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              onClick={() => onNavigateToProduct("the-archival-trench")}
              className="bg-surface-container-lowest h-[420px] sm:h-[500px] w-full overflow-hidden cursor-pointer relative card-lift"
            >
              <img
                alt="Editorial Monolith Coat"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjT8Yi2sesfMugzSPwC2ObE0tGGPcdSRc-qH5uSTeIwN9n7fN-C9Kww-kbi0cAEK0Swc2vufkOyFs800ecT0kAQcD5_r_7W-076YQZ-Cp6fMb9So3fOpUkq_Sc1445QxNR6oCn6V6yf5ZOorFaQjDvXeCIiQxuzWFVYilA-ge7QA2b1-M7eARcfDTGnngddVpTQPuG-STk8NvmpQi57GNLAgNAnZkFrgX8UOzS9ljZOKlOFbI264Jf7yf-jXE2fTDNjN5Hpi4t98k"
                referrerPolicy="no-referrer"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <p className="text-white/80 font-label text-[10px] tracking-widest uppercase">View Product</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <h4
                onClick={() => onNavigateToProduct("the-archival-trench")}
                className="font-headline text-2xl font-medium cursor-pointer animated-underline inline-block leading-tight hover:text-primary transition-colors"
              >
                The Monolith Coat
              </h4>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xl">
                Structural integrity meets raw silk. A study in architectural volume for the modern nomad.
                Fully customized detailing with virgin Italian wool canvas.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Secondary accent */}
          <motion.div
            className="col-span-12 md:col-span-4 md:col-start-9 pt-0 md:pt-24 group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              onClick={() => onNavigateToShop("ALL")}
              className="bg-surface-container-lowest h-[300px] sm:h-[360px] w-full overflow-hidden cursor-pointer relative card-lift"
            >
              <img
                alt="Editorial Accent"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3qwjL2PuB2ZO_9Bh-m0J3PSRBVhmxsw-Xlhfzb57zurw9NZbsHXwrpaDtxPzij28CCUTaF7j2hIj-tScbOY9oSZRoKo47Go6clWeidbYUf7Tu5g3_lCd-mKioWqdZ2oUkiSVX1RZTxl9WKj-AJqmIWwLTCv9n5g_Ypzr10XitLOwAu-ugwJ_pZvrQqkamydJitPn5ZHbPRNOKCroUI9jsguKBrrnpZoebRRhjHpM7NY3MLTRDORDmEyZO-SG9I-YaHcsr-zga17c"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="mt-6">
              <motion.button
                whileHover={{ x: 6 }}
                onClick={() => onNavigateToShop("ALL")}
                className="font-label text-[10px] tracking-[0.25em] font-bold text-primary cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-2 animated-underline pb-1"
                id="editorial-discover-link"
              >
                <span>DISCOVER THE COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BRAND STATEMENT ── */}
      <motion.section
        className="my-32 px-6 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        {/* Decorative asterisks */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-outline-variant/30" />
          <Star className="w-3 h-3 text-amber-400/40 fill-amber-400/40" />
          <Star className="w-4 h-4 text-amber-400/60 fill-amber-400/60" />
          <Star className="w-3 h-3 text-amber-400/40 fill-amber-400/40" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-outline-variant/30" />
        </div>

        <p className="font-headline italic text-2xl sm:text-3xl leading-relaxed text-on-surface/80">
          "Fashion is the most powerful art we have.
          <br className="hidden sm:block" />
          <span className="text-primary/80"> It is how we present our souls to the world.</span>"
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-outline-variant/20" />
          <p className="font-label text-[9px] uppercase tracking-[0.4em] text-outline/40">Lumière Studio · Est. 2026</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-outline-variant/20" />
        </div>
      </motion.section>

    </div>
  );
}
