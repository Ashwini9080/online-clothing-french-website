const getEnv = (key: string, fallback = "") => {
  const value = import.meta.env[key] as string | undefined;
  return value && value.trim() ? value : fallback;
};

const defaultOwnerEmail = getEnv("VITE_OWNER_EMAIL", getEnv("VITE_ADMIN_EMAIL", "guptaashwini511@gmail.com"));

export const appConfig = {
  appName: getEnv("VITE_APP_NAME", "LUMIÈRE Studio"),
  apiBaseUrl: getEnv("VITE_API_URL", import.meta.env.DEV ? "http://localhost:5000" : "").replace(/\/$/, ""),
  adminEmail: getEnv("VITE_ADMIN_EMAIL", "guptaashwini511@gmail.com"),
  ownerName: getEnv("VITE_OWNER_NAME", "Ashwini"),
  ownerEmail: defaultOwnerEmail,
  ownerPassword: getEnv("VITE_OWNER_PASSWORD", "owner1234"),
  emailjs: {
    publicKey: getEnv("VITE_EMAILJS_PUBLIC_KEY", ""),
    serviceId: getEnv("VITE_EMAILJS_SERVICE_ID", ""),
    templateId: getEnv("VITE_EMAILJS_TEMPLATE_ID", ""),
  },
};

export const { appName, apiBaseUrl, adminEmail, ownerName, ownerEmail, ownerPassword, emailjs } = appConfig;
