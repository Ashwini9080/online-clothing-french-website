import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { PlusCircle, Trash2, ShieldCheck, ArrowLeft, ImagePlus } from "lucide-react";
import { Product } from "../types";

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (productId: string) => void;
  onBack: () => void;
}

const createPlaceholderImage = (title: string) => {
  const safeTitle = encodeURIComponent(title || "new-product");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect width="100%" height="100%" rx="36" fill="#111111"/>
      <rect x="60" y="60" width="780" height="1080" rx="28" fill="#1c1c1c" stroke="#7c5ce1" stroke-width="4"/>
      <circle cx="450" cy="420" r="180" fill="#a78bfa" opacity="0.24"/>
      <rect x="220" y="620" width="460" height="220" rx="24" fill="#f5efe3"/>
      <text x="450" y="735" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#111111">${safeTitle}</text>
      <text x="450" y="790" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#666666">New Collection Piece</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";

export default function AdminPanel({ products, onAddProduct, onRemoveProduct, onBack }: AdminPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    price: "299",
    description: "",
    material: "Premium Fabric",
    origin: "Italy",
    categories: "Accessories",
    sizes: "ONE SIZE",
    color: "MONO",
    fabric: "COTTON",
    image: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a product title.");
      return;
    }

    const title = form.title.trim();
    const subtitle = form.subtitle.trim() || "New Arrival";
    const price = Number(form.price) || 299;
    const categories = form.categories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const sizes = form.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const imageUrl = form.image.trim() || createPlaceholderImage(title);

    const newProduct: Product = {
      id: `${slugify(title)}-${Date.now()}`,
      title,
      subtitle,
      price,
      description: form.description.trim() || "A freshly curated addition to the collection.",
      material: form.material.trim() || "Premium Fabric",
      origin: form.origin.trim() || "Italy",
      sizes: sizes.length ? sizes : ["ONE SIZE"],
      categories: categories.length ? categories : ["Accessories"],
      mainImage: imageUrl,
      galleryImages: [imageUrl, imageUrl, imageUrl, imageUrl],
      sustainability: "Crafted with responsibly sourced materials and thoughtful finishing details.",
      careInstructions: "Store in a cool, dry place and handle with care.",
      color: form.color.trim().toUpperCase() || "MONO",
      fabric: form.fabric.trim().toUpperCase() || "COTTON",
    };

    onAddProduct(newProduct);
    setForm({
      title: "",
      subtitle: "",
      price: "299",
      description: "",
      material: "Premium Fabric",
      origin: "Italy",
      categories: "Accessories",
      sizes: "ONE SIZE",
      color: "MONO",
      fabric: "COTTON",
      image: "",
    });
    setError("");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 font-body">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.35em] text-outline/50 mb-2">Admin Controls</p>
          <h2 className="font-headline text-3xl sm:text-4xl">Product Management</h2>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-outline-variant/20 text-outline hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6"
        >
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-label text-[10px] uppercase tracking-[0.3em]">Add a new product</span>
          </div>

          {error && <p className="text-sm text-amber-600">{error}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Product title" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} placeholder="Subtitle" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="Price" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.material} onChange={(e) => handleChange("material", e.target.value)} placeholder="Material" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.origin} onChange={(e) => handleChange("origin", e.target.value)} placeholder="Origin" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.categories} onChange={(e) => handleChange("categories", e.target.value)} placeholder="Categories (comma separated)" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.sizes} onChange={(e) => handleChange("sizes", e.target.value)} placeholder="Sizes (comma separated)" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.color} onChange={(e) => handleChange("color", e.target.value)} placeholder="Color" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
            <input value={form.fabric} onChange={(e) => handleChange("fabric", e.target.value)} placeholder="Fabric" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-outline-variant/20 px-4 py-3 text-sm uppercase tracking-[0.25em] hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Upload image</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            <input value={form.image} onChange={(e) => handleChange("image", e.target.value)} placeholder="Or paste an image URL" className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>

          <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Description" rows={4} className="w-full border border-outline-variant/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary" />

          <button type="submit" className="flex items-center gap-2 bg-primary px-5 py-3 text-sm font-label uppercase tracking-[0.25em] text-on-primary hover:bg-primary-fixed transition-all cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </motion.form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.35em] text-outline/50 mb-4">Current catalog</p>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 border border-outline-variant/10 p-3">
                  <div>
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-xs text-outline/70">{product.subtitle}</p>
                  </div>
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.25em] text-amber-600 hover:bg-amber-50/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
