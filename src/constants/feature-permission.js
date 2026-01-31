export const FeaturePermission = Object.freeze({
  PRODUCTS: "PRODUCTS",
  ORDERS: "ORDERS",
  STEADFAST: "STEADFAST",
  PATHAO: "PATHAO",
  REDX: "REDX",
  NOTIFICATIONS: "NOTIFICATIONS",
  EMAIL_NOTIFICATIONS: "EMAIL_NOTIFICATIONS",
  WHATSAPP_NOTIFICATIONS: "WHATSAPP_NOTIFICATIONS",
  SMS_NOTIFICATIONS: "SMS_NOTIFICATIONS",
  CATEGORY: "CATEGORY",
  CUSTOMERS: "CUSTOMERS",
  REPORTS: "REPORTS",
  INVENTORY: "INVENTORY",
  SETTINGS: "SETTINGS",
  STAFF: "STAFF",
  PROMOCODES: "PROMOCODES",
  HELP: "HELP",
  BANNERS: "BANNERS",
  FRUAD_CHECKER: "FRUAD_CHECKER",
  MANAGE_USERS: "MANAGE_USERS",
  DASHBOARD: "DASHBOARD",
  REVENUE: "REVENUE",
  NEW_CUSTOMERS: "NEW_CUSTOMERS",
  REPEAT_PURCHASE_RATE: "REPEAT_PURCHASE_RATE",
  AVERAGE_ORDER_VALUE: "AVERAGE_ORDER_VALUE",
  STATS: "STATS",
  SMS_CONFIGURATION: "SMS_CONFIGURATION",
  EMAIL_CONFIGURATION: "EMAIL_CONFIGURATION",
  PAYMENT_METHODS: "PAYMENT_METHODS",
  PAYMENT_GATEWAYS: "PAYMENT_GATEWAYS",
  PAYMENT_STATUS: "PAYMENT_STATUS",
  PAYMENT_TRANSACTIONS: "PAYMENT_TRANSACTIONS",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  TERMS_CONDITIONS: "TERMS_CONDITIONS",
  REFUND_POLICY: "REFUND_POLICY",
  ACTIVITY_LOGS: "ACTIVITY_LOGS",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  TERMS_CONDITIONS: "TERMS_CONDITIONS",
  REFUND_POLICY: "REFUND_POLICY",
  LOG_ACTIVITY: "LOG_ACTIVITY",
});

export const hasPermission = (user, permission) => {
  if (!permission) return true;
  
  // Check user.permissions first (for EMPLOYEE role and direct permissions)
  // Then fall back to user.package.features (for SYSTEM_OWNER role)
  const directPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const packageFeatures = Array.isArray(user?.package?.features) ? user.package.features : [];
  
  // Combine both sources and check if permission exists
  const allPermissions = [...new Set([...directPermissions, ...packageFeatures])];
  return allPermissions.includes(permission);
};


