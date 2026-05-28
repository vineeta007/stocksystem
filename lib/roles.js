// lib/roles.js
// Central role & permission definitions for StockSystem
// Import this anywhere you need to check access

export const ROLES = {
  ADMIN: 'admin',
  AFTER_SALES_1: 'after_sales_1',
  AFTER_SALES_2: 'after_sales_2',
  FINANCE: 'finance',
  FINANCE_ADMIN: 'finance_admin',
  DIRECTOR: 'director',
  LOGISTIC: 'logistic',
  ADMIN_BACKUP: 'admin_backup',
};

// All available permissions in the system
export const PERMISSIONS = {
  VIEW_ALL: 'view_all',               // View all data (every role has this)
  EDIT_CLIENTS: 'edit_clients',       // Add/edit client details
  EDIT_BAST: 'edit_bast',             // Input BAST dates (Asha only)
  EDIT_STOCK_IN: 'edit_stock_in',     // Stock in
  EDIT_STOCK_OUT: 'edit_stock_out',   // Stock out
  EDIT_MAINTENANCE: 'edit_maintenance', // Input maintenance actual dates (Puji/Sari)
  VIEW_REPORTS: 'view_reports',       // Reports section
  EDIT_TRANSACTIONS: 'edit_transactions', // Finance transactions
  EDIT_SETTINGS: 'edit_settings',     // System settings (admin only)
  VIEW_ALL_PRODUCTS: 'view_all_products', // All product types
  VIEW_WAREHOUSE_PRODUCTS: 'view_warehouse_products', // Warehouse-only product types
};

// Map each role to its allowed permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.EDIT_BAST,
    PERMISSIONS.EDIT_STOCK_IN,
    PERMISSIONS.EDIT_STOCK_OUT,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_TRANSACTIONS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
  [ROLES.AFTER_SALES_1]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
  [ROLES.AFTER_SALES_2]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
  [ROLES.FINANCE]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_STOCK_IN,
    PERMISSIONS.EDIT_STOCK_OUT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_TRANSACTIONS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
  [ROLES.FINANCE_ADMIN]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_STOCK_IN,
    PERMISSIONS.EDIT_STOCK_OUT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
  [ROLES.DIRECTOR]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.EDIT_BAST,
    PERMISSIONS.EDIT_STOCK_IN,
    PERMISSIONS.EDIT_STOCK_OUT,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_TRANSACTIONS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
  [ROLES.LOGISTIC]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.VIEW_WAREHOUSE_PRODUCTS,
  ],
  [ROLES.ADMIN_BACKUP]: [
    PERMISSIONS.VIEW_ALL,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.EDIT_BAST,
    PERMISSIONS.EDIT_STOCK_IN,
    PERMISSIONS.EDIT_STOCK_OUT,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_TRANSACTIONS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.VIEW_ALL_PRODUCTS,
  ],
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Check if a role has ALL of the given permissions
 * @param {string} role
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the given permissions
 * @param {string} role
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  return permissions.some((p) => hasPermission(role, p));
}