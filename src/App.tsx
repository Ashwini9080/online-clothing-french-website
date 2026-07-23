import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, ShoppingBag, Store, Home, User, CheckCircle, ArrowRight, Mail, Loader2, AlertCircle } from "lucide-react";
import { Product, CartItem, WishlistItem, LoggedInUser, DeliveryAddress } from "./types";
import { products } from "./data";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import HomeView from "./components/HomeView";
import ShopView from "./components/ShopView";
import ProductDetailView from "./components/ProductDetailView";
import WishlistView from "./components/WishlistView";
import ProfileView from "./components/ProfileView";
import CartDrawer from "./components/CartDrawer";
import LoginPage from "./components/LoginPage";
import { sendOrderConfirmation, generateOrderId } from "./services/emailService";
import { readSession, clearSession, sanitizeText } from "./services/security";

export default function App() {
  // Auth state — uses secure session reader (validates expiry + data integrity)
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(() => readSession());

  // Navigation & Routing States
  const [currentView, setCurrentView] = useState<"home" | "shop" | "wishlist" | "profile" | "detail">("home");
  const [selectedProductId, setSelectedProductId] = useState<string>("fluid-silk-slip-dress");
  const [viewHistory, setViewHistory] = useState<string[]>([]);

  // Cart & Wishlist States (Persistent via localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("lumiere_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem("lumiere_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI State toggles
  const [cartOpen, setCartOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Order & Email state
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [currentOrderTotal, setCurrentOrderTotal] = useState<number>(0);
  const [currentOrderAddress, setCurrentOrderAddress] = useState<DeliveryAddress | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  // Shop filter state variables (shared globally for deep linking)
  const [filterSize, setFilterSize] = useState("ALL");
  const [filterColor, setFilterColor] = useState("ALL");
  const [filterFabric, setFilterFabric] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Sync state to local storage on change
  useEffect(() => {
    localStorage.setItem("lumiere_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("lumiere_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle routing navigation
  const handleNavigate = (view: "home" | "shop" | "wishlist" | "profile") => {
    setCurrentView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToProduct = (productId: string) => {
    setViewHistory((prev) => [...prev, currentView]);
    setSelectedProductId(productId);
    setCurrentView("detail");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateBack = () => {
    if (viewHistory.length > 0) {
      const prev = viewHistory[viewHistory.length - 1];
      setViewHistory((prevHistory) => prevHistory.slice(0, -1));
      setCurrentView(prev as any);
    } else {
      setCurrentView("shop");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add Item to Bag (Cart)
  const handleAddToBag = (product: Product, size: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIdx > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIdx].quantity += 1;
        return nextCart;
      }
      return [...prevCart, { product, selectedSize: size, quantity: 1 }];
    });
    // Slide open cart drawer on success for satisfying feedback
    setTimeout(() => setCartOpen(true), 600);
  };

  // Update Cart Quantities
  const handleUpdateQuantity = (productId: string, size: string, change: number) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === productId && item.selectedSize === size
      );
      if (existingIdx === -1) return prevCart;

      const nextCart = [...prevCart];
      const newQty = nextCart[existingIdx].quantity + change;
      if (newQty <= 0) {
        nextCart.splice(existingIdx, 1);
      } else {
        nextCart[existingIdx].quantity = newQty;
      }
      return nextCart;
    });
  };

  // Remove Item from Cart
  const handleRemoveCartItem = (productId: string, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  // Toggle Wishlist status
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      const isExist = prevWishlist.some((item) => item.product.id === product.id);
      if (isExist) {
        return prevWishlist.filter((item) => item.product.id !== product.id);
      }
      return [...prevWishlist, { product, dateAdded: new Date().toISOString() }];
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Move a saved wishlist item straight to the shopping cart
  const handleMoveToBag = (product: Product, size: string) => {
    handleAddToBag(product, size);
    handleRemoveFromWishlist(product.id);
  };

  // Secure logout — clears session using security module
  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentView("home");
    setCart([]);
    setWishlist([]);
  };

  // Checkout process — sends confirmation email via EmailJS
  const handleCheckout = (total: number, address: DeliveryAddress) => {
    const orderId = generateOrderId();
    const orderDate = new Date().toISOString();

    setCartOpen(false);
    setCurrentOrderId(orderId);
    setCurrentOrderTotal(total);
    setCurrentOrderAddress(address);
    setEmailStatus("sending");
    setCheckoutSuccess(true);

    // Use logged-in user's sanitized details for the order
    const customerEmail = currentUser?.email ?? "";
    const customerName = sanitizeText(currentUser?.name ?? "Guest");

    // Send order confirmation email asynchronously
    sendOrderConfirmation({
      orderId,
      customerEmail,
      customerName,
      items: cart,
      totalAmount: total,
      orderDate,
      deliveryAddress: address,
    })
      .then(() => setEmailStatus("sent"))
      .catch((err) => {
        console.error("[EmailJS] Failed to send order email:", err);
        setEmailStatus("failed");
      });
  };

  const handleCloseCheckoutSuccess = () => {
    setCart([]);         // Clear bag on purchase
    setCheckoutSuccess(false);
    setEmailStatus("idle");
    setCurrentOrderId("");
    setCurrentOrderTotal(0);
    setCurrentOrderAddress(null);
  };

  // Category navigation link helper
  const handleNavigateToShopCategory = (categoryName?: string) => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory("ALL");
    }
    // clear other filter criteria for fresh category browse
    setFilterSize("ALL");
    setFilterColor("ALL");
    setFilterFabric("ALL");
    setCurrentView("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const wishlistCount = wishlist.length;
  const wishlistIds = wishlist.map((item) => item.product.id);
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between font-body antialiased selection:bg-primary selection:text-on-primary">
      
      {/* HEADER NAVBAR */}
      <Navbar
        onCartToggle={() => setCartOpen((prev) => !prev)}
        cartCount={cartCount}
        onNavigate={handleNavigate}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      {/* VIEWPORT AREA CONTENT */}
      <main className="flex-grow pt-24 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (currentView === "detail" ? `-${selectedProductId}` : "")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {currentView === "home" && (
              <HomeView
                onNavigateToShop={handleNavigateToShopCategory}
                onNavigateToProduct={handleNavigateToProduct}
              />
            )}

            {currentView === "shop" && (
              <ShopView
                onNavigateToProduct={handleNavigateToProduct}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                selectedCategory={selectedCategory}
                onSetCategory={setSelectedCategory}
                filterSize={filterSize}
                onSetSize={setFilterSize}
                filterColor={filterColor}
                onSetColor={setFilterColor}
                filterFabric={filterFabric}
                onSetFabric={setFilterFabric}
              />
            )}

            {currentView === "detail" && (
              <ProductDetailView
                productId={selectedProductId}
                onNavigateToProduct={handleNavigateToProduct}
                onNavigateBack={handleNavigateBack}
                onAddToBag={handleAddToBag}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
              />
            )}

            {currentView === "wishlist" && (
              <WishlistView
                wishlistItems={wishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onMoveToBag={handleMoveToBag}
                onNavigateToProduct={handleNavigateToProduct}
                onNavigateToShop={() => handleNavigate("shop")}
              />
            )}

            {currentView === "profile" && (
              <ProfileView user={currentUser} onLogout={handleLogout} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM NAV BAR */}
      <BottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        wishlistCount={wishlistCount}
      />

      {/* CART OVERLAY PANEL DRAWER */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        onNavigateToProduct={handleNavigateToProduct}
      />

      {/* BRAND NAVIGATION SIDEBAR DRAWER (BURGER TRIGGER) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
            />
            {/* Menu Container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed left-0 top-0 bottom-0 w-full sm:w-[360px] bg-surface-container-lowest z-50 p-8 flex flex-col justify-between border-r border-outline-variant/10 font-body select-none"
              id="sidebar-panel"
            >
              <div className="space-y-12">
                {/* Header title */}
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                  <h3 className="font-headline text-2xl tracking-[0.25em] font-bold text-primary">
                    LUMIERE
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-surface-container text-outline hover:text-primary transition-all cursor-pointer"
                    id="close-sidebar-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col space-y-6 text-left">
                  <button
                    onClick={() => handleNavigate("home")}
                    className={`flex items-center space-x-4 text-sm font-label uppercase tracking-[0.2em] py-2 text-left cursor-pointer transition-all ${
                      currentView === "home" ? "text-primary font-bold pl-2" : "text-outline hover:text-primary"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>The Lookbook</span>
                  </button>

                  <button
                    onClick={() => handleNavigate("shop")}
                    className={`flex items-center space-x-4 text-sm font-label uppercase tracking-[0.2em] py-2 text-left cursor-pointer transition-all ${
                      currentView === "shop" || currentView === "detail" ? "text-primary font-bold pl-2" : "text-outline hover:text-primary"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>L'Essence Catalog</span>
                  </button>

                  <button
                    onClick={() => handleNavigate("wishlist")}
                    className={`flex items-center space-x-4 text-sm font-label uppercase tracking-[0.2em] py-2 text-left cursor-pointer transition-all ${
                      currentView === "wishlist" ? "text-primary font-bold pl-2" : "text-outline hover:text-primary"
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>Curated Wishlist ({wishlistCount})</span>
                  </button>

                  <button
                    onClick={() => handleNavigate("profile")}
                    className={`flex items-center space-x-4 text-sm font-label uppercase tracking-[0.2em] py-2 text-left cursor-pointer transition-all ${
                      currentView === "profile" ? "text-primary font-bold pl-2" : "text-outline hover:text-primary"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Client Closet</span>
                  </button>
                </nav>
              </div>

              {/* Sidebar footer brand message */}
              <div className="space-y-4 pt-10 border-t border-outline-variant/10 text-outline">
                <p className="text-[11px] font-headline italic leading-relaxed">
                  "Fashion is how we present our souls to the world."
                </p>
                <p className="text-[9px] font-label uppercase tracking-widest">
                  © 2026 LUMIERE STUDIO. ALL RIGHTS RESERVED.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CHECKOUT SUCCESS DIALOG MODAL */}
      <AnimatePresence>
        {checkoutSuccess && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 select-none"
            />
            {/* Success Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-surface z-50 p-8 shadow-2xl border border-outline-variant/20 text-center font-body select-none"
              id="checkout-success-modal"
            >
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 stroke-[1.5]" />
              </div>

              <h3 className="font-headline text-2xl italic mb-1">Order Confirmed</h3>

              {/* Order ID */}
              <p className="text-[10px] font-label uppercase tracking-widest text-outline mb-4">
                Order <span className="text-primary font-bold">{currentOrderId}</span>
              </p>

              <p className="text-xs text-outline leading-relaxed tracking-wide mb-5">
                Thank you for your order. We are preparing your curated garments for priority
                carbon-neutral dispatch from our Lombardy warehouse.
              </p>

              {/* Order Total */}
              <div className="flex justify-between items-center px-4 py-3 bg-surface-container-low border border-outline-variant/15 mb-3">
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">Order Total</span>
                <span className="font-headline text-lg font-bold">${currentOrderTotal.toLocaleString()}</span>
              </div>

              {/* Delivery Address Summary */}
              {currentOrderAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/15 mb-5 text-left"
                >
                  <p className="font-label text-[9px] uppercase tracking-widest text-outline mb-2 flex items-center gap-1.5">
                    <span>📦</span> Delivery Address
                  </p>
                  <p className="text-xs font-medium text-on-surface leading-relaxed">
                    {currentOrderAddress.fullName}
                  </p>
                  <p className="text-[11px] text-outline leading-relaxed mt-0.5">
                    {currentOrderAddress.addressLine1}
                    {currentOrderAddress.addressLine2 && `, ${currentOrderAddress.addressLine2}`}
                  </p>
                  <p className="text-[11px] text-outline">
                    {currentOrderAddress.city} — {currentOrderAddress.pincode}, {currentOrderAddress.state}
                  </p>
                  <p className="text-[11px] text-outline mt-0.5">📞 {currentOrderAddress.phone}</p>
                </motion.div>
              )}

              {/* Email Status Block */}
              <div className="mb-6">
                {emailStatus === "sending" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-[11px] font-label uppercase tracking-widest text-outline"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Sending confirmation to <strong>{currentUser?.email}</strong>…</span>
                  </motion.div>
                )}
                {emailStatus === "sent" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-[11px] font-label uppercase tracking-widest text-green-600"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Confirmation email sent to <strong>{currentUser?.email}</strong></span>
                  </motion.div>
                )}
                {emailStatus === "failed" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-[11px] font-label uppercase tracking-widest text-amber-600"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Email not sent — check your EmailJS credentials in .env.local</span>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleCloseCheckoutSuccess}
                className="w-full bg-primary text-on-primary py-4 font-label text-xs uppercase tracking-widest hover:bg-primary-fixed transition-colors cursor-pointer flex items-center justify-center gap-2 group"
                id="close-success-modal-btn"
              >
                <span>Continue Curation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
