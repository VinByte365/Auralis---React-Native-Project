import * as SQLite from "expo-sqlite";

const dbPromise = SQLite.openDatabaseAsync("auralis.db");
let initPromise = null;

const initCartTable = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await dbPromise;
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS cart_items (
          productId TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          image TEXT,
          quantity INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }

  return initPromise;
};

const mapCartRows = (rows = []) =>
  rows.map((row) => ({
    productId: String(row.productId),
    name: String(row.name),
    price: Number(row.price || 0),
    image: row.image || null,
    quantity: Number(row.quantity || 0),
  }));

export const getStoredCart = async () => {
  const db = await initCartTable();
  const rows = await db.getAllAsync(
    "SELECT productId, name, price, image, quantity FROM cart_items ORDER BY rowid DESC",
  );
  return mapCartRows(rows);
};

export const saveStoredCart = async (items = []) => {
  const db = await initCartTable();

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM cart_items");

    for (const item of items) {
      await db.runAsync(
        `INSERT INTO cart_items (productId, name, price, image, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [
          String(item.productId),
          String(item.name || ""),
          Number(item.price || 0),
          item.image || null,
          Number(item.quantity || 0),
        ],
      );
    }
  });

  return getStoredCart();
};

export const clearStoredCart = async () => {
  const db = await initCartTable();
  await db.runAsync("DELETE FROM cart_items");
  return true;
};

export const upsertCartItem = async (product, quantity = 1) => {
  const db = await initCartTable();
  const normalizedQuantity = Number(quantity || 0);
  const productId = String(product._id);

  if (normalizedQuantity <= 0) {
    await db.runAsync("DELETE FROM cart_items WHERE productId = ?", [
      productId,
    ]);
    return getStoredCart();
  }

  const name = String(product.name || "");
  const price = Number(
    product.saleActive && product.salePrice
      ? product.salePrice
      : product.price || 0,
  );
  const image = product.images?.[0]?.url || null;

  await db.runAsync(
    `INSERT INTO cart_items (productId, name, price, image, quantity)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(productId) DO UPDATE SET
       name = excluded.name,
       price = excluded.price,
       image = excluded.image,
       quantity = excluded.quantity`,
    [productId, name, price, image, normalizedQuantity],
  );

  return getStoredCart();
};

export const removeStoredCartItem = async (productId) => {
  const db = await initCartTable();
  await db.runAsync("DELETE FROM cart_items WHERE productId = ?", [
    String(productId),
  ]);
  return getStoredCart();
};
