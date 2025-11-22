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

// backend base (change when you have real backend)
const BASE = "http://localhost:8000";

// NOTE: Runtime mock loader removed for production. If you still want
// local mock mode for development, keep a separate mock file (e.g. src/mockApi.js)
// and load it only in a dev branch. For now we set mockApi = null.
let mockApi = null;

// ======= Mock data removed =======
// We keep empty arrays as placeholders so the frontend won't crash.
// The backend should provide real data via APIs:
//  - GET  /orders
//  - GET  /orders/{id}
//  - GET  /products (or /products/my-catalog)
//  - POST /auth/token (login)
// Replace these placeholders with real fetch calls when backend is ready.

const MOCK_ORDERS = [];    // backend: GET /orders
const MOCK_PRODUCTS = [];  // backend: GET /products

/* ---------------- Header ---------------- */
function HeaderBar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell header">
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
        <Logo small />

        <nav className="nav" style={{ marginLeft: 12 }}>
          {token && (
            <>
              <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
                Dashboard
              </Link>
              <Link to="/products" className={isActive("/products") ? "active" : ""}>
                Products
              </Link>
              <Link to="/orders" className={isActive("/orders") ? "active" : ""}>
                Orders
              </Link>
              <Link to="/chat" className={isActive("/chat") ? "active" : ""}>
                Chat
              </Link>
              <Link to="/profile" className={isActive("/profile") ? "active" : ""}>
                Profile
              </Link>
            </>
          )}

          <Link to="/about" className={isActive("/about") ? "active" : ""}>
            About
          </Link>

          {!token && (
            <Link
              to="/register"
              className={isActive("/register") ? "active" : ""}
              style={{ marginLeft: 8 }}
            >
              Register
            </Link>
          )}
        </nav>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {!token ? (
          <button
            className="btn btn-primary"
            style={{ textDecoration: "none", fontWeight: 500 }}
            onClick={() => navigate("/")}
          >
            Login
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

function AuthWatcher() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const protectedPrefixes = [
      "/dashboard",
      "/products",
      "/orders",
      "/chat",
      "/profile"
    ];

    const path = location.pathname || "/";
    const isProtected = protectedPrefixes.some(
      (p) => path === p || path.startsWith(p + "/")
    );

    if (isProtected && !token) {
      navigate("/", { replace: true });
    }
  }, [token, location.pathname, navigate]);

  return null;
}

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const createAccount = (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    alert("Account successfully created! Please log in.");
    navigate("/");
  };

  return (
    <div className="app-shell center-page" style={{ marginTop: "-80px" }}>
      <div className="card center-card login-card fade-in" style={{ maxWidth: 640 }}>
        <div className="panel-title" style={{ textAlign: "center" }}>
          Create Your Account
        </div>

        <form onSubmit={createAccount} style={{ marginTop: 8 }}>
          <div
            className="form-row"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <input
              className="input"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="row" style={{ justifyContent: "center", marginTop: 14 }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 160 }}>
              Create account
            </button>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span className="small">
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Login
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Login Page ---------------- */
function LoginPage() {
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
        <div className="panel-title" style={{ textAlign: "center" }}>Supplier Login</div>

        <div className="form-row">
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={doLogin}>Login</button>
          <button className="btn btn-ghost" onClick={() => { setEmail("supplier@example.com"); setPassword("password"); }}>Use demo</button>
        </div>

        <div className="helper">For demo, click <em>Use demo</em> (mock mode required).</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [linkRequests, setLinkRequests] = useState([]);

  const orders = MOCK_ORDERS || [];
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalChats = (MOCK_CONVERSATIONS || []).length;
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

  const updateLinkStatus = (id, status) => {
    setLinkRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status } : lr))
    );
  };

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 1100 }}>
        <div className="panel-title">Supplier Dashboard</div>

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
            <div className="stat-label">Orders today</div>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: 16,
          }}
        >
          <div className="panel">
            <div className="panel-title" style={{ marginBottom: 8 }}>
              Incoming Link Requests
            </div>
            <div className="small" style={{ marginBottom: 12 }}>
              Approve or reject connection requests from your customers.
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

          <div className="panel">
            <div className="panel-title" style={{ marginBottom: 8 }}>
              Recent Orders
            </div>
            <div className="small" style={{ marginBottom: 12 }}>
              Last few orders placed by your customers.
            </div>

            {recentOrders.length === 0 && (
              <div className="small" style={{ color: "var(--muted)" }}>
                No orders yet.
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

function Products() {
  const [products, setProducts] = useState(
    MOCK_PRODUCTS.map((p) => ({ ...p, discountPercent: p.discountPercent || 0 }))
  );
  const [filter, setFilter] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });

  const [editingDiscountFor, setEditingDiscountFor] = useState(null);
  const [discountInput, setDiscountInput] = useState("");

  const [editingProductFor, setEditingProductFor] = useState(null);
  const [editedFields, setEditedFields] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const formatPrice = (value) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(value);

  const removeProduct = (id) => {
    if (!window.confirm("Remove this product?")) return;
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
      alert("Fill all fields.");
      return;
    }

    const price = Number(newProduct.price);
    const quantity = parseInt(newProduct.quantity, 10);

    if (Number.isNaN(price) || Number.isNaN(quantity)) {
      alert("Price and quantity must be numbers.");
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      price,
      quantity,
      unit: newProduct.unit.trim(),
      discountPercent: 0,
    };

    setProducts((prev) => [product, ...prev]);

    setNewProduct({ name: "", price: "", quantity: "", unit: "" });
  };

  const openDiscountEditor = (id) => {
    setEditingProductFor(null);
    const p = products.find((x) => x.id === id);
    setDiscountInput(p?.discountPercent ? String(p.discountPercent) : "");
    setEditingDiscountFor(id);
  };

  const cancelDiscountEdit = () => {
    setEditingDiscountFor(null);
    setDiscountInput("");
  };

  const applyDiscount = (id) => {
    const raw = discountInput.trim();
    if (raw === "") {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, discountPercent: 0 } : p))
      );
      cancelDiscountEdit();
      return;
    }

    const v = Number(raw);
    if (Number.isNaN(v) || v < 0 || v > 100) {
      alert("Enter valid percent (0–100).");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, discountPercent: Math.round(v) } : p
      )
    );
    cancelDiscountEdit();
  };

  const openEditEditor = (id) => {
    setEditingDiscountFor(null);
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditedFields({
      name: p.name,
      price: String(p.price),
      quantity: String(p.quantity),
      unit: p.unit,
    });
    setEditingProductFor(id);
  };

  const cancelEdit = () => {
    setEditingProductFor(null);
    setEditedFields({ name: "", price: "", quantity: "", unit: "" });
  };

  const saveEdit = (id) => {
    const name = editedFields.name.trim();
    const price = Number(editedFields.price);
    const quantity = parseInt(editedFields.quantity, 10);
    const unit = editedFields.unit.trim();

    if (!name || Number.isNaN(price) || Number.isNaN(quantity) || !unit) {
      alert("Fill all fields correctly.");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name, price, quantity: Math.max(0, quantity), unit }
          : p
      )
    );

    cancelEdit();
  };

  const handleEditorKeyDown = (e, type, id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "discount") applyDiscount(id);
      if (type === "edit") saveEdit(id);
    }
    if (e.key === "Escape") {
      if (type === "discount") cancelDiscountEdit();
      if (type === "edit") cancelEdit();
    }
  };

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 1100 }}>
        <div className="panel-title">Product Catalog</div>

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
            placeholder="Search…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="small" style={{ color: "var(--muted)" }}>
            Total: <strong>{products.length}</strong>
          </div>
        </div>

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
              No products found.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
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

              {filteredProducts.map((p) => {
                const discounted = p.discountPercent > 0;
                const discountedPrice = discounted
                  ? Math.round(p.price * (1 - p.discountPercent / 100))
                  : p.price;

                return (
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

                    <div className="small">
                      {discounted ? (
                        <>
                          <div style={{ textDecoration: "line-through", opacity: 0.6 }}>
                            {formatPrice(p.price)}
                          </div>
                          <div style={{ fontWeight: 700 }}>
                            {formatPrice(discountedPrice)}
                          </div>
                          <span
                            className="badge"
                            style={{
                              background: "transparent",
                              color: "var(--accent)",
                            }}
                          >
                            -{p.discountPercent}%
                          </span>
                        </>
                      ) : (
                        formatPrice(p.price)
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
                        onClick={() => openDiscountEditor(p.id)}
                      >
                        Discount
                      </button>

                      <button
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px" }}
                        onClick={() => openEditEditor(p.id)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px", color: "#b91c1c" }}
                        onClick={() => removeProduct(p.id)}
                      >
                        Remove
                      </button>
                    </div>

                    {editingDiscountFor === p.id && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          marginTop: 6,
                          padding: 10,
                          borderRadius: 8,
                          background: "rgba(59,130,246,0.03)",
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 600, minWidth: 160 }}>
                          Set discount for {p.name}
                        </div>
                        <input
                          className="input"
                          style={{ width: 120 }}
                          value={discountInput}
                          placeholder="10"
                          onChange={(e) => setDiscountInput(e.target.value)}
                          onKeyDown={(e) =>
                            handleEditorKeyDown(e, "discount", p.id)
                          }
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => applyDiscount(p.id)}
                        >
                          Apply
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={cancelDiscountEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {editingProductFor === p.id && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          marginTop: 6,
                          padding: 12,
                          borderRadius: 8,
                          background: "rgba(15,23,42,0.02)",
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          className="input"
                          value={editedFields.name}
                          onChange={(e) =>
                            setEditedFields((s) => ({
                              ...s,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Product name"
                          style={{ flex: "1 1 280px", minWidth: 180 }}
                          onKeyDown={(e) =>
                            handleEditorKeyDown(e, "edit", p.id)
                          }
                        />

                        <input
                          className="input"
                          value={editedFields.price}
                          onChange={(e) =>
                            setEditedFields((s) => ({
                              ...s,
                              price: e.target.value,
                            }))
                          }
                          placeholder="Price"
                          style={{ flex: "0 1 140px", minWidth: 120 }}
                          onKeyDown={(e) =>
                            handleEditorKeyDown(e, "edit", p.id)
                          }
                        />

                        <input
                          className="input"
                          value={editedFields.quantity}
                          onChange={(e) =>
                            setEditedFields((s) => ({
                              ...s,
                              quantity: e.target.value,
                            }))
                          }
                          placeholder="Quantity"
                          style={{ flex: "0 1 120px", minWidth: 100 }}
                          onKeyDown={(e) =>
                            handleEditorKeyDown(e, "edit", p.id)
                          }
                        />

                        <input
                          className="input"
                          value={editedFields.unit}
                          onChange={(e) =>
                            setEditedFields((s) => ({
                              ...s,
                              unit: e.target.value,
                            }))
                          }
                          placeholder="Unit"
                          style={{ flex: "0 1 140px", minWidth: 100 }}
                          onKeyDown={(e) =>
                            handleEditorKeyDown(e, "edit", p.id)
                          }
                        />

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            marginLeft: "auto",
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            onClick={() => saveEdit(p.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="panel"
          style={{
            marginTop: 4,
            borderRadius: 14,
            background: "#f9fafb",
          }}
        >
          <div className="panel-title" style={{ marginBottom: 8 }}>
            Add New Product
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
                setNewProduct((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Unit"
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
    </div>
  );
}


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

  const initial = MOCK_ORDERS.find((o) => o.id === orderId) || null;
  const [order, setOrder] = React.useState(initial);

  const updateMockOrder = (orderId, patch) => {
    for (let i = 0; i < MOCK_ORDERS.length; i++) {
      if (MOCK_ORDERS[i].id === orderId) {
        MOCK_ORDERS[i] = { ...MOCK_ORDERS[i], ...patch };
        break;
      }
    }
  };

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

  const acceptOrder = () => {
    setOrder((prev) => ({ ...prev, status: "confirmed" }));
    updateMockOrder(order.id, { status: "confirmed" });
  };

  const rejectOrder = () => {
    if (!window.confirm("Reject this order? This action cannot be undone.")) return;
    setOrder((prev) => ({ ...prev, status: "rejected" }));
    updateMockOrder(order.id, { status: "rejected" });
  };

  const goToChat = () => {
    navigate("/chat", {
      state: { customerName: order.consumer_name },
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
          <div><strong>Customer:</strong> {order.consumer_name}</div>

          <div>
            <strong>Status:</strong>{" "}
            <span
              className="badge"
              style={{
                background:
                  order.status === "pending"
                    ? "rgba(245,158,11,0.06)"
                    : order.status === "confirmed"
                    ? "rgba(16,185,129,0.06)"
                    : order.status === "rejected"
                    ? "rgba(248,113,113,0.06)"
                    : "rgba(148,163,184,0.06)",
                color:
                  order.status === "pending"
                    ? "#b45309"
                    : order.status === "confirmed"
                    ? "#047857"
                    : order.status === "rejected"
                    ? "#b91c1c"
                    : "#475569",
              }}
            >
              {order.status}
            </span>
          </div>

          <div>
            <strong>Delivery type:</strong>{" "}
            {order.delivery_type === "delivery" ? "Delivery" : "Pickup"}
          </div>

          <div><strong>Total amount:</strong> {order.total_amount} ₸</div>
          <div><strong>Created at:</strong> {formatTime(order.created_at)}</div>
        </div>

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

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button className="btn btn-ghost" onClick={() => navigate("/orders")}>
            ← Back to Orders
          </button>

          {order.status === "pending" ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={acceptOrder}>
                Accept Order
              </button>
              <button className="btn btn-ghost" style={{ color: "#b91c1c" }} onClick={rejectOrder}>
                Reject Order
              </button>
              <button className="btn btn-primary" onClick={goToChat}>
                Open Chat with {order.consumer_name}
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={goToChat}>
              Open Chat with {order.consumer_name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const MOCK_CONVERSATIONS = [];

/* ---------------- CHAT ---------------- */
function Chat() {
  const location = useLocation();
  const customerName = location.state?.customerName || null;
  const { token } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messagesByConv, setMessagesByConv] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // load conversations from backend (replace endpoint as needed)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE}/conversations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Conversations fetch failed");
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setActiveId((id) => id ?? data[0].id);
        }
      } catch (e) {
        // silently ignore; conversations remain empty for now
      }
    };
    load();
  }, [token]);

  // load messages for active conversation when activeId changes
  useEffect(() => {
    if (!activeId) return;
    const loadMessages = async () => {
      try {
        const res = await fetch(`${BASE}/conversations/${activeId}/messages`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Messages fetch failed");
        const data = await res.json();
        setMessagesByConv((prev) => ({ ...prev, [activeId]: Array.isArray(data) ? data : [] }));
      } catch (e) {
        // ignore; keep local state if any
      }
    };
    loadMessages();
  }, [activeId, token]);

  // focus conversation when navigated from orders or other page
  useEffect(() => {
    if (!customerName || conversations.length === 0) return;
    const match = conversations.find((c) => c.name === customerName);
    if (match) setActiveId(match.id);
  }, [customerName, conversations]);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    // immediate snap then try smooth
    el.scrollTop = el.scrollHeight;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch (e) {
      el.scrollTop = el.scrollHeight;
    }
  }, [activeId, messagesByConv[activeId]?.length]);

  const send = async () => {
    if (!text.trim() || !activeId) return;
    const nowIso = new Date().toISOString();
    const newMsg = { id: Date.now(), sender: "supplier", content: text.trim(), timestamp: nowIso };

    // optimistic UI update
    setMessagesByConv((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), newMsg] }));
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, lastMessage: newMsg.content, lastTime: nowIso } : c))
    );
    setText("");

    // try to persist to backend (graceful fallback if it fails)
    try {
      await fetch(`${BASE}/conversations/${activeId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: newMsg.content }),
      });
    } catch (e) {
      // if network fails, we keep optimistic message locally
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  // conversations sorted by last time (backend should ideally provide sorted list)
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTs = new Date(a.lastTime || 0).getTime();
    const bTs = new Date(b.lastTime || 0).getTime();
    return bTs - aTs;
  });

  const activeMessages = messagesByConv[activeId] || [];
  const activeConv = conversations.find((c) => c.id === activeId) || null;

  return (
    <div className="app-shell center-grid fade-in">
      <div
        className="card center-card chat-card"
        style={{ maxWidth: 1000, minHeight: "65vh", display: "flex", flexDirection: "column" }}
      >
        <div className="panel-title">Chat</div>

        <div style={{ display: "flex", gap: 16, marginTop: 12, minHeight: "55vh" }}>
          <div style={{ width: 260, borderRight: "1px solid rgba(15,23,42,0.06)", paddingRight: 10, paddingTop: 4 }}>
            <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>Conversations</div>

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

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>
              {activeConv ? `Chat with ${activeConv.name}` : "Select a chat"}
            </div>

            <div
              ref={messagesRef}
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                height: "52vh",
                boxSizing: "border-box",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 8,
                borderRadius: 10,
                background: "rgba(15,23,42,0.01)",
              }}
            >
              {activeMessages.map((m) => (
                <div key={m.id} style={{ alignSelf: m.sender === "supplier" ? "flex-end" : "flex-start", maxWidth: "78%", wordBreak: "break-word" }}>
                  <div style={{ background: "rgba(0,0,0,0.04)", padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>{m.content}</div>
                    <div className="meta" style={{ textAlign: "right" }}>{formatTime(m.timestamp)}</div>
                  </div>
                </div>
              ))}

              {activeMessages.length === 0 && (
                <div className="small" style={{ color: "var(--muted)" }}>No messages yet. Start the conversation below.</div>
              )}
            </div>

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
              <button className="btn btn-primary" onClick={send} disabled={!activeConv}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 700 }}>
        <div className="panel-title">About This Platform</div>

        <p className="small">
          This Supplier–Consumer Platform was developed as a project by our team.
          It allows suppliers to manage product catalogs, handle link requests
          from consumers, and process orders.
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

function ProfilePage() {
  const [about, setAbout] = React.useState(
    localStorage.getItem("supplierAbout") || ""
  );
  const [visible, setVisible] = React.useState(
    localStorage.getItem("supplierVisible") === "true"
  );
  const [editing, setEditing] = React.useState(false);
  const [tempAbout, setTempAbout] = React.useState(about);

  const saveAbout = () => {
    setAbout(tempAbout);
    localStorage.setItem("supplierAbout", tempAbout);
    setEditing(false);
  };

  const toggleVisibility = () => {
    const newStatus = !visible;
    setVisible(newStatus);
    localStorage.setItem("supplierVisible", newStatus);
  };

  return (
    <div className="app-shell center-grid fade-in">
      <div className="card center-card" style={{ maxWidth: 700 }}>
        <div className="panel-title" style={{ marginBottom: 10 }}>
          Supplier Profile
        </div>

        <button
          className="btn"
          style={{
            background: visible ? "rgba(16,185,129,0.15)" : "rgba(248,113,113,0.15)",
            color: visible ? "#047857" : "#b91c1c",
            marginBottom: 16,
          }}
          onClick={toggleVisibility}
        >
          {visible ? "Make Invisible" : "Make Visible"}
        </button>

        <div className="panel">
          <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>
            About Me
          </div>

          {!editing ? (
            <>
              <div style={{ whiteSpace: "pre-wrap", marginBottom: 16 }}>
                {about.trim() ? (
                  about
                ) : (
                  <span style={{ color: "var(--muted)" }}>
                    Nothing written yet.
                  </span>
                )}
              </div>

              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit
              </button>
            </>
          ) : (
            <>
              <textarea
                value={tempAbout}
                onChange={(e) => setTempAbout(e.target.value)}
                style={{
                  width: "100%",
                  height: 140,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.1)",
                  marginBottom: 12,
                }}
              />

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={saveAbout}>
                  Save
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setTempAbout(about);
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
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
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Fallback */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
