"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PLANS: Record<string, { name: string; price: number; boxFreeMonths: number; accent: string }> = {
  basic: { name: "Базовый", price: 399000, boxFreeMonths: 12, accent: "#8BA7BE" },
  standard: { name: "Стандарт", price: 599000, boxFreeMonths: 9, accent: "#C9A84C" },
  premium: { name: "Премиум", price: 799000, boxFreeMonths: 6, accent: "#A78BFA" },
};

const PERIODS = [1, 3, 6, 9, 12];

function formatSum(value: number) {
  return value.toLocaleString("ru-RU").replace(/\u00a0/g, " ");
}

function CheckoutContent() {
  const params = useSearchParams();
  const planKey = params.get("plan") || "standard";
  const plan = PLANS[planKey] || PLANS.standard;
  const period = Number(params.get("period") || "1");
  const months = PERIODS.includes(period) ? period : 1;
  const total = plan.price * months;
  const boxText = months >= plan.boxFreeMonths
    ? `FonMusic Box: 0 сум при оплате за ${plan.boxFreeMonths} мес.`
    : "FonMusic Box: 750 000 сум отдельно";

  return (
    <main style={{ minHeight: "100vh", background: "#0A1628", color: "#E8EFF5", fontFamily: "Georgia, serif", padding: 20 }}>
      <nav style={{ maxWidth: 900, margin: "0 auto 34px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18 }}>FonMusic</Link>
        <a href="/pricing" style={{ color: "#8BA7BE", textDecoration: "none", fontSize: 13 }}>← Тарифы</a>
      </nav>

      <section style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: "#0D1B2A", border: `1px solid ${plan.accent}55`, borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 12, color: plan.accent, fontWeight: 800, marginBottom: 8 }}>ОНЛАЙН-ОПЛАТА</div>
          <h1 style={{ fontSize: 32, color: "#fff", marginBottom: 8 }}>Подключение тарифа {plan.name}</h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 24 }}>
            Онлайн-оплата скоро будет доступна. Сейчас можно подключиться через менеджера.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
            {PERIODS.map(item => (
              <a key={item} href={`/checkout?plan=${planKey}&period=${item}`} style={{ padding: "12px 8px", borderRadius: 10, textAlign: "center", textDecoration: "none", background: item === months ? `${plan.accent}22` : "rgba(255,255,255,0.04)", border: `1px solid ${item === months ? plan.accent : "rgba(255,255,255,0.08)"}`, color: item === months ? plan.accent : "#8BA7BE", fontSize: 13, fontWeight: 800 }}>
                {item} мес.
              </a>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <span style={{ color: "#8BA7BE", fontSize: 14 }}>Тариф</span>
              <span style={{ color: "#fff", fontWeight: 800 }}>{plan.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <span style={{ color: "#8BA7BE", fontSize: 14 }}>Период</span>
              <span style={{ color: "#fff", fontWeight: 800 }}>{months} мес.</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <span style={{ color: "#8BA7BE", fontSize: 14 }}>Сумма</span>
              <span style={{ color: "#fff", fontWeight: 800 }}>{formatSum(total)} сум</span>
            </div>
            <div style={{ color: "#22C55E", fontSize: 13, fontWeight: 800 }}>{boxText}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <button disabled style={{ padding: 15, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#4a5a6a", fontWeight: 800, cursor: "not-allowed", fontFamily: "Georgia, serif" }}>Оплатить через Payme</button>
            <button disabled style={{ padding: 15, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#4a5a6a", fontWeight: 800, cursor: "not-allowed", fontFamily: "Georgia, serif" }}>Оплатить через Click</button>
          </div>
          <a href="https://t.me/fonmusic2026" target="_blank" style={{ display: "block", textAlign: "center", padding: 16, borderRadius: 12, background: "#C9A84C", color: "#0A1628", textDecoration: "none", fontWeight: 800, marginBottom: 16 }}>
            Связаться для оплаты
          </a>
          <p style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>
            Нажимая кнопку оплаты, вы принимаете <a href="/offer" style={{ color: "#C9A84C" }}>публичную оферту</a>, <a href="/privacy" style={{ color: "#C9A84C" }}>политику конфиденциальности</a> и <a href="/license" style={{ color: "#C9A84C" }}>условия лицензии</a>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#0A1628" }} />}>
      <CheckoutContent />
    </Suspense>
  );
}
