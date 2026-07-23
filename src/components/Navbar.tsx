import React, { useEffect, useState } from "react";
import { Menu, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  onCartToggle: () => void;
  cartCount: number;
  onNavigate: (view: "home" | "shop" | "wishlist" | "profile") => void;
  onMenuToggle: () => void;
}

export default function Navbar({
  onCartToggle,
  cartCount,
  onNavigate,
  onMenuToggle,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger bounce animation when cart count changes
  useEffect(() => {
    if (cartCount !== prevCount && cartCount > prevCount) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      setPrevCount(cartCount);
      return () => clearTimeout(t);
    }
    setPrevCount(cartCount);
  }, [cartCount]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 glass-nav transition-all duration-500 ${
        scrolled ? "h-16 border-b border-outline-variant/15 shadow-lg shadow-black/30" : "h-20 border-b border-outline-variant/5"
      }`}
    >
      {/* Gold shimmer accent line at very top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.0) 10%, rgba(201,169,110,0.7) 35%, rgba(232,213,163,1) 50%, rgba(201,169,110,0.7) 65%, rgba(201,169,110,0.0) 90%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-full flex items-center justify-between">
        {/* Menu Toggle */}
        <div className="flex-1 flex justify-start">
          <motion.button
            onClick={onMenuToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="p-2.5 -ml-2 text-on-surface hover:text-primary transition-colors duration-300 cursor-pointer flex items-center justify-center rounded-full relative group"
            aria-label="Toggle Navigation Drawer"
            id="nav-menu-toggle"
          >
            <Menu className="w-5 h-5 stroke-[1.5] transition-transform group-hover:rotate-90 duration-300" />
          </motion.button>
        </div>

        {/* Brand Name */}
        <div className="flex-1 flex justify-center">
          <motion.h1
            onClick={() => onNavigate("home")}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-headline text-xl sm:text-2xl tracking-[0.35em] font-bold cursor-pointer select-none group relative"
            id="brand-title"
          >
            <span className="text-shimmer inline-block">LUMIÈRE</span>
            {/* Sparkle decoration */}
            <motion.span
              className="absolute -top-1 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-amber-400/70" />
            </motion.span>
          </motion.h1>
        </div>

        {/* Shopping Bag Button */}
        <div className="flex-1 flex justify-end">
          <motion.button
            onClick={onCartToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="p-2.5 -mr-2 relative text-on-surface hover:text-primary transition-colors duration-300 cursor-pointer flex items-center justify-center rounded-full"
            aria-label="Open Shopping Bag"
            id="nav-cart-toggle"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-label font-bold flex items-center justify-center shadow-md border border-surface ${
                    cartBounce ? "animate-count-bounce" : ""
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #a78bfa 0%, #7c5ce1 100%)",
                    color: "#f5f0ff",
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
