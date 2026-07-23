import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Minus, Plus, Trash2, ArrowRight, ShoppingBag,
  MapPin, Phone, User, ChevronLeft, Home, Navigation, Sparkles
} from "lucide-react";
import { CartItem } from "../types";
import { sanitizeText } from "../services/security";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, change: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onCheckout: (total: number, address: DeliveryAddress) => void;
  onNavigateToProduct: (productId: string) => void;
}

type CheckoutStep = "cart" | "address";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry",
];

const emptyAddress: DeliveryAddress = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", pincode: "",
};

// InputField component outside CartDrawer to prevent re-mount on keystroke
interface InputFieldProps {
  label: string;
  field: keyof DeliveryAddress;
  placeholder: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  address: DeliveryAddress;
  errors: Partial<DeliveryAddress>;
  onUpdate: (field: keyof DeliveryAddress, value: string) => void;
}

function InputField({ label, field, placeholder, type = "text", required = true, maxLength = 100, address, errors, onUpdate }: InputFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-label uppercase tracking-widest text-outline/50 mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        value={address[field]}
        onChange={(e) => onUpdate(field, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full text-sm px-4 py-3.5 outline-none transition-all font-body placeholder:text-outline/25 ${
          errors[field]
            ? "border border-red-400/40 bg-red-500/5"
            : "border border-outline-variant/15 focus:border-primary/50 bg-surface-container-lowest/60 focus:bg-surface-container-lowest"
        }`}
        style={{ borderRadius: "3px" }}
      />
      {errors[field] && (
        <p className="text-[10px] text-red-400/80 mt-1 tracking-wide">{errors[field]}</p>
      )}
    </div>
  );
}

export default function CartDrawer({
  isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onNavigateToProduct,
}: CartDrawerProps) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [address, setAddress] = useState<DeliveryAddress>(emptyAddress);
  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep("cart"); setErrors({}); }, 400);
  };

  const updateField = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateAddress = (): boolean => {
    const newErrors: Partial<DeliveryAddress> = {};
    if (!address.fullName.trim() || address.fullName.trim().length < 2) newErrors.fullName = "Poora naam daalein";
    if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\s/g, ""))) newErrors.phone = "Valid 10-digit mobile number daalein";
    if (!address.addressLine1.trim() || address.addressLine1.trim().length < 5) newErrors.addressLine1 = "Ghar ka address daalein";
    if (!address.city.trim() || address.city.trim().length < 2) newErrors.city = "Sheher ka naam daalein";
    if (!address.state) newErrors.state = "State chunein";
    if (!/^\d{6}$/.test(address.pincode.trim())) newErrors.pincode = "6-digit PIN code daalein";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateAddress()) return;
    const cleanAddress: DeliveryAddress = {
      fullName: sanitizeText(address.fullName),
      phone: address.phone.replace(/\s/g, "").slice(0, 15),
      addressLine1: sanitizeText(address.addressLine1),
      addressLine2: sanitizeText(address.addressLine2),
      city: sanitizeText(address.city),
      state: address.state,
      pincode: address.pincode.trim(),
    };
    onCheckout(subtotal, cleanAddress);
    setTimeout(() => { setStep("cart"); setAddress(emptyAddress); setErrors({}); }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 cursor-pointer"
            id="cart-backdrop"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-50 shadow-2xl flex flex-col font-body"
            style={{
              background: "linear-gradient(180deg, #0f0d1a 0%, #0d0b18 100%)",
              borderLeft: "1px solid rgba(167,139,250,0.15)",
            }}
            id="cart-panel"
          >
            {/* Gold shimmer top accent */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.8), transparent)" }} />

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {step === "address" && (
                  <motion.button
                    whileHover={{ x: -2 }}
                    onClick={() => { setStep("cart"); setErrors({}); }}
                    className="p-1.5 text-outline hover:text-primary transition-colors cursor-pointer"
                    id="back-to-cart-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  {step === "cart" ? (
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  ) : (
                    <MapPin className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-headline text-base tracking-wider">
                    {step === "cart" ? `Shopping Bag (${totalItems})` : "Delivery Address"}
                  </h2>
                  {step === "address" && (
                    <p className="text-[10px] text-outline/40 tracking-wider mt-0.5">Step 2 of 2</p>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer"
                id="close-cart-btn"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Progress bar */}
            <div className="h-px bg-surface-container-low flex-shrink-0">
              <motion.div
                className="h-full"
                animate={{ width: step === "cart" ? "50%" : "100%" }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{ background: "linear-gradient(90deg, #a78bfa, #c9a96e)" }}
              />
            </div>

            {/* Step indicator dots */}
            <div className="flex items-center justify-center gap-2 py-3 flex-shrink-0">
              {["Bag", "Address"].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    (i === 0 && step === "cart") || (i === 1 && step === "address")
                      ? "bg-primary scale-125" : "bg-outline/20"
                  }`} />
                  <span className={`text-[9px] font-label uppercase tracking-widest transition-colors ${
                    (i === 0 && step === "cart") || (i === 1 && step === "address")
                      ? "text-primary" : "text-outline/30"
                  }`}>{label}</span>
                  {i === 0 && <div className="w-6 h-px bg-outline/15 ml-1" />}
                </div>
              ))}
            </div>

            {/* ── STEP 1: CART ── */}
            <AnimatePresence mode="wait">
              {step === "cart" && (
                <motion.div
                  key="cart-step"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 styled-scrollbar">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-20">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}
                        >
                          <ShoppingBag className="w-7 h-7 text-outline/30" />
                        </motion.div>
                        <h3 className="font-headline text-2xl italic">Your bag is empty</h3>
                        <p className="text-xs text-outline/50 tracking-wider max-w-[260px] leading-relaxed">
                          Explore our seasonal lookbook and discover custom garments designed for quiet elegance.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={handleClose}
                          className="mt-2 px-10 py-4 font-label text-xs uppercase tracking-widest btn-luxury"
                          style={{ background: "linear-gradient(135deg, #a78bfa, #7c5ce1)", color: "#f5f0ff" }}
                          id="cart-shop-now-btn"
                        >
                          Start Exploring
                        </motion.button>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {cartItems.map((item, index) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40, scale: 0.95 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            key={`${item.product.id}-${item.selectedSize}`}
                            className="flex gap-4 p-4 border border-outline-variant/10 hover:border-outline-variant/25 transition-all group"
                            style={{ background: "rgba(14,12,21,0.6)" }}
                          >
                            {/* Product thumbnail */}
                            <div
                              onClick={() => { onNavigateToProduct(item.product.id); handleClose(); }}
                              className="w-20 h-24 overflow-hidden flex-shrink-0 cursor-pointer border border-outline-variant/10 group-hover:border-primary/20 transition-colors"
                            >
                              <img
                                src={item.product.mainImage}
                                alt={item.product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4
                                    onClick={() => { onNavigateToProduct(item.product.id); handleClose(); }}
                                    className="font-headline text-sm font-semibold hover:text-primary transition-colors cursor-pointer leading-tight truncate"
                                  >
                                    {item.product.title}
                                  </h4>
                                  <span className="font-body text-sm font-semibold flex-shrink-0"
                                    style={{
                                      background: "linear-gradient(135deg, #a78bfa, #c9a96e)",
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                    }}>
                                    ${(item.product.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                                <p className="font-label text-[9px] text-outline/50 uppercase tracking-widest mt-1">{item.product.subtitle}</p>
                                <span className="inline-block mt-2 px-2.5 py-1 text-[9px] font-label uppercase tracking-wider text-primary/80 border border-primary/20"
                                  style={{ background: "rgba(167,139,250,0.06)" }}>
                                  SIZE: {item.selectedSize}
                                </span>
                              </div>

                              {/* Quantity + Remove */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center border border-outline-variant/20"
                                  style={{ background: "rgba(14,12,21,0.5)" }}>
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                                    className="px-2.5 py-2 text-outline hover:text-primary transition-colors cursor-pointer"
                                    id={`qty-minus-${item.product.id}`}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </motion.button>
                                  <span className="px-3 text-xs font-label font-bold select-none min-w-[28px] text-center">
                                    {item.quantity}
                                  </span>
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                                    className="px-2.5 py-2 text-outline hover:text-primary transition-colors cursor-pointer"
                                    id={`qty-plus-${item.product.id}`}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </motion.button>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                                  className="p-2 text-outline/40 hover:text-red-400 transition-colors cursor-pointer"
                                  id={`remove-item-${item.product.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="p-6 border-t border-outline-variant/10 space-y-5 flex-shrink-0"
                      style={{ background: "rgba(12,10,20,0.8)" }}>
                      <div className="space-y-2.5">
                        {[
                          { label: "Shipping", value: "Complimentary", highlight: true },
                          { label: "Taxes", value: "At Checkout", highlight: false },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className="flex justify-between text-[11px] font-label uppercase tracking-wider">
                            <span className="text-outline/50">{label}</span>
                            <span className={highlight ? "text-primary" : "text-outline/40"}>{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-4 border-t border-outline-variant/10 items-center">
                          <span className="font-label text-[11px] uppercase tracking-widest text-outline/60">Estimated Total</span>
                          <span className="font-headline text-xl font-bold"
                            style={{
                              background: "linear-gradient(135deg, #a78bfa, #c9a96e)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}>
                            ${subtotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={() => setStep("address")}
                        className="w-full py-5 px-6 font-label text-xs uppercase tracking-[0.3em] btn-luxury flex items-center justify-center gap-3 cursor-pointer group"
                        style={{
                          background: "linear-gradient(135deg, #a78bfa 0%, #7c5ce1 100%)",
                          color: "#f5f0ff",
                          boxShadow: "0 8px 32px rgba(167,139,250,0.35)",
                        }}
                        id="checkout-btn"
                      >
                        <span>Enter Delivery Address</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                      <p className="text-center font-label text-[9px] text-outline/30 tracking-wider flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400/30" />
                        Free express carbon-neutral shipping on all curated orders
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2: ADDRESS ── */}
              {step === "address" && (
                <motion.div
                  key="address-step"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 styled-scrollbar">
                    {/* Order mini summary */}
                    <div className="flex justify-between items-center p-4 border border-outline-variant/10"
                      style={{ background: "rgba(167,139,250,0.04)" }}>
                      <div>
                        <p className="text-[10px] font-label uppercase tracking-widest text-outline/50">
                          {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </p>
                        <p className="font-headline text-base font-bold mt-0.5">${subtotal.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-label uppercase tracking-widest text-outline/50">Shipping</p>
                        <p className="text-xs text-primary font-medium mt-0.5">Free ✦</p>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(167,139,250,0.1)" }}>
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <h3 className="text-[10px] font-label uppercase tracking-widest font-bold text-primary">Contact Details</h3>
                      </div>
                      <InputField label="Poora Naam" field="fullName" placeholder="Jaise: Rahul Sharma" maxLength={60} address={address} errors={errors} onUpdate={updateField} />
                      <InputField label="Mobile Number" field="phone" placeholder="10-digit mobile number" type="tel" maxLength={10} address={address} errors={errors} onUpdate={updateField} />
                    </div>

                    {/* Delivery address */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(167,139,250,0.1)" }}>
                          <Home className="w-3 h-3 text-primary" />
                        </div>
                        <h3 className="text-[10px] font-label uppercase tracking-widest font-bold text-primary">Delivery Address</h3>
                      </div>
                      <InputField label="Ghar / Flat / Office Number" field="addressLine1" placeholder="Jaise: Flat 4B, Sunshine Apartments" maxLength={150} address={address} errors={errors} onUpdate={updateField} />
                      <InputField label="Area / Street / Landmark" field="addressLine2" placeholder="Jaise: Near SBI Bank, MG Road" required={false} maxLength={150} address={address} errors={errors} onUpdate={updateField} />
                      <div className="grid grid-cols-2 gap-3">
                        <InputField label="City" field="city" placeholder="Jaise: Mumbai" maxLength={60} address={address} errors={errors} onUpdate={updateField} />
                        <InputField label="PIN Code" field="pincode" placeholder="6-digit PIN" type="tel" maxLength={6} address={address} errors={errors} onUpdate={updateField} />
                      </div>
                      {/* State */}
                      <div>
                        <label className="block text-[10px] font-label uppercase tracking-widest text-outline/50 mb-1.5">
                          State <span className="text-primary">*</span>
                        </label>
                        <select
                          value={address.state}
                          onChange={(e) => updateField("state", e.target.value)}
                          className={`w-full text-sm px-4 py-3.5 outline-none transition-all font-body ${
                            errors.state ? "border border-red-400/40 bg-red-500/5" : "border border-outline-variant/15 bg-surface-container-lowest/60 focus:border-primary/50"
                          }`}
                          style={{ borderRadius: "3px" }}
                          id="state-select"
                        >
                          <option value="" className="bg-surface">State chunein…</option>
                          {INDIA_STATES.map((s) => (
                            <option key={s} value={s} className="bg-surface">{s}</option>
                          ))}
                        </select>
                        {errors.state && <p className="text-[10px] text-red-400/80 mt-1 tracking-wide">{errors.state}</p>}
                      </div>
                    </div>

                    {/* Delivery note */}
                    <div className="flex items-start gap-3 p-4 border border-primary/10"
                      style={{ background: "rgba(167,139,250,0.04)" }}>
                      <Navigation className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-outline/60 leading-relaxed tracking-wide">
                        Aapka order 5–7 business days mein deliver hoga. Koi bhi sawaal ke liye humse contact karein.
                      </p>
                    </div>
                  </div>

                  {/* Place order */}
                  <div className="p-6 border-t border-outline-variant/10 space-y-3 flex-shrink-0"
                    style={{ background: "rgba(12,10,20,0.8)" }}>
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={handlePlaceOrder}
                      className="w-full py-5 px-6 font-label text-xs uppercase tracking-[0.3em] btn-luxury flex items-center justify-center gap-3 cursor-pointer group"
                      style={{
                        background: "linear-gradient(135deg, #a78bfa 0%, #7c5ce1 100%)",
                        color: "#f5f0ff",
                        boxShadow: "0 8px 32px rgba(167,139,250,0.35)",
                      }}
                      id="place-order-btn"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Place Order — ${subtotal.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <p className="text-center font-label text-[9px] text-outline/30 tracking-wider">
                      Order place karne se pehle address verify karein.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
