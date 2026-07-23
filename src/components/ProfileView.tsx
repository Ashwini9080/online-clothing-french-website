import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Box, History, Calendar, LogOut, Crown, Gem, Star } from "lucide-react";
import { LoggedInUser } from "../types";

interface ProfileViewProps {
  user: LoggedInUser;
  onLogout: () => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};

export default function ProfileView({ user, onLogout }: ProfileViewProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = new Date(user.joinedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const benefits = [
    {
      Icon: Calendar,
      title: "Private Styling",
      desc: "Complimentary 1-on-1 virtual design styling sessions with our Milanese team.",
    },
    {
      Icon: Box,
      title: "Eco Delivery",
      desc: "Sustainable, reusable luxury packaging and zero-carbon priority shipping.",
    },
    {
      Icon: Gem,
      title: "Early Access",
      desc: "Be first to shop new collections before they drop to the public.",
    },
    {
      Icon: Crown,
      title: "Privé Events",
      desc: "Exclusive invitations to seasonal trunk shows and private editorial previews.",
    },
  ];

  return (
    <div className="pb-24 font-body max-w-3xl mx-auto px-6" id="profile-view">
      {/* Header */}
      <header className="mb-14 pt-6 select-none">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ duration: 0.6 }}
          className="font-label text-[10px] uppercase tracking-[0.25em] text-outline/60 mb-4 flex items-center gap-2"
        >
          <Star className="w-3 h-3 text-amber-400/50" /> Client Workspace
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="font-headline text-5xl sm:text-7xl italic leading-tight font-light"
        >
          My Account
        </motion.h2>
      </header>

      <motion.div
        className="space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── User Hero Card ── */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden p-8 border border-outline-variant/10"
          style={{
            background: "linear-gradient(135deg, rgba(26,23,40,0.9) 0%, rgba(20,18,31,0.95) 100%)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(167,139,250,0.1)",
          }}
        >
          {/* Background orb glow */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", filter: "blur(40px)" }} />

          {/* Top shimmer border */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(201,169,110,0.4), transparent)" }} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
            {/* Avatar + info */}
            <div className="flex items-center gap-6">
              {/* Gradient avatar with glow ring */}
              <div className="relative">
                <motion.div
                  animate={{ boxShadow: ["0 0 12px rgba(167,139,250,0.4)", "0 0 28px rgba(167,139,250,0.7)", "0 0 12px rgba(167,139,250,0.4)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-20 h-20 rounded-full p-0.5"
                  style={{ background: "linear-gradient(135deg, #a78bfa, #c9a96e, #7c5ce1)" }}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center font-headline text-2xl font-bold select-none"
                    style={{ background: "linear-gradient(135deg, #1a1728, #0d0b18)", color: "#c9a96e" }}>
                    {initials}
                  </div>
                </motion.div>
                {/* Online status dot */}
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-surface animate-pulse" />
              </div>

              <div>
                <h3 className="font-headline text-2xl sm:text-3xl tracking-wide font-medium">{user.name}</h3>
                <p className="font-label text-xs text-outline/70 mt-1">{user.email}</p>
                <p className="font-label text-[10px] text-outline/40 mt-0.5">Member since {joinedDate}</p>

                {/* Member badge */}
                <motion.div
                  animate={{ filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))",
                    border: "1px solid rgba(201,169,110,0.3)",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-label text-[9px] uppercase tracking-widest font-bold text-amber-400">
                    LUMIÈRE Privé Member ✦
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Wallet + Logout */}
            <div className="flex flex-col gap-5 items-start md:items-end">
              <div className="text-left md:text-right select-none p-4 border border-outline-variant/10"
                style={{ background: "rgba(167,139,250,0.04)" }}>
                <p className="font-label text-[9px] text-outline/50 uppercase tracking-wider mb-1">LUMIÈRE WALLET</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="font-headline text-xl font-bold text-gold-gradient"
                  style={{
                    background: "linear-gradient(135deg, #c9a96e, #e8d5a3)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  $450.00 Credits
                </motion.p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, borderColor: "rgba(248,113,113,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant/20 text-outline hover:text-red-400 transition-all text-[10px] font-label uppercase tracking-widest cursor-pointer"
                id="logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Member Benefits ── */}
        <motion.div variants={cardVariants} className="space-y-5">
          <div className="flex items-center gap-3">
            <h4 className="font-headline text-xl italic select-none">Privileges &amp; Services</h4>
            <div className="h-px flex-1 bg-outline-variant/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={cardVariants}
                whileHover={{ y: -3, borderColor: "rgba(167,139,250,0.3)" }}
                className="p-6 border border-outline-variant/10 space-y-3 cursor-default transition-all duration-300"
                style={{ background: "rgba(14,12,21,0.6)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h5 className="font-label text-[11px] uppercase tracking-widest font-bold text-primary">{title}</h5>
                </div>
                <p className="text-xs text-outline/70 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Order History ── */}
        <motion.div variants={cardVariants} className="space-y-5">
          <div className="flex items-center gap-3">
            <h4 className="font-headline text-xl italic select-none">Order Anthology</h4>
            <div className="h-px flex-1 bg-outline-variant/10" />
          </div>
          <div className="p-10 border border-outline-variant/10 text-center"
            style={{ background: "rgba(14,12,21,0.4)" }}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <History className="w-10 h-10 text-outline/20 mx-auto mb-4" />
            </motion.div>
            <p className="text-xs text-outline/40 tracking-wide">
              Your orders will appear here once you make a purchase.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
