import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShoppingBag, Heart } from "lucide-react";
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
      <header className="mb-16 pt-6 select-none">
        <p className="font-label text-[10px] uppercase tracking-[0.25em] text-outline mb-4">
          Curated Selection
        </p>
        <h2 className="font-headline text-4xl sm:text-6xl italic leading-tight font-light">
          Wishlist
        </h2>
      </header>

      {/* Wishlist Grid */}
      {wishlistItems.length === 0 ? (
        <div className="py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto text-outline/60">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-headline text-2xl italic">Your curation is empty</h3>
          <p className="text-xs text-outline tracking-wider max-w-sm mx-auto">
            Browse our digital editorial lookbook and save garments you wish to keep in your personal anthology.
          </p>
          <button
            onClick={onNavigateToShop}
            className="px-8 py-4 bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary-fixed transition-colors cursor-pointer"
            id="wishlist-go-shop-btn"
          >
            Explore the Anthology
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12 select-none">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, idx) => {
              const product = item.product;

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
                  <div className="relative overflow-hidden bg-surface-dim border border-outline-variant/10">
                    <img
                      onClick={() => onNavigateToProduct(product.id)}
                      className={`w-full ${aspectClass} object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0 cursor-pointer`}
                      src={product.mainImage}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                    />

                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="absolute top-6 right-6 p-2.5 bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-all text-outline hover:text-error cursor-pointer"
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
                        <div className="space-y-1">
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-2xl font-medium hover:underline cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="font-label text-xs uppercase tracking-widest text-outline">
                            {product.subtitle}
                          </p>
                          <p className="text-lg mt-4 font-bold text-primary">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-4 flex-shrink-0">
                          <button
                            onClick={() => onMoveToBag(product, product.sizes[0] || "S")}
                            className="bg-primary text-on-primary px-8 py-4 font-label text-xs uppercase tracking-widest hover:bg-primary-fixed hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                            id={`wishlist-move-${product.id}`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Move to Bag</span>
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="editorial-underline font-label text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors cursor-pointer"
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
                            className="font-headline text-xl font-medium hover:underline cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="text-sm font-bold text-primary mt-1">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onMoveToBag(product, product.sizes[0] || "S")}
                          className="w-full border-b border-outline-variant py-4 text-left flex justify-between items-center group/btn cursor-pointer"
                          id={`wishlist-move-${product.id}`}
                        >
                          <span className="font-label text-xs uppercase tracking-widest font-bold">
                            Move to Bag
                          </span>
                          <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                      </div>
                    )}

                    {cardLayout === "medium-narrow" && (
                      <div className="space-y-3">
                        <div>
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-2xl font-medium hover:underline cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <p className="text-base font-bold text-primary mt-1">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="pt-4 flex gap-6">
                          <button
                            onClick={() => onMoveToBag(product, product.sizes[0] || "S")}
                            className="editorial-underline font-label text-xs uppercase tracking-widest font-bold text-primary hover:opacity-75 transition-opacity cursor-pointer"
                            id={`wishlist-move-${product.id}`}
                          >
                            Add to Bag
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="text-outline hover:text-primary transition-colors font-label text-xs uppercase tracking-widest cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {cardLayout === "wide-contrast" && (
                      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-t border-outline-variant/20 pt-8 gap-6">
                        <div>
                          <h3
                            onClick={() => onNavigateToProduct(product.id)}
                            className="font-headline text-3xl font-light hover:underline cursor-pointer"
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
                            onClick={() => onMoveToBag(product, product.sizes[0] || "S")}
                            className="bg-primary text-on-primary px-8 py-4 font-label text-xs uppercase tracking-widest hover:bg-primary-fixed hover:scale-105 active:scale-95 transition-all cursor-pointer"
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

      {/* Pagination Summary Footer */}
      {wishlistItems.length > 0 && (
        <div className="mt-32 border-t border-outline-variant/15 pt-12 flex flex-col sm:flex-row justify-between items-center gap-6 select-none">
          <p className="font-label text-xs uppercase tracking-[0.25em] text-outline">
            Viewing {wishlistItems.length} of {wishlistItems.length} items
          </p>
          <button
            onClick={() => {}}
            className="editorial-underline font-label text-xs uppercase tracking-widest py-2 hover:opacity-75 transition-opacity cursor-pointer"
            id="wishlist-load-more"
          >
            Load More Saved Items
          </button>
        </div>
      )}
    </div>
  );
}
