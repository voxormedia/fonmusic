"use client";
import { useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function sb(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const inputStyle = {
    padding: "14px 16px",
    background: "#162435",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    width: "100%",
  };

  const formatPhone = (raw: string) => {
    let val = raw.replace(/\D/g, "");
    if (val.startsWith("998")) val = val.slice(3);
    if (val.length > 9) val = val.slice(0, 9);
    return val ? "+998" + val : "";
  };

  const login = async () => {
    if (!phone || !password) return;
    setLoading(true);
    setError("");

    const data = await sb(
  `clients?phone=eq.${encodeURIComponent(phone)}&password=eq.${encodeURIComponent(password)}&select=*`
);
    setLoading(false);

    if (!data || data.length === 0) {
      setError("Неверный телефон или пароль");
      return;
    }

    const client = data[0];
    localStorage.setItem("fonmusic_client_id", client.id);
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 30);
    localStorage.setItem("fonmusic_session_expiry", sessionExpiry.toISOString());

    if (client.subscription_status === "expired") {
      window.location.href = "/dashboard";
      return;
    }

    if (["demo", "active"].includes(client.subscription_status) && client.demo_expires_at) {
      const days = getDaysLeft(client.demo_expires_at);
      if (days <= 0) {
        await sb(`clients?id=eq.${client.id}`, {
          method: "PATCH",
          body: JSON.stringify({ subscription_status: "expired" }),
        });
        window.location.href = "/dashboard";
        return;
      }
    }

    window.location.href = "/dashboard";
  };

  const sendForgotRequest = async () => {
  if (!forgotPhone) return;
  
  // Ищем клиента и берём пароль
  const data = await sb(`clients?phone=eq.${encodeURIComponent(forgotPhone)}&select=name,phone,password`);
  
  const text = data && data.length > 0
    ? `🔑 Забыл пароль!\n\n🏢 ${data[0].name}\n📞 ${data[0].phone}\n🔑 Пароль: ${data[0].password}`
    : `🔑 Забыл пароль — номер не найден: ${forgotPhone}`;

  await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "forgot-password", phone: forgotPhone, message: text }),
  });
  setForgotSent(true);
};

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A1628",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, serif",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 40,
            justifyContent: "center",
          }}
        >
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <a href="/" style={{ fontSize: 20, fontWeight: 700, color: "#fff", textDecoration: "none" }}>
            FonMusic
          </a>
        </div>

        <div
          style={{
            background: "#0D1B2A",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          }}
        >
          {!showForgot ? (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                Вход в кабинет
              </h1>
              <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 32 }}>
                Войдите чтобы управлять музыкой
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="99 410 09 10"
                  type="tel"
                  style={inputStyle}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  placeholder="Пароль"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 16px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#EF4444",
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={login}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "#C9A84C",
                  border: "none",
                  borderRadius: 10,
                  color: "#0A1628",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: 16,
                  fontFamily: "Georgia, serif",
                }}
              >
                {loading ? "Входим..." : "Войти"}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
                <button
                  onClick={() => setShowForgot(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8BA7BE",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Забыли пароль?
                </button>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}>Нет аккаунта? </span>
                  <a
                    href="/signup"
                    style={{ fontSize: 13, color: "#C9A84C", textDecoration: "none", fontWeight: 700 }}
                  >
                    Начать бесплатно →
                  </a>
                </div>
                <a href="/" style={{ fontSize: 13, color: "#4a5a6a", textDecoration: "none" }}>
                  ← На главную
                </a>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                Восстановление пароля
              </h1>
              {!forgotSent ? (
                <>
                  <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>
                    Введите ваш номер телефона — администратор свяжется с вами
                  </p>
                  <input
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(formatPhone(e.target.value))}
                    placeholder="99 410 09 10"
                    style={{ ...inputStyle, marginBottom: 12 }}
                  />
                  <button
                    onClick={sendForgotRequest}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: "#C9A84C",
                      border: "none",
                      borderRadius: 10,
                      color: "#0A1628",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Georgia, serif",
                      marginBottom: 10,
                    }}
                  >
                    Отправить запрос
                  </button>
                  <button
                    onClick={() => setShowForgot(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8BA7BE",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Georgia, serif",
                      width: "100%",
                    }}
                  >
                    ← Назад
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center", paddingTop: 16 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 15, color: "#fff", marginBottom: 8 }}>Запрос отправлен!</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>
                    Администратор свяжется с вами в ближайшее время
                  </div>
                  <button
                    onClick={() => {
                      setShowForgot(false);
                      setForgotSent(false);
                      setForgotPhone("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#C9A84C",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    ← Назад к входу
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
