"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PLANS: Record<string, string> = {
  basic: "Базовый",
  standard: "Стандарт",
  premium: "Премиум",
};

type FormState = {
  companyName: string;
  tin: string;
  legalAddress: string;
  contactName: string;
  phone: string;
  messenger: string;
  email: string;
  plan: string;
  locationsCount: string;
  needsBox: boolean;
  comment: string;
};

const TEXT_FIELDS: Array<{ key: keyof Omit<FormState, "needsBox" | "plan" | "comment">; label: string }> = [
  { key: "companyName", label: "Название организации *" },
  { key: "tin", label: "ИНН" },
  { key: "legalAddress", label: "Юридический адрес" },
  { key: "contactName", label: "ФИО ответственного лица *" },
  { key: "phone", label: "Телефон *" },
  { key: "messenger", label: "Telegram / WhatsApp" },
  { key: "email", label: "Email" },
  { key: "locationsCount", label: "Количество точек / зон" },
];

function InvoiceRequestContent() {
  const params = useSearchParams();
  const initialPlan = params.get("plan") || "standard";
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    companyName: "",
    tin: "",
    legalAddress: "",
    contactName: "",
    phone: "",
    messenger: "",
    email: "",
    plan: PLANS[initialPlan] ? initialPlan : "standard",
    locationsCount: "1",
    needsBox: false,
    comment: "",
  });

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id") || "";
    if (!clientId) return;
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?id=eq.${clientId}&select=name,phone`, {
      headers: {
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
      },
    }).then(res => res.ok ? res.json() : null).then(data => {
      const client = data?.[0];
      if (!client) return;
      setForm(prev => ({
        ...prev,
        companyName: prev.companyName || client.name || "",
        contactName: prev.contactName || client.name || "",
        phone: prev.phone || client.phone || "",
      }));
    }).catch(() => {});
  }, []);

  const setField = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/invoice-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        clientId: localStorage.getItem("fonmusic_client_id"),
        locationsCount: Number(form.locationsCount || 1),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Не удалось отправить заявку. Напишите нам в Telegram.");
      return;
    }
    setSent(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    background: "#101A28",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "Georgia, serif",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0A1628", color: "#E8EFF5", fontFamily: "Georgia, serif", padding: 20 }}>
      <nav style={{ maxWidth: 900, margin: "0 auto 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18 }}>FonMusic</Link>
        <a href="/pricing" style={{ color: "#8BA7BE", textDecoration: "none", fontSize: 13 }}>← Тарифы</a>
      </nav>

      <section style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 20, padding: 28 }}>
          {!sent ? (
            <>
              <div style={{ fontSize: 12, color: "#C9A84C", fontWeight: 800, marginBottom: 8 }}>СЧЁТ И ДОГОВОР</div>
              <h1 style={{ fontSize: 30, color: "#fff", marginBottom: 8 }}>Запросить официальное подключение</h1>
              <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 22 }}>Подготовим счёт, договор и документы для вашей организации.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {TEXT_FIELDS.map(({ key, label }) => (
                  <label key={key} style={{ display: "block" }}>
                    <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{label}</div>
                    <input value={form[key]} onChange={e => setField(key, e.target.value)} style={inputStyle} />
                  </label>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <label>
                  <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Выбранный тариф</div>
                  <select value={form.plan} onChange={e => setField("plan", e.target.value)} style={inputStyle}>
                    {Object.entries(PLANS).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", alignItems: "flex-end", gap: 10, paddingBottom: 12 }}>
                  <input type="checkbox" checked={form.needsBox} onChange={e => setField("needsBox", e.target.checked)} style={{ width: 18, height: 18, accentColor: "#C9A84C" }} />
                  <span style={{ color: "#E8EFF5", fontSize: 14 }}>Нужен FonMusic Box</span>
                </label>
              </div>

              <label style={{ display: "block", marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Комментарий</div>
                <textarea value={form.comment} onChange={e => setField("comment", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </label>

              {error && <div style={{ color: "#EF4444", fontSize: 13, marginTop: 14 }}>{error}</div>}
              <button onClick={submit} disabled={loading || !form.companyName || !form.contactName || !form.phone} style={{ width: "100%", padding: 16, borderRadius: 12, background: "#C9A84C", color: "#0A1628", border: "none", fontSize: 15, fontWeight: 800, cursor: loading ? "wait" : "pointer", fontFamily: "Georgia, serif", marginTop: 18, opacity: loading || !form.companyName || !form.contactName || !form.phone ? 0.65 : 1 }}>
                {loading ? "Отправляем..." : "Запросить счёт"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "28px 6px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>✓</div>
              <h1 style={{ fontSize: 28, color: "#fff", marginBottom: 10 }}>Заявка получена</h1>
              <p style={{ color: "#8BA7BE", fontSize: 14, lineHeight: 1.7, marginBottom: 22 }}>Мы подготовим счёт и свяжемся с вами.</p>
              <a href="/dashboard" style={{ display: "inline-block", padding: "14px 24px", borderRadius: 12, background: "#C9A84C", color: "#0A1628", textDecoration: "none", fontWeight: 800 }}>В кабинет</a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function InvoiceRequestPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#0A1628" }} />}>
      <InvoiceRequestContent />
    </Suspense>
  );
}
