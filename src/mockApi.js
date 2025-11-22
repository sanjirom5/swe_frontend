// src/mockApi.js
// Simple in-memory mock API. All functions return Promises to mimic fetch.

const sleep = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// Sample mock data
let linkRequests = [
  {
    id: 1,
    consumer_id: 101,
    supplier_id: 201,
    status: "pending",
    created_at: new Date().toISOString(),
    supplier_name: "AgroSupply LLP",
    consumer_name: "Bakyt",
  },
  {
    id: 2,
    consumer_id: 102,
    supplier_id: 201,
    status: "accepted",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    supplier_name: "AgroSupply LLP",
    consumer_name: "Ainur",
  },
];

let products = [
  { id: 1, name: "Potatoes (bag)", price: "1200.00", quantity: 50, unit: "kg", supplier_id: 201 },
  { id: 2, name: "Onions (bag)", price: "900.00", quantity: 30, unit: "kg", supplier_id: 201 },
];

// Exports: mimic API surface used by the app
export async function authToken(/* username, password */) {
  await sleep(200);
  return {
    access_token: "mock-token-abc123",
    token_type: "bearer",
    user_id: 201,
    role: "supplier_admin",
  };
}

export async function getSupplierLinks() {
  await sleep(200);
  // return a copy
  return JSON.parse(JSON.stringify(linkRequests));
}

export async function updateSupplierLink(id, { status }) {
  await sleep(200);
  const idx = linkRequests.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Not found");
  linkRequests[idx].status = status;
  return JSON.parse(JSON.stringify(linkRequests[idx]));
}

export async function getMyProducts() {
  await sleep(200);
  return JSON.parse(JSON.stringify(products));
}

export async function createProduct(payload) {
  await sleep(200);
  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const item = { id, ...payload };
  products.push(item);
  return JSON.parse(JSON.stringify(item));
}
