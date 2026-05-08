import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

const STOCKS_COLLECTION = 'stocks';
const TRANSACTIONS_COLLECTION = 'stockTransactions';

// ─── READ ────────────────────────────────────────────────────────────────────

/** Get all stock items */
export const getAllStocks = async () => {
  const q = query(collection(db, STOCKS_COLLECTION), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/** Get a single stock item by ID */
export const getStockById = async (stockId) => {
  const ref = doc(db, STOCKS_COLLECTION, stockId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error(`Stock item "${stockId}" not found.`);
  return { id: snapshot.id, ...snapshot.data() };
};

/** Get stocks filtered by category */
export const getStocksByCategory = async (category) => {
  const q = query(
    collection(db, STOCKS_COLLECTION),
    where('category', '==', category),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/** Get stocks with quantity below a threshold (low stock alert) */
export const getLowStocks = async (threshold = 10) => {
  const q = query(
    collection(db, STOCKS_COLLECTION),
    where('quantity', '<=', threshold)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ─── CREATE ──────────────────────────────────────────────────────────────────

/**
 * Add a new stock item
 * @param {{ name: string, category: string, quantity: number, unit: string, price: number, description?: string }} stockData
 */
export const addStock = async (stockData) => {
  const payload = {
    name: stockData.name,
    category: stockData.category ?? 'Uncategorized',
    quantity: stockData.quantity ?? 0,
    unit: stockData.unit ?? 'pcs',
    price: stockData.price ?? 0,
    description: stockData.description ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, STOCKS_COLLECTION), payload);
  return { id: ref.id, ...payload };
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

/**
 * Update stock item details (non-quantity fields)
 * @param {string} stockId
 * @param {Partial<{ name, category, unit, price, description }>} updates
 */
export const updateStock = async (stockId, updates) => {
  const ref = doc(db, STOCKS_COLLECTION, stockId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

/**
 * Add stock quantity (stock-in) — uses a transaction to stay consistent
 * @param {string} stockId
 * @param {number} quantity  - amount to add (positive number)
 * @param {string} [note]    - optional reason / supplier note
 */
export const stockIn = async (stockId, quantity, note = '') => {
  if (quantity <= 0) throw new Error('Quantity must be a positive number.');

  await runTransaction(db, async (transaction) => {
    const stockRef = doc(db, STOCKS_COLLECTION, stockId);
    const stockSnap = await transaction.get(stockRef);
    if (!stockSnap.exists()) throw new Error('Stock item not found.');

    transaction.update(stockRef, {
      quantity: increment(quantity),
      updatedAt: serverTimestamp(),
    });

    const txRef = doc(collection(db, TRANSACTIONS_COLLECTION));
    transaction.set(txRef, {
      stockId,
      stockName: stockSnap.data().name,
      type: 'IN',
      quantity,
      note,
      createdAt: serverTimestamp(),
    });
  });
};

/**
 * Remove stock quantity (stock-out) — prevents going below zero
 * @param {string} stockId
 * @param {number} quantity  - amount to remove (positive number)
 * @param {string} [note]    - optional reason / order reference
 */
export const stockOut = async (stockId, quantity, note = '') => {
  if (quantity <= 0) throw new Error('Quantity must be a positive number.');

  await runTransaction(db, async (transaction) => {
    const stockRef = doc(db, STOCKS_COLLECTION, stockId);
    const stockSnap = await transaction.get(stockRef);
    if (!stockSnap.exists()) throw new Error('Stock item not found.');

    const current = stockSnap.data().quantity;
    if (current < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${current}, Requested: ${quantity}`
      );
    }

    transaction.update(stockRef, {
      quantity: increment(-quantity),
      updatedAt: serverTimestamp(),
    });

    const txRef = doc(collection(db, TRANSACTIONS_COLLECTION));
    transaction.set(txRef, {
      stockId,
      stockName: stockSnap.data().name,
      type: 'OUT',
      quantity,
      note,
      createdAt: serverTimestamp(),
    });
  });
};

/**
 * Directly set quantity (e.g. after a manual count / audit)
 * @param {string} stockId
 * @param {number} newQuantity
 */
export const adjustStockQuantity = async (stockId, newQuantity) => {
  if (newQuantity < 0) throw new Error('Quantity cannot be negative.');
  const ref = doc(db, STOCKS_COLLECTION, stockId);
  await updateDoc(ref, { quantity: newQuantity, updatedAt: serverTimestamp() });
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

/** Permanently delete a stock item */
export const deleteStock = async (stockId) => {
  const ref = doc(db, STOCKS_COLLECTION, stockId);
  await deleteDoc(ref);
};

// ─── TRANSACTIONS HISTORY ────────────────────────────────────────────────────

/** Get all transactions for a specific stock item */
export const getStockTransactions = async (stockId) => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('stockId', '==', stockId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/** Get all transactions (full log) */
export const getAllTransactions = async () => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};