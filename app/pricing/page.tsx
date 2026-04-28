"use client";
import { useState } from "react";

const BOX_IMAGE = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev/images/fonmusic-box-small.png";

const PLANS = [
  {
    key: "basic",
    name: "Базовый",
    price: "499 000",
    desc: "Для одного небольшого заведения",
    popular: false,
    features: ["1 точка", "Все музыкальные атмосферы", "Веб-плеер", "Ручное переключение музыки"],
    missing: ["Автоматическое расписание"],
    ctaHref: "/signup",
    accent: "#8BA7BE",
    box: false,
  },
  {
    key: "standard",
    name: "Стандарт",
    price: "699 000",
    desc: "Оптимальный тариф для кафе, магазинов, салонов и фитнес-клубов",
    popular: true,
    features: ["1 точка", "Все музыкальные атмосферы", "Веб-плеер", "Автоматическое расписание музыки", "Удалённое управление"],
    missing: [],
    ctaHref: "/signup?plan=standard",
    accent: "#C9A84C",
    box: true,
  },
  {
    key: "premium",
    name: "Премиум",
    price: "999 000",
    desc: "Для сетей кафе, ресторанов, магазинов, фитнес-клубов и салонов красоты",
    popular: false,
    features: ["1 точка включена", "Все функции тарифа Стандарт", "Централизованное управление сетью", "Приоритетная поддержка"],
    missing: [],
    ctaHref: "/signup?plan=premium",
    accent: "#A78BFA",
    box: true,
  },
];

const COMPARE = [
  { label: "Количество точек", basic: "1", standard: "1", premium: "∞" },
  { label: "Все атмосферы", basic: true, standard: true, premium: true },
  { label: "Веб-плеер", basic: true, standard: true, premium: true },
  { label: "Автоматическое расписание", basic: false, standard: true, premium: true },
  { label: "Удалённое управление", basic: false, standard: true, premium: true },
  { label: "Управление сетью", basic: false, standard: false, premium: true },
  { label: "Приоритетная поддержка", basic: false, standard: false, premium: true },
];

const FAQS = [
  { q: "Можно ли использовать без FonMusic Box?", a: "Да, музыка работает через веб-плеер на любом устройстве — компьютере, планшете или телефоне." },
  { q: "Нужно ли покупать устройство сразу?", a: "Нет, FonMusic Box подключается по желанию в любой момент. Начните с веб-плеера." },
  { q: "Можно ли сначала попробовать?", a: "Да, демо-период — 7 дней. Все функции доступны без ограничений." },
  { q: "Один аккаунт для нескольких филиалов?", a: "Да, в тарифе Премиум можно добавлять дополнительные заведения по 599 000 сум/мес." },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ fontFamily: "Georgia, serif", background: "#080C12", color: "#E8EFF5", minHeight: "100vh", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <a href="/" style={{ fontSize: 18, fontWeight: 700, color: "#fff", textDecoration: "none" }}>FonMusic</a>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/login" style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>Войти</a>
          <a href="/signup" style={{ fontSize: 13, color: "#080C12", background: "#C9A84C", textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700 }}>Попробовать бесплатно</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "80px 20px 40px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 24 }}>
          ♪ ЛИЦЕНЗИРОВАННАЯ МУЗЫКА ДЛЯ БИЗНЕСА — ОТ 499 000 СУМ В МЕСЯЦ
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.15 }}>Тарифы FonMusic</h1>
        <p style={{ fontSize: 18, color: "#8BA7BE", maxWidth: 520, margin: "0 auto 8px" }}>
          Выберите подходящий тариф — от одной точки до сети филиалов
        </p>
        <p style={{ fontSize: 13, color: "#4a5a6a", marginTop: 8 }}>
          Лицензированная музыка для бизнеса · Без рекламы · Официальный сертификат
        </p>
      </section>

      {/* NOTE */}
      <div style={{ textAlign: "center", padding: "16px 20px 32px", fontSize: 13, color: "#8BA7BE" }}>
        1 точка = 1 устройство воспроизведения: веб-плеер или FonMusic Box
      </div>

      {/* PRICING CARDS */}
      <section style={{ padding: "0 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
          {PLANS.map((plan) => (
            <div key={plan.key} style={{ position: "relative", borderRadius: 20, padding: plan.popular ? "32px 24px" : "28px 24px", background: plan.popular ? "linear-gradient(135deg, #0D1B2A, #162435)" : "#0D1B2A", border: `2px solid ${plan.popular ? plan.accent : "rgba(255,255,255,0.06)"}`, boxShadow: plan.popular ? `0 0 40px ${plan.accent}20` : "none" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: plan.accent, color: "#080C12", padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                  ⭐ Самый популярный
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: plan.accent, fontWeight: 700, marginBottom: 6, letterSpacing: "0.05em" }}>{plan.name.toUpperCase()}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: "#4a5a6a", marginBottom: 10 }}>сум / месяц · за 1 точку</div>
                <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.5 }}>{plan.desc}</div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: plan.accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#E8EFF5", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: "#4a5a6a", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✗</span>
                    <span style={{ fontSize: 13, color: "#4a5a6a", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {plan.box && (
                <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>📦 FonMusic Box (по желанию)</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.5 }}>
                    750 000 сум · или <span style={{ color: "#22C55E", fontWeight: 700 }}>бесплатно</span> при оплате за 3 месяца
                  </div>
                </div>
              )}

              {plan.key === "premium" && (
                <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, marginBottom: 6 }}>Дополнительные заведения</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>599 000 сум / мес за каждое</div>
                  <div style={{ fontSize: 11, color: "#4a5a6a", lineHeight: 1.6 }}>
                    2 точки — 1 598 000 сум<br />
                    3 точки — 2 197 000 сум<br />
                    5 точек — 3 395 000 сум
                  </div>
                </div>
              )}

              <a href={plan.ctaHref} style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 12, background: plan.popular ? plan.accent : "rgba(255,255,255,0.06)", border: plan.popular ? "none" : `1px solid ${plan.accent}40`, color: plan.popular ? "#080C12" : plan.accent, fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 8 }}>
                Попробовать бесплатно
              </a>
              <div style={{ textAlign: "center", fontSize: 11, color: "#4a5a6a" }}>
                7 дней бесплатно · без обязательств
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 32 }}>Сравнение тарифов</h2>
        <div style={{ background: "#0D1B2A", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>Функция</div>
            {["Базовый", "Стандарт", "Премиум"].map((p, i) => (
              <div key={p} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: i === 1 ? "#C9A84C" : "#8BA7BE" }}>{p}</div>
            ))}
          </div>
          {COMPARE.map((row, i) => (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < COMPARE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>{row.label}</div>
              {[row.basic, row.standard, row.premium].map((val, j) => (
                <div key={j} style={{ textAlign: "center" }}>
                  {typeof val === "boolean"
                    ? <span style={{ color: val ? "#22C55E" : "#4a5a6a", fontSize: 16 }}>{val ? "✓" : "✗"}</span>
                    : <span style={{ fontSize: 13, color: j === 1 ? "#C9A84C" : "#8BA7BE", fontWeight: 700 }}>{val}</span>
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* WHICH PLAN */}
      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 32 }}>Какой тариф подойдёт вашему бизнесу?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "☕", plan: "Базовый", color: "#8BA7BE", desc: "Если у вас одно небольшое заведение и музыка включается вручную" },
            { icon: "🎵", plan: "Стандарт", color: "#C9A84C", desc: "Если хотите, чтобы музыка автоматически менялась в течение дня" },
            { icon: "🏢", plan: "Премиум", color: "#A78BFA", desc: "Если у вас несколько точек и нужен единый контроль из одного кабинета" },
          ].map(item => (
            <div key={item.plan} style={{ display: "flex", gap: 16, alignItems: "center", padding: "18px 20px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.plan}</span>
                <span style={{ fontSize: 13, color: "#8BA7BE" }}> — {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOX BLOCK */}
      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 20, padding: "40px 32px", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 10 }}>FONMUSIC BOX</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Музыка 24/7 без компьютера и браузера</h2>
            <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 16 }}>
              FonMusic Box — маленькое устройство, которое подключается к аудиосистеме заведения и автоматически запускает музыку.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { icon: "📡", text: "Работает круглосуточно без перерывов" },
                { icon: "⚡", text: "Автоматически запускает музыку после включения" },
                { icon: "🎛️", text: "Управляется через кабинет FonMusic" },
              ].map(f => (
                <div key={f.text} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}>{f.text}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>750 000 сум</div>
            <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 4 }}>или бесплатно при оплате подписки за 3 месяца</div>
            <div style={{ fontSize: 11, color: "#4a5a6a", marginBottom: 20 }}>FonMusic Box является опцией. Можно использовать сервис через веб-плеер без покупки устройства.</div>
            <a href="https://t.me/fonmusic2026" target="_blank" style={{ display: "inline-block", padding: "13px 24px", background: "#C9A84C", color: "#080C12", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Подключить FonMusic Box →
            </a>
          </div>
          <div style={{ flexShrink: 0, width: 180 }}>
            <img src={BOX_IMAGE} alt="FonMusic Box" style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(201,168,76,0.2)" }} />
          </div>
        </div>
      </section>

      {/* DEMO BLOCK */}
      <section style={{ padding: "0 20px 60px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)", padding: "48px 32px", borderRadius: 20, border: "1px solid rgba(201,168,76,0.15)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            Попробуйте FonMusic <span style={{ color: "#C9A84C" }}>бесплатно 7 дней</span>
          </h2>
          <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 8 }}>
            Во время демо-периода все функции доступны бесплатно 7 дней. После демо вы можете выбрать подходящий тариф.
          </p>
          <p style={{ fontSize: 13, color: "#4a5a6a", marginBottom: 28 }}>Без карты, без обязательств.</p>
          <a href="/signup" style={{ display: "inline-block", padding: "18px 40px", background: "#C9A84C", color: "#080C12", borderRadius: 12, fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.3)" }}>
            Начать 7 дней бесплатно →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 20px 80px", maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 28 }}>Частые вопросы</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "left" }}>{faq.q}</span>
                <span style={{ color: "#C9A84C", fontSize: 16, flexShrink: 0 }}>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 18px", fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div style={{ fontSize: 12, color: "#4a5a6a" }}>© 2026 FonMusic.uz · Voxor Media Group</div>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/offer" style={{ fontSize: 12, color: "#4a5a6a", textDecoration: "none" }}>Оферта</a>
          <a href="/privacy" style={{ fontSize: 12, color: "#4a5a6a", textDecoration: "none" }}>Конфиденциальность</a>
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { overflow-x: hidden; }
      `}</style>
    </main>
  );
}
