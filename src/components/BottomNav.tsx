import React from "react";
import { Home, Store, Heart, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BottomNavProps {
  currentView: "home" | "shop" | "wishlist" | "profile" | "detail";
  onNavigate: (view: "home" | "shop" | "wishlist" | "profile") => void;
  wishlistCount: number;
}

const navItems = [
  { key: "home" as const,     Icon: Home,  label: "Home" },
  { key: "shop" as const,     Icon: Store, label: "Shop" },
  { key: "wishlist" as const, Icon: Heart, label: "Wishlist" },
  { key: "profile" as const,  Icon: User,  label: "Profile" },
];

export default function BottomNav({
  currentView,
  onNavigate,
  wishlistCount,
}: BottomNavProps) {
  const activeView = currentView === "detail" ? "shop" : currentView;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-outline-variant/10">
      {/* Subtle gradient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.4), rgba(201,169,110,0.3), rgba(167,139,250,0.4), transparent)",
        }}
      />

      <div className="max-w-md mx-auto h-[68px] grid grid-cols-4 px-2">
        {navItems.map(({ key, Icon, label }) => {
          const isActive = activeView === key;
          const showBadge = key === "wishlist" && wishlistCount > 0;

          return (
            <motion.button
              key={key}
              onClick={() => onNavigate(key)}
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center justify-center gap-0.5 cursor-pointer group"
              id={`btn-nav-${key}`}
            >
              {/* Active pill indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                      background: "linear-gradient(90deg, #a78bfa, #c9a96e)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon container with glow on active */}
              <motion.div
                animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative"
              >
                <Icon
                  className={`w-[22px] h-[22px] transition-all duration-300 ${
                    isActive
                      ? "text-primary drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                      : "text-outline/60 group-hover:text-primary/70 stroke-[1.5]"
                  } ${isActive ? "fill-primary/20 stroke-[2]" : ""}`}
                />

                {/* Wishlist badge */}
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full text-[7px] font-bold flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #a78bfa, #c9a96e)",
                      color: "#0d0b18",
                    }}
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-[9px] font-label tracking-wider uppercase transition-all duration-300 ${
                  isActive ? "text-primary font-semibold" : "text-outline/50 group-hover:text-primary/70"
                }`}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
