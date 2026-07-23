export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  description: string;
  material: string;
  origin: string;
  sizes: string[];
  categories: string[];
  mainImage: string;
  galleryImages?: string[];
  sustainability: string;
  careInstructions: string;
  color: string;
  fabric: string;
}

export interface Category {
  name: string;
  displayName: string;
  thumbnailImage: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  dateAdded: string;
}

/**
 * Stored in lumiere_users — contains hashed password.
 * NEVER expose this object to component state or session.
 */
export interface StoredUser {
  name: string;
  email: string;
  hashedPassword: string; // SHA-256 hash — plain text is never stored
  joinedAt: string;
}

/**
 * Safe session object — no password ever.
 * This is what components receive and what gets saved in session.
 */
export interface LoggedInUser {
  name: string;
  email: string;
  joinedAt: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  orderDate: string;
  deliveryAddress: DeliveryAddress;
}

