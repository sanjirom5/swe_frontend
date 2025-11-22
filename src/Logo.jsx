import React from "react";

export default function Logo({ small }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: small ? 34 : 40,
          height: small ? 34 : 40,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "white",
          fontWeight: 700,
          fontSize: small ? 12 : 14,
          boxShadow: "0 8px 20px rgba(59,130,246,0.12)",
        }}
      >
        LOGO
      </div>

      <div
        style={{
          fontWeight: 800,
          color: "var(--text)",
          fontSize: small ? 16 : 18,
        }}
      >
        NAME
      </div>
    </div>
  );
}
