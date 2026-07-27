import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShoppingBag, Heart, Calendar } from "lucide-react";
import { WishlistItem, Product } from "../types";

interface WishlistViewProps {
  wishlistItems: WishlistItem[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToBag: (product: Product, size: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onNavigateToShop: () => void;
}

export default function WishlistView({
  wishlistItems,
  onRemoveFromWishlist,
  onMoveToBag,
  onNavigateToProduct,
  onNavigateToShop,
}: WishlistViewProps) {
  return (
    <div className="pb-24 font-body max-w-screen-xl mx-auto px-6" id="wishlist-view">
      {/* Header Section */}
      <header className="mb-16 pt-6 select-none flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-outline mb-4">
            Curated Selection
          </p>
          <h2 className="font-headline text-4xl sm:text-6xl italic leading-tight font-light">
            Wishlist
          </h2>
        </div>
        
        {/* Count badge */}
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 border border-outline-variant/20 rounded-sm">
          <Heart className="w-4 h-4 text-primary" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"} Saved
          </span>
        </div>
      </header>

      {/* Wishlist Grid */}
      {wishlistItems.length === 0 ? (
        <div className="py-24 text-center space-y-6 max-w-lg mx-auto dev-border p-12">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto border border-outline-variant/20">
            <Heart className="w-7 h-7 text-outline/40" />
          </div>
          <h3 className="font-headline text-3xl italic">Your curation is empty</h3>
          <p className="text-xs text-outline/60 tracking-wider leading-relaxed">
            Browse our digital editorial lookbook and save garments you wish to keep in your personal anthology. The finest pieces await.
          </p>
          <div className="pt-4">
            <button
              onClick={onNavigateToShop}
              className="px-10 py-4 font-label text-xs uppercase tracking-widest btn-luxury cursor-pointer"
              style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
              id="wishlist-go-shop-btn"
            >
              Explore the Anthology
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12 select-none">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, idx) => {
              const product = item.product;
              
              // Format date nicely if available
              const dateAdded = new Date(item.dateAdded).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              });

              // Grid layouts matching Screen 4 asymmetric offsets
              let colSpanClass = "md:col-span-6";
              let aspectClass = "aspect-square";
              let cardLayout = "normal";

              if (idx % 4 === 0) {
                // Item 1: Large Offset col-span-7
                colSpanClass = "md:col-span-7";
                aspectClass = "aspect-square";
                cardLayout = "large-offset";
              } else if (idx % 4 === 1) {
                // Item 2: Smaller Offset Right col-span-4 mt-12
                colSpanClass = "md:col-start-9 md:col-span-4 md:mt-12";
                aspectClass = "aspect-square";
                cardLayout = "right-narrow";
              } else if (idx % 4 === 2) {
                // Item 3: Wide/Thin col-span-5 md:mt-[-8rem]
                colSpanClass = "md:col-span-5 md:-mt-32";
                aspectClass = "aspect-[4/5]";
                cardLayout = "medium-narrow";
              } else if (idx % 4 === 3) {
                // Item 4: High Contrast Module col-span-6
                colSpanClass = "md:col-start-7 md:col-span-6";
                aspectClass = "aspect-square";
                cardLayout = "wide-contrast";
              }

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className={`${colSpanClass} group`}
                  id={`wishlist-card-${product.id}`}
                >
                  {/* Image wrapper with hovering close trigger */}
                  <div className="relative overflow-hidden bg-surface-dim border border-outline-variant/10 card-lift">
                    <img
                      onClick={() => onNavigateToProduct(product.id)}
                      className={`w-full ${aspectClass} object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer`}
                      src={product.mainImage}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                    />

                    {/* Date added badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span className="font-label text-[8px] uppercase tracking-widest text-outline">
                        Added {dateAdded}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="absolute top-6 right-6 p-2.5 bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/20 shadow-sm hover:scale-110 active:scale-95 transition-all text-outline hover:text-error cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Remove item"
                      id={`wishlist-remove-btn-${product.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* CUSTOM BOTTOM INTERACTION BASED ON LAYOUT */}
                  <div className="mt-8">
                    {cardLayout === "large-offset" && (
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <span className="tag-pill inline-block mb-1">{product.categories[0]}</span>
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-3xl font-medium hover:text-primary transition-colors cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                            {product.subtitle}
                          </p>
                          <p className="text-xl mt-4 font-bold text-primary">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-4 flex-shrink-0">
                          <button
                            onClick={() => onMoveToBag(product, product.sizes[0] || "38")}
                            className="px-8 py-4 font-label text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                            style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
                            id={`wishlist-move-${product.id}`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Move to Bag</span>
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="editorial-underline font-label text-[10px] uppercase tracking-widest text-outline hover:text-error transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {cardLayout === "right-narrow" && (
                      <div className="space-y-4">
                        <div>
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-xl font-medium hover:text-primary transition-colors cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="text-sm font-bold text-primary mt-1">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onMoveToBag(product, product.sizes[0] || "38")}
                          className="w-full border-b border-outline-variant py-4 text-left flex justify-between items-center group/btn cursor-pointer"
                          id={`wishlist-move-${product.id}`}
                        >
                          <span className="font-label text-xs uppercase tracking-widest font-bold">
                            Move to Bag
                          </span>
                          <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform text-primary" />
                        </button>
                      </div>
                    )}

                    {cardLayout === "medium-narrow" && (
                      <div className="space-y-3">
                        <div>
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-2xl font-medium hover:text-primary transition-colors cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="text-base font-bold text-primary mt-1">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="pt-4 flex gap-6">
                          <button
                            onClick={() => onMoveToBag(product, product.sizes[0] || "38")}
                            className="animated-underline font-label text-[10px] uppercase tracking-widest font-bold text-primary hover:text-amber-400 transition-colors cursor-pointer pb-1"
                            id={`wishlist-move-${product.id}`}
                          >
                            Move to Bag
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="text-outline hover:text-error transition-colors font-label text-[10px] uppercase tracking-widest cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {cardLayout === "wide-contrast" && (
                      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-t border-outline-variant/20 pt-8 gap-6">
                        <div>
                          <span className="tag-pill inline-block mb-2">{product.categories[0]}</span>
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-3xl font-light hover:text-primary transition-colors cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mt-2 font-medium">
                            {product.subtitle}
                          </p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-xl font-bold text-primary mb-4">
                            ${product.price.toLocaleString()}
                          </p>
                          <button
                            onClick={() => onMoveToBag(product, product.sizes[0] || "38")}
                            className="px-8 py-4 font-label text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
                            id={`wishlist-move-${product.id}`}
                          >
                            Move to Bag
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
