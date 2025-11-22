// src/mockApi.js
const sleep = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// In-memory storage (empty by default; can be prefilled for local testing)
let linkRequests = [];
let products = [];

/**
 * Returns a mock auth token object.
 * Replace/remove this file when wiring real backend.
 */
export async function authToken(/* username, password */) {
  await sleep();
  return {
    access_token: "mock-token-abc123",
    token_type: "bearer",
    user_id: 0,
    role: "supplier_admin",
  };
}

export async function getSupplierLinks() {
  await sleep();
  return JSON.parse(JSON.stringify(linkRequests));
}

export async function updateSupplierLink(id, { status }) {
  await sleep();
  const idx = linkRequests.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Not found");
  linkRequests[idx] = { ...linkRequests[idx], status };
  return JSON.parse(JSON.stringify(linkRequests[idx]));
}

export async function getMyProducts() {
  await sleep();
  return JSON.parse(JSON.stringify(products));
}

export async function createProduct(payload) {
  await sleep();
  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const item = { id, ...payload };
  products.push(item);
  return JSON.parse(JSON.stringify(item));
}

/**
 * Utility helpers for tests/dev: populate initial demo data (optional)
 */
export function seedDemoData({ links = [], items = [] } = {}) {
  linkRequests = JSON.parse(JSON.stringify(links));
  products = JSON.parse(JSON.stringify(items));
}

/**
 * Expose a reset helper (useful in unit tests)
 */
export function resetMockData() {
  linkRequests = [];
  products = [];
}
