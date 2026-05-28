// lib/users.js
// Static user list with hashed passwords (bcrypt)
// Run `node scripts/hashPasswords.js` once to generate the hash values,
// then paste them here, OR store users in MongoDB (see models/User.js).
//
// For quick start, passwords are stored as plain text below.
// Replace plainPassword with the bcrypt hash after running the seed script.

import { ROLES } from './roles';

export const USERS = [
  {
    username: 'asha',
    displayName: 'Asha',
    role: ROLES.ADMIN,
    // Change this to bcrypt hash in production
    password: 'Admin@2026',
    initials: 'AS',
  },
  {
    username: 'puji',
    displayName: 'Puji',
    role: ROLES.AFTER_SALES_1,
    password: 'Puji@AS1',
    initials: 'PJ',
  },
  {
    username: 'sari',
    displayName: 'Sari',
    role: ROLES.AFTER_SALES_2,
    password: 'Sari@AS2',
    initials: 'SR',
  },
  {
    username: 'finance',
    displayName: 'Finance',
    role: ROLES.FINANCE,
    password: 'Finance@26',
    initials: 'FN',
  },
  {
    username: 'cindy',
    displayName: 'Cindy',
    role: ROLES.FINANCE_ADMIN,
    password: 'Cindy@Fin1',
    initials: 'CY',
  },
  {
    username: 'sunny',
    displayName: 'Sunny',
    role: ROLES.DIRECTOR,
    password: 'Sunny@Dir1',
    initials: 'SN',
  },
  {
    username: 'logistic',
    displayName: 'Logistic',
    role: ROLES.LOGISTIC,
    password: 'Log@Stock1',
    initials: 'LG',
  },
  {
    username: 'backup',
    displayName: 'Backup Admin',
    role: ROLES.ADMIN_BACKUP,
    password: 'Backup@Adm1',
    initials: 'BK',
  },
];

/**
 * Find a user by username (case-insensitive)
 * @param {string} username
 * @returns {object|undefined}
 */
export function findUserByUsername(username) {
  return USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}