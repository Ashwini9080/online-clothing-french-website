import emailjs from "@emailjs/browser";
import { Order } from "../types";

// EmailJS configuration — values come from .env.local (never commit real keys)
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;

// Admin email — ALWAYS gets notified of every order
const ADMIN_EMAIL = "guptaashwini511@gmail.com";
const ADMIN_NAME = "Ashwini Gupta";

/**
 * Generates a unique order ID in format: LUM-YYYYMMDD-XXXXXX
 */
export function generateOrderId(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LUM-${datePart}-${randomPart}`;
}

/**
 * Formats cart items into readable text for email
 */
function formatOrderItems(order: Order): string {
  return order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.product.title}\n` +
        `   Size: ${item.selectedSize} | Qty: ${item.quantity} | Price: $${(item.product.price * item.quantity).toLocaleString()}`
    )
    .join("\n\n");
}

function formatDateIN(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Sends ONE email to ADMIN (Ashwini) with full order + customer details.
 * 
 * EMAIL FORMAT aapko milega:
 * ----------------------------
 * 🛍️ NEW ORDER — LUM-20260722-ABCDEF
 * 
 * Customer: Rahul Sharma
 * Email: rahul@gmail.com
 * Phone: —
 * 
 * Items Ordered:
 * 1. Fluid Silk Slip Dress
 *    Size: S | Qty: 1 | Price: $890
 * 
 * Total: $890
 * Date: 22 July 2026, 11:30 PM
 * ----------------------------
 */
async function sendAdminOrderAlert(order: Order): Promise<void> {
  const itemsSummary = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.product.title}\n   Size: ${item.selectedSize} | Qty: ${item.quantity} | $${(item.product.price * item.quantity).toLocaleString()}`
    )
    .join("\n\n");

  const addr = order.deliveryAddress;
  const formattedAddress = [
    addr.fullName,
    addr.phone,
    addr.addressLine1,
    addr.addressLine2 ? addr.addressLine2 : null,
    `${addr.city} - ${addr.pincode}`,
    addr.state,
  ]
    .filter(Boolean)
    .join("\n    ");

  const templateParams = {
    // To admin
    to_name:     ADMIN_NAME,
    to_email:    ADMIN_EMAIL,

    from_name:   "Lumière Studio Orders",
    reply_to:    order.customerEmail,

    // Order info
    order_id:    order.orderId,
    order_date:  formatDateIN(order.orderDate),
    order_total: `$${order.totalAmount.toLocaleString()}`,
    item_count:  order.items.reduce((acc, item) => acc + item.quantity, 0),

    // Full order details with CUSTOMER INFO + ADDRESS
    order_items: [
      `🛍️ NEW ORDER RECEIVED`,
      ``,
      `Customer Name : ${order.customerName}`,
      `Customer Email: ${order.customerEmail}`,
      ``,
      `📦 Delivery Address:`,
      `    ${formattedAddress}`,
      ``,
      `Items Ordered:`,
      itemsSummary,
      ``,
      `Order Total: $${order.totalAmount.toLocaleString()}`,
      `Order Date : ${formatDateIN(order.orderDate)}`,
    ].join("\n"),
  };

  console.log("[EmailJS] Sending admin order alert to:", ADMIN_EMAIL);
  const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
    publicKey: PUBLIC_KEY,
  });
  console.log("[EmailJS] Admin alert sent! Status:", result.status, result.text);
}

/**
 * Attempts to send a confirmation email to the CUSTOMER.
 * 
 * NOTE: This only works if your EmailJS template has "{{to_email}}" 
 * set as the dynamic "To Email" field in the template settings.
 * 
 * If customer email delivery fails, the admin still gets the full alert.
 */
async function sendCustomerConfirmation(order: Order): Promise<void> {
  const templateParams = {
    // To customer
    to_name:     order.customerName,
    to_email:    order.customerEmail,

    from_name:   "Lumière Studio",
    reply_to:    ADMIN_EMAIL, // Customer replies go to Ashwini

    order_id:    order.orderId,
    order_date:  formatDateIN(order.orderDate),
    order_total: `$${order.totalAmount.toLocaleString()}`,
    item_count:  order.items.reduce((acc, item) => acc + item.quantity, 0),

    order_items: [
      `Thank you for your order, ${order.customerName}!`,
      ``,
      `Your Order Items:`,
      formatOrderItems(order),
      ``,
      `Total: $${order.totalAmount.toLocaleString()}`,
      `Order ID: ${order.orderId}`,
      ``,
      `We will contact you shortly to confirm delivery.`,
      `For help, reply to this email or contact: ${ADMIN_EMAIL}`,
    ].join("\n"),
  };

  console.log("[EmailJS] Sending customer confirmation to:", order.customerEmail);
  const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
    publicKey: PUBLIC_KEY,
  });
  console.log("[EmailJS] Customer confirmation sent! Status:", result.status, result.text);
}

/**
 * MAIN EXPORT — Called on every checkout.
 * 
 * Strategy:
 * 1. ALWAYS send admin notification → Ashwini ko pata chalega ki order aaya
 * 2. TRY to send customer confirmation → Agar template mein {{to_email}} set hai
 *    Agar customer email fail ho toh bhi admin email guaranteed rahegi
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
    console.warn("[EmailJS] Missing credentials in .env.local — emails not sent.");
    return;
  }

  // 1. Admin notification — guaranteed, always goes to Ashwini
  try {
    await sendAdminOrderAlert(order);
    console.log("[EmailJS] ✅ Admin notified successfully.");
  } catch (err) {
    console.error("[EmailJS] ❌ Admin alert failed:", err);
  }

  // 2. Customer confirmation — only if their email is different from admin
  if (order.customerEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    try {
      await sendCustomerConfirmation(order);
      console.log("[EmailJS] ✅ Customer confirmation sent.");
    } catch (err) {
      // This failure is non-critical — admin already received the order
      console.warn(
        "[EmailJS] ⚠️ Customer email delivery failed (template may not support dynamic to_email).",
        "\nCustomer email was:", order.customerEmail,
        "\nAdmin has been notified with customer details.",
        err
      );
    }
  }
}
