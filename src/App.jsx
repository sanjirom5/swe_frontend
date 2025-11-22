// web/src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./AuthContext";
import Logo from "./Logo";
import { useTranslation } from "react-i18next";

// backend base (change when you have real backend)
const BASE = "http://localhost:8000";

// mock api loader (only when runtime flag set)
let mockApi;
if (typeof window !== "undefined" && window.__USE_MOCK) {
  // eslint-disable-next-line
  mockApi = require("./mockApi");
}

const MOCK_ORDERS = [
  {
    id: 1001,
    consumer_name: "Bakyt",
    total_amount: "54,000.00",
    status: "pending",
    delivery_type: "delivery",      // <— added
    created_at: new Date().toISOString(),
  },
  {
    id: 1002,
    consumer_name: "Ainur",
    total_amount: "12,500.00",
    status: "confirmed",
    delivery_type: "pickup",        // <— added
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 1003,
    consumer_name: "Retail Store #12",
    total_amount: "98,300.00",
    status: "shipped",
    delivery_type: "delivery",      // <— added
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Mock products for supplier catalog (will be replaced by /products API later)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Flour 50kg",
    original_price: 12500,
    price: 12500,
    quantity: 120,
    unit: "bag",
    discountPercent: null,
  },
  {
    id: 2,
    name: "Sunflower Oil 5L",
    original_price: 3800,
    price: 3800,
    quantity: 60,
    unit: "bottle",
    discountPercent: null,
  },
  {
    id: 3,
    name: "Sugar 25kg",
    original_price: 9300,
    price: 9300,
    quantity: 45,
    unit: "bag",
    discountPercent: null,
  },
  {
    id: 4,
    name: "Rice 25kg",
    original_price: 10400,
    price: 10400,
    quantity: 30,
    unit: "bag",
    discountPercent: null,
  },
];

/* ---------------- Header Bar ---------------- */
function HeaderBar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return (
    <div className="app-shell header">
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
        <Logo small />
        <nav className="nav" style={{ marginLeft: 12 }}>
          {token && <Link to="/dashboard">{t("dashboard")}</Link>}
          {token && <Link to="/products">{t("products")}</Link>}
          {token && <Link to="/orders">{t("orders")}</Link>}
          {token && <Link to="/chat">{t("chat")}</Link>}
          <Link to="/about">{t("about")}</Link>
        </nav>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        {/* language selector */}
        <select
          value={i18n.language}
          onChange={(e) => changeLang(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <option value="kz">KZ</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>

        {!token ? (
          <button className="btn btn-primary" style={{ textDecoration: "none", fontWeight: 500 }} onClick={() => navigate("/")}>
            {t("login")}
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            {t("logout")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Auth watcher (redirect if unauthenticated on protected paths) ---------------- */
function AuthWatcher() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // list of protected routes (prefix match)
    const protectedPrefixes = ["/dashboard", "/products", "/orders", "/chat"];

    // if we're on a protected path and the user is not logged in -> redirect to login
    const path = location.pathname || "/";
    const isProtected = protectedPrefixes.some((p) => path === p || path.startsWith(p + "/"));

    if (isProtected && !token) {
      navigate("/", { replace: true });
    }
    // no else branch; when token appears, components will render normally
  }, [token, location.pathname, navigate]);

  return null;
}

/* ---------------- Login Page ---------------- */
function LoginPage() {
  const { t } = useTranslation();
  const { setToken, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const doLogin = async () => {
    try {
      if (typeof window !== "undefined" && window.__USE_MOCK) {
        if (mockApi && mockApi.login) {
          const resp = await mockApi.login(email, password);
          setToken(resp.access_token);
          navigate("/dashboard");
          return;
        }
        setToken("demo-token");
        navigate("/dashboard");
        return;
      }

      const res = await fetch(BASE + "/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        navigate("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  return (
    <div className="app-shell center-page" style={{ marginTop: "-80px" }}>
      <div className="card center-card login-card fade-in">
        <div className="panel-title" style={{ textAlign: "center" }}>{t("supplierLogin")}</div>

        <div className="form-row">
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={doLogin}>{t("login")}</button>
          <button className="btn btn-ghost" onClick={() => { setEmail("supplier@example.com"); setPassword("password"); }}>{t("useDemo")}</button>
        </div>

        <div className="helper">For demo, click <em>Use demo</em> (mock mode required).</div>
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard() {
  const { t } = useTranslation();
  const [linkRequests, setLinkRequests] = useState([
    {
      id: 1,
      consumerName: "Bakyt Store",
      supplierName: "Our Company",
      createdAt: new Date().toISOString(),
      status: "pending",
    },
    {
      id: 2,
      consumerName: "Ainur Market",
      supplierName: "Our Company",
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      status: "pending",
    },
    {
      id: 3,
      consumerName: "Retail Store #12",
      supplierName: "Our Company",
      createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
      status: "accepted",
    },
  ]);

  // Быстрые статусы по заказам
  const orders = MOCK_ORDERS || [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "shipped"
  ).length;

  // Активные чаты
  const totalChats = (MOCK_CONVERSATIONS || []).length;

  // Заявки на связь
  const pendingLinks = linkRequests.filter((l) => l.status === "pending").length;

  const today = new Date();
  const isSameDay = (ts) => {
    const d = new Date(ts);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };
  const todaysOrders = orders.filter((o) => isSameDay(o.created_at)).length;

  const formatDateTime = (ts) =>
    new Date(ts).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Обработчик кнопок Approve / Reject
  const updateLinkStatus = (id, status) => {
    setLinkRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status } : lr))
    );
  };

  // Последние заказы
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 1100 }}>
        <div className="panel-title">{t("dashboard")}</div>

        {/* KPI блок */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <div className="stat-card">
            <div className="stat-label">{t("orders today")}</div>
            <div className="stat-value">{todaysOrders}</div>
            <div className="stat-sub">New orders created today</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Pending orders</div>
            <div className="stat-value">{pendingOrders}</div>
            <div className="stat-sub">Waiting for confirmation</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active chats</div>
            <div className="stat-value">{totalChats}</div>
            <div className="stat-sub">Ongoing customer conversations</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Link requests</div>
            <div className="stat-value">{pendingLinks}</div>
            <div className="stat-sub">Pending connection requests</div>
          </div>
        </div>

        {/* Две основные панели */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: 16,
          }}
        >
          {/* Incoming Link Requests */}
          <div className="panel">
            <div className="panel-title" style={{ marginBottom: 8 }}>
              Incoming Link Requests
            </div>
            <div className="small" style={{ marginBottom: 12 }}>
              Approve or reject connection requests from your B2B customers.
            </div>

            {linkRequests.length === 0 && (
              <div className="small" style={{ color: "var(--muted)" }}>
                No link requests yet.
              </div>
            )}

            <div style={{ display: "grid", gap: 8 }}>
              {linkRequests.map((lr) => (
                <div key={lr.id} className="request">
                  <div>
                    <div style={{ fontWeight: 600 }}>{lr.consumerName}</div>
                    <div className="meta">
                      Requested at: {formatDateTime(lr.createdAt)}
                    </div>
                    <div className="small">
                      Status:{" "}
                      <span
                        className="badge"
                        style={{
                          background:
                            lr.status === "pending"
                              ? "rgba(245,158,11,0.1)"
                              : lr.status === "accepted"
                              ? "rgba(16,185,129,0.1)"
                              : "rgba(248,113,113,0.1)",
                          color:
                            lr.status === "pending"
                              ? "#b45309"
                              : lr.status === "accepted"
                              ? "#047857"
                              : "#b91c1c",
                        }}
                      >
                        {lr.status}
                      </span>
                    </div>
                  </div>

                  {lr.status === "pending" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        alignItems: "flex-end",
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        style={{ padding: "4px 10px" }}
                        onClick={() => updateLinkStatus(lr.id, "accepted")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px" }}
                        onClick={() => updateLinkStatus(lr.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="panel">
            <div className="panel-title" style={{ marginBottom: 8 }}>
              Recent Orders
            </div>
            <div className="small" style={{ marginBottom: 12 }}>
              Last few orders placed by your linked customers.
            </div>

            {recentOrders.length === 0 && (
              <div className="small" style={{ color: "var(--muted)" }}>
                No orders yet. Once customers place orders, they will appear
                here.
              </div>
            )}

            <div style={{ display: "grid", gap: 8 }}>
              {recentOrders.map((o) => (
                <div key={o.id} className="request">
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      #{o.id} — {o.consumer_name}
                    </div>
                    <div className="meta">
                      Created: {formatDateTime(o.created_at)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="small">
                      Total: <strong>{o.total_amount}</strong>
                    </div>
                    <div className="small">
                      Status:{" "}
                      <span
                        className="badge"
                        style={{
                          background: "rgba(37,99,235,0.06)",
                          color: "var(--accent)",
                        }}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, textAlign: "right" }}>
              <Link to="/orders" className="small" style={{ color: "var(--accent)" }}>
                View all orders →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PRODUCTS (catalog) ---------------- */
function Products() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [filter, setFilter] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });

  // discount modal state
  const [discountModal, setDiscountModal] = useState({
    open: false,
    productId: null,
    percent: "",
  });

  const openDiscount = (productId) => {
    setDiscountModal({ open: true, productId, percent: "" });
  };
  const closeDiscount = () => setDiscountModal({ open: false, productId: null, percent: "" });

  const applyDiscount = (e) => {
    e.preventDefault();
    const pct = Number(discountModal.percent);
    if (Number.isNaN(pct) || pct <= 0 || pct >= 100) {
      alert("Enter a valid discount percent (1 - 99).");
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== discountModal.productId) return p;
        // Ensure original_price is preserved (only set once)
        const orig = p.original_price ?? p.price;
        const newPrice = Math.round(orig * (1 - pct / 100));
        return {
          ...p,
          original_price: orig,
          price: newPrice,
          discountPercent: pct,
        };
      })
    );

    closeDiscount();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const formatPrice = (value) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(value);

  const changeStock = (id, delta) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              quantity: Math.max(0, p.quantity + delta),
            }
          : p
      )
    );
  };

  const removeProduct = (id) => {
    if (!window.confirm("Remove this product from catalog?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (
      !newProduct.name.trim() ||
      !newProduct.price ||
      !newProduct.quantity ||
      !newProduct.unit.trim()
    ) {
      alert("Please fill all fields for the new product.");
      return;
    }

    const price = Number(newProduct.price);
    const quantity = parseInt(newProduct.quantity, 10);

    if (Number.isNaN(price) || Number.isNaN(quantity)) {
      alert("Price and quantity must be numeric.");
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      original_price: price,
      price,
      quantity,
      unit: newProduct.unit.trim(),
      discountPercent: null,
    };

    setProducts((prev) => [product, ...prev]);

    setNewProduct({
      name: "",
      price: "",
      quantity: "",
      unit: "",
    });
  };

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 1100 }}>
        <div className="panel-title">Product Catalog</div>

        {/* Top toolbar: search + quick info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            marginBottom: 16,
          }}
        >
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="Search by name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="small" style={{ color: "var(--muted)" }}>
            Total products: <strong>{products.length}</strong>
          </div>
        </div>

        {/* Products list */}
        <div
          style={{
            borderRadius: 14,
            background: "rgba(15,23,42,0.01)",
            padding: 10,
            marginBottom: 18,
          }}
        >
          {filteredProducts.length === 0 ? (
            <div className="small" style={{ color: "var(--muted)" }}>
              No products match this filter. Try changing the search text.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {/* header row */}
              <div
                className="small"
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr 1fr 1.4fr",
                  padding: "4px 10px",
                  color: "var(--muted)",
                }}
              >
                <div>Name</div>
                <div>Price</div>
                <div>Stock</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>

              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="request"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr 1fr 1.4fr",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="meta">Unit: {p.unit}</div>
                  </div>

                  <div className="small" style={{ textAlign: "left" }}>
                    {p.discountPercent ? (
                      <div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>
                          <span
                            style={{
                              textDecoration: "line-through",
                              marginRight: 8,
                            }}
                          >
                            {formatPrice(p.original_price)}
                          </span>
                          <strong>{formatPrice(p.price)}</strong>
                        </div>

                        <div style={{ marginTop: 6 }}>
                          <span
                            className="badge"
                            style={{
                              background: "rgba(37,99,235,0.06)",
                              color: "var(--accent)",
                            }}
                          >
                            Discount {p.discountPercent}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>{formatPrice(p.price)}</div>
                    )}
                  </div>


                  <div className="small">
                    {p.quantity > 0 ? (
                      <>
                        {p.quantity}{" "}
                        <span style={{ color: "var(--muted)" }}>in stock</span>
                      </>
                    ) : (
                      <span style={{ color: "#b91c1c", fontWeight: 600 }}>
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 6,
                    }}
                  >
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px" }}
                      onClick={() => changeStock(p.id, -1)}
                      disabled={p.quantity === 0}
                    >
                      −1
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px" }}
                      onClick={() => changeStock(p.id, +1)}
                    >
                      +1
                    </button>

                    {/* NEW: Discount button */}
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px", color: "#0b5cff" }}
                      onClick={() => openDiscount(p.id)}
                    >
                      Discount
                    </button>

                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px", color: "#b91c1c" }}
                      onClick={() => removeProduct(p.id)}
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new product form */}
        <div
          className="panel"
          style={{
            marginTop: 4,
            borderRadius: 14,
            background: "#f9fafb",
          }}
        >
          <div className="panel-title" style={{ marginBottom: 8 }}>
            Add New Product (demo)
          </div>
          <div className="small" style={{ marginBottom: 10 }}>
            This form updates local mock data. Later backend can connect to
            <code> POST /products</code>.
          </div>

          <form
            onSubmit={handleAdd}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              className="input"
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, price: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }))
              }
            />
            <input
              className="input"
              placeholder="Unit (e.g. kg, box)"
              value={newProduct.unit}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, unit: e.target.value }))
              }
            />

            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
        </div>
      </div>
      {/* Discount modal (simple inline modal) */}
        {discountModal.open && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
              zIndex: 1200,
            }}
            onClick={closeDiscount}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 360,
                background: "white",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Apply discount</div>
              <div className="small" style={{ marginBottom: 12 }}>
                Enter discount percent (1–99). This updates product price locally.
              </div>

              <form onSubmit={applyDiscount} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  placeholder="Percent (e.g. 10)"
                  value={discountModal.percent}
                  onChange={(e) => setDiscountModal((s) => ({ ...s, percent: e.target.value }))}
                />
                <button type="submit" className="btn btn-primary">Apply</button>
                <button type="button" className="btn btn-ghost" onClick={closeDiscount}>Cancel</button>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

/* ---------------- ORDERS (list) ---------------- */
function Orders() {
  const navigate = useNavigate();
  const [orders] = useState(MOCK_ORDERS);

  const formatTime = (ts) =>
    new Date(ts).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 900 }}>
        <div className="panel-title">Orders</div>
        <div className="small" style={{ marginBottom: 12 }}>
          Click an order to view details and open chat with the customer.
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              style={{
                textAlign: "left",
                border: "none",
                padding: 0,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <div className="request">
                <div>
                  <div style={{ fontWeight: 700 }}>
                    Order #{o.id} — {o.consumer_name}
                  </div>
                  <div className="meta">Created: {formatTime(o.created_at)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small">
                    Total: <strong>{o.total_amount}</strong>
                  </div>
                  <div className="small">
                    Status:{" "}
                    <span
                      className="badge"
                      style={{
                        background: "rgba(37,99,235,0.06)",
                        color: "var(--accent)",
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- ORDER DETAILS ---------------- */
function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = parseInt(id, 10);
  const order = MOCK_ORDERS.find((o) => o.id === orderId);

  const formatTime = (ts) =>
    new Date(ts).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!order) {
    return (
      <div className="app-shell center-grid fade-in">
        <div className="card center-card" style={{ maxWidth: 700 }}>
          <div className="panel-title">Order not found</div>
          <div className="small" style={{ marginBottom: 12 }}>
            The order you are looking for does not exist.
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const goToChat = () => {
    navigate("/chat", {
      state: { customerName: order.consumer_name }, // pass to Chat
    });
  };

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 800 }}>
        <div className="panel-title">Order #{order.id}</div>

        <div className="small" style={{ marginBottom: 16 }}>
          Detailed view of the order and quick access to customer chat.
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          <div>
            <strong>Customer:</strong> {order.consumer_name}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span
              className="badge"
              style={{
                background: "rgba(37,99,235,0.06)",
                color: "var(--accent)",
              }}
            >
              {order.status}
            </span>
          </div>

          <div>
            <strong>Delivery type:</strong>{" "}
            {order.delivery_type === "delivery" ? "Delivery" : "Pickup"}
          </div>

          <div>
            <strong>Total amount:</strong> {order.total_amount} ₸
          </div>
          <div>
            <strong>Created at:</strong> {formatTime(order.created_at)}
          </div>
        </div>

        {/* Placeholder for line items / products */}
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: "rgba(15,23,42,0.02)",
            marginBottom: 20,
          }}
        >
          <div className="small" style={{ fontWeight: 600, marginBottom: 8 }}>
            Items in this order (demo)
          </div>
          <div className="small">
            In the real system this section will list ordered products from{" "}
            <code>/orders/{order.id}/items</code>.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/orders")}>
            ← Back to Orders
          </button>
          <button className="btn btn-primary" onClick={goToChat}>
            Open Chat with {order.consumer_name}
          </button>
        </div>
      </div>
    </div>
  );
}

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: "Bakyt",
    lastMessage: "I have a question about order #1001",
    lastTime: new Date().toISOString(),
  },
    {
    id: 2,
    name: "Ainur",
    lastMessage: "Can you send updated price list?",
    lastTime: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 3,
    name: "Retail Store #12",
    lastMessage: "Thanks for the fast delivery!",
    lastTime: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
];

/* ---------------- CHAT ---------------- */
/* ---------------- CHAT (replace your existing Chat function with this) ---------------- */
function Chat() {
  // Local mock conversations (component-local so this is self-contained)
  const MOCK_CONVERSATIONS = [
    { id: 1, name: "Bakyt", lastMessage: "I have a question about order #1001", lastTime: new Date().toISOString() },
    { id: 2, name: "Ainur", lastMessage: "Can you send updated price list?", lastTime: new Date(Date.now() - 3600_000).toISOString() },
    { id: 3, name: "Retail Store #12", lastMessage: "Thanks for the fast delivery!", lastTime: new Date(Date.now() - 2 * 3600_000).toISOString() },
  ];

  // ensure necessary hooks are available
  // (make sure at top of your file you have: import React, { useState, useEffect, useRef } from "react";
  //  and: import { useLocation } from "react-router-dom"; )
  const location = useLocation();
  const customerName = location.state?.customerName || null;

  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  // messages grouped by conversation id
  const [messagesByConv, setMessagesByConv] = useState({
    1: [
      { id: 1, sender: "supplier", content: "Hello, how can we help?", timestamp: new Date().toISOString() },
      { id: 2, sender: "consumer", content: "I have a question about order #1001", timestamp: new Date().toISOString() },
    ],
    2: [{ id: 3, sender: "consumer", content: "Can you send updated price list?", timestamp: new Date().toISOString() }],
    3: [
      { id: 4, sender: "consumer", content: "Thanks for the fast delivery!", timestamp: new Date().toISOString() },
      { id: 5, sender: "supplier", content: "You’re welcome!", timestamp: new Date().toISOString() },
    ],
  });

  // active chat id
  const [activeId, setActiveId] = useState(() => {
    if (customerName) {
      const match = MOCK_CONVERSATIONS.find((c) => c.name === customerName);
      if (match) return match.id;
    }
    return MOCK_CONVERSATIONS[0]?.id ?? null;
  });

  const [text, setText] = useState("");
  const messagesRef = useRef(null);

  // helper to format HH:MM
  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    // Immediately snap to bottom to avoid any parent resize flicker
    el.scrollTop = el.scrollHeight;

    // Then try a smooth nudge (if supported)
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch (e) {
      el.scrollTop = el.scrollHeight;
    }
  }, [activeId, messagesByConv[activeId]?.length]);

  // if customerName passed via navigate state, focus that conversation
  useEffect(() => {
    if (!customerName) return;
    const match = conversations.find((c) => c.name === customerName);
    if (match) setActiveId(match.id);
  }, [customerName, conversations]);

  // send message (records timestamp once)
  const send = () => {
    if (!text.trim() || !activeId) return;
    const now = new Date().toISOString();
    const newMsg = { id: Date.now(), sender: "supplier", content: text.trim(), timestamp: now };

    setMessagesByConv((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, lastMessage: newMsg.content, lastTime: now } : c))
    );

    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  // sorted conversations by last message time (newest first) — convert timestamps to numbers
  const sortedConversations = [...conversations].sort((a, b) => {
    const msgsA = messagesByConv[a.id] || [];
    const msgsB = messagesByConv[b.id] || [];
    const lastATs = msgsA[msgsA.length - 1]?.timestamp || a.lastTime;
    const lastBTs = msgsB[msgsB.length - 1]?.timestamp || b.lastTime;
    const timeA = lastATs ? new Date(lastATs).getTime() : 0;
    const timeB = lastBTs ? new Date(lastBTs).getTime() : 0;
    return timeB - timeA;
  });

  const activeMessages = messagesByConv[activeId] || [];
  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div className="app-shell center-grid fade-in">
      <div
        className="card center-card chat-card"
        style={{
          maxWidth: 1000,
          minHeight: "65vh",
          display: "flex",
          flexDirection: "column",   // <-- important
        }}
      >
        <div className="panel-title">Chat</div>

        <div style={{ display: "flex", gap: 16, marginTop: 12, minHeight: "55vh" }}>
          {/* LEFT: conversations list */}
          <div style={{ width: 260, borderRight: "1px solid rgba(15,23,42,0.06)", paddingRight: 10, paddingTop: 4 }}>
            <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>
              Conversations
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sortedConversations.map((conv) => {
                const isActive = conv.id === activeId;
                const convMessages = messagesByConv[conv.id] || [];
                const lastMsg = convMessages[convMessages.length - 1];
                const lastTime = lastMsg?.timestamp || conv.lastTime;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    style={{
                      textAlign: "left",
                      border: "none",
                      background: isActive ? "rgba(59,130,246,0.06)" : "transparent",
                      borderRadius: 10,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 2, color: isActive ? "var(--accent)" : "var(--text)" }}>
                      {conv.name}
                    </div>
                    <div className="small" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                      {conv.lastMessage}
                    </div>
                    <div className="meta">{lastTime ? formatTime(lastTime) : ""}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: active conversation */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>
              {activeConv ? `Chat with ${activeConv.name}` : "Select a chat"}
            </div>
            <div
              ref={messagesRef}
              style={{
                // keep as a flex child but give it a stable, fixed height
                flex: "1 1 auto",
                minHeight: 0,                // allow proper flex shrinking
                height: "52vh",              // <-- FIXED visual size for the chat area (adjust if needed)
                boxSizing: "border-box",     // include padding in the height calculation
                overflowY: "auto",           // enable scrolling, don't grow page
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 8,
                borderRadius: 10,
                background: "rgba(15,23,42,0.01)",
              }}
            >
              {activeMessages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === "supplier" ? "flex-end" : "flex-start",
                    maxWidth: "78%",
                    wordBreak: "break-word",   // keep long words wrapped
                  }}
                >
                  <div style={{ background: "rgba(0,0,0,0.04)", padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>{m.content}</div>
                    <div className="meta" style={{ textAlign: "right" }}>
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {activeMessages.length === 0 && (
                <div className="small" style={{ color: "var(--muted)" }}>
                  No messages yet. Start the conversation below.
                </div>
              )}
            </div>

            {/* input bar */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeConv ? "Write a message..." : "Select a conversation first"}
                disabled={!activeConv}
              />
              <button className="btn btn-primary" onClick={send} disabled={!activeConv}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- About ---------------- */
function AboutPage() {
  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 700 }}>
        <div className="panel-title">About This Platform</div>

        <p className="small">
          This Supplier–Consumer Platform was developed as a project by our team.
          It allows suppliers to manage product catalogs, handle link requests
          from consumers, and process complaints.
        </p>

        <p className="small">
          Team members:<br />
          • Aldiyar Kunduskairov <br />
          • Rauan Kozhakhmetov <br />
          • Sanzhar Umirbayev <br />
          • Sayat Mushkin
        </p>

        <p className="small">
          Telegram: <strong>@snjroo</strong>
        </p>
      </div>
    </div>
  );
}

/* ---------------- ROOT APP ---------------- */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <HeaderBar />
        <AuthWatcher />
        <Routes>
          {/* public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* protected */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/chat" element={<Chat />} />

          {/* fallback */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
