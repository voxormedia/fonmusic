"use client";
import { useState, useEffect } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function LeadForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Кафе");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!name || !phone) return;
    setLoading(true);
    const text = `🎵 Новая заявка FonMusic!\n\n🏢 Заведение: ${name}\n📞 Телефон: ${phone}\n🍽 Тип: ${type}`;
    await fetch(`https://api.telegram.org/bot8572453029:AAGacP96un1FuPOcj6hmc708pOBv7nYPIiI/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: "500210645", text }),
    });
    setLoading(false);
    setSent(true);
    onSuccess?.();
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "32px 24px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Заявка отправлена!</div>
      <div style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 24 }}>Мы свяжемся с вами в течение 30 минут</div>
      <a href="/demo" style={{ display: "block", padding: "16px", background: "#C9A84C", color: "#080C12", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
        Послушать демо прямо сейчас →
      </a>
    </div>
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Название заведения"
          style={{ padding: "16px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", width: "100%", boxSizing: "border-box" }} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 __ ___ __ __" type="tel"
          style={{ padding: "16px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", width: "100%", boxSizing: "border-box" }} />
        <select value={type} onChange={e => setType(e.target.value)}
          style={{ padding: "16px 18px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", width: "100%", boxSizing: "border-box" }}>
          {["Кафе", "Ресторан", "Магазин", "Отель", "Салон красоты", "Фитнес", "Бар", "Другое"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <button onClick={send} disabled={loading} style={{ width: "100%", padding: "18px", background: "#C9A84C", color: "#080C12", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(201,168,76,0.35)" }}>
        {loading ? "Отправляем..." : "Получить 7 дней бесплатно →"}
      </button>
      <div style={{ marginTop: 14, textAlign: "center", fontSize: 13, color: "#8BA7BE" }}>
        или <a href="tel:+998994100910" style={{ color: "#C9A84C", textDecoration: "none" }}>+998 99 410 09 10</a> · <a href="https://t.me/fonmusic2026" style={{ color: "#C9A84C", textDecoration: "none" }}>Telegram</a>
      </div>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (!mounted) return null;

  const m = isMobile;
  const px = m ? 20 : 48;

  const plans = [
  {
    name: "Базовый",
    usd: "599 000",
    sum: "",
    desc: "Для небольших заведений",
    popular: "",
    features: ["Веб-плеер в браузере", "30 000+ треков", "1 музыкальная станция", "Без рекламы", "Официальный сертификат"],
    highlight: false,
  },
  {
    name: "Стандарт",
    usd: "849 000",
    sum: "",
    desc: "Для кафе, ресторанов и магазинов",
    popular: "Самый популярный для кафе и ресторанов",
    features: ["Всё из Базового", "Все музыкальные станции", "Расписание музыки", "Смена атмосферы", "Удалённое управление"],
    highlight: true,
  },
  {
    name: "Премиум",
    usd: "999 000",
    sum: "",
    desc: "Идеально для сетей кофеен, магазинов и ресторанов",
    popular: "",
    features: ["Всё из Стандарта", "Несколько заведений", "Разные станции в точках", "Централизованное управление", "Приоритетная поддержка"],
    highlight: false,
  },
];

  const steps = [
    { num: "01", icon: "📋", title: "Выбираете тариф", desc: "Подбираем станцию под ваш бизнес" },
    { num: "02", icon: "🚀", title: "Получаете доступ", desc: "Приставка или веб-плеер за 30 минут" },
    { num: "03", icon: "🎵", title: "Музыка играет", desc: "Автоматически. Ничего не нужно делать" },
    { num: "04", icon: "📄", title: "Вы защищены", desc: "Официальный сертификат JAMENDO" },
  ];

  const risks = [
    { icon: "🚫", title: "Spotify и YouTube запрещены", desc: "Использование в коммерческих заведениях нарушает лицензию" },
    { icon: "💸", title: "Штрафы при проверке", desc: "Инспекторы могут выписать серьёзные санкции" },
    { icon: "📉", title: "Репутационный риск", desc: "Инцидент при проверке — удар по имиджу заведения" },
  ];

  const stations = [
    { icon: "☕", name: "Cozy Coffee", desc: "Кафе и кофейни" },
    { icon: "🍽️", name: "Dinner & Lounge", desc: "Рестораны" },
    { icon: "🛍️", name: "Shopping Vibes", desc: "Магазины" },
    { icon: "💆", name: "Spa Relax", desc: "Спа и салоны" },
    { icon: "🎸", name: "Bar Mood", desc: "Бары" },
    { icon: "💪", name: "Active Energy", desc: "Фитнес" },
  ];

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: "#080C12", color: "#E8EFF5", overflowX: "hidden", width: "100%" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: `16px ${px}px`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isScrolled ? "rgba(8,12,18,0.97)" : "transparent", backdropFilter: isScrolled ? "blur(20px)" : "none", borderBottom: isScrolled ? "1px solid rgba(201,168,76,0.15)" : "none", transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        {!m && (
          <div style={{ display: "flex", gap: 28, fontSize: 14 }}>
            <a href="#how" style={{ color: "#8BA7BE", textDecoration: "none" }}>Как работает</a>
            <a href="#pricing" style={{ color: "#8BA7BE", textDecoration: "none" }}>Тарифы</a>
            <a href="/demo" style={{ color: "#8BA7BE", textDecoration: "none" }}>Демо</a>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {!m && <a href="/demo" style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Демо</a>}
          <a href="#trial" style={{ padding: m ? "9px 14px" : "9px 20px", background: "#C9A84C", color: "#080C12", borderRadius: 8, fontSize: m ? 12 : 13, fontWeight: 700, textDecoration: "none" }}>
            {m ? "7 дней бесплатно" : "Начать бесплатно"}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${m ? 100 : 120}px ${px}px ${m ? 60 : 80}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: m ? 300 : 700, height: m ? 300 : 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, fontSize: 11, color: "#C9A84C", letterSpacing: "0.08em", marginBottom: 28 }}>
          ♪ JAMENDO LICENSED · ОФИЦИАЛЬНО
        </div>
        <h1 style={{ fontSize: m ? 36 : 64, fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: "#fff", maxWidth: 700 }}>
          Легальная музыка<br /><span style={{ color: "#C9A84C" }}>для вашего бизнеса</span>
        </h1>
        <p style={{ fontSize: m ? 15 : 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
          30 000+ лицензированных треков, готовые станции для кафе, ресторанов, магазинов и салонов. Официальный сертификат.
        </p>
        <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: 12, width: m ? "100%" : "auto", marginBottom: 48 }}>
          <a href="#trial" style={{ padding: m ? "18px 24px" : "16px 36px", background: "#C9A84C", color: "#080C12", borderRadius: 12, fontSize: m ? 16 : 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.3)", textAlign: "center" }}>
            Попробовать 7 дней бесплатно
          </a>
          <a href="/demo" style={{ padding: m ? "18px 24px" : "16px 36px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 12, fontSize: m ? 16 : 17, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
            ▶ Послушать демо
          </a>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: m ? 12 : 32 }}>
          {[{ val: "30 000+", label: "треков" }, { val: "7 дней", label: "бесплатно" }, { val: "100%", label: "легально" }, { val: "📄", label: "Сертификат" }].map(item => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: m ? 20 : 26, fontWeight: 700, color: "#C9A84C" }}>{item.val}</div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RISKS */}
      <section style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#EF4444", letterSpacing: "0.15em", marginBottom: 10 }}>⚠ ВАЖНО ЗНАТЬ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>Обычная музыка — риск для бизнеса</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {risks.map(r => (
              <div key={r.title} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px", background: "#0D1B2A", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>КАК ЭТО РАБОТАЕТ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>Просто. Быстро. Легально.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ display: "flex", gap: 16, alignItems: "center", padding: "20px", background: "#0D1B2A", border: `1px solid ${i === 0 ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: i === 0 ? "rgba(201,168,76,0.15)" : "rgba(26,107,154,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{step.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: "#C9A84C", marginBottom: 2 }}>Шаг {step.num}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATIONS */}
      <section style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>МУЗЫКАЛЬНЫЕ СТАНЦИИ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>Для каждого бизнеса</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {stations.map(s => (
              <div key={s.name} style={{ padding: "18px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "#8BA7BE" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="/demo" style={{ display: "inline-block", padding: "14px 28px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              ▶ Послушать все станции
            </a>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>ТАРИФЫ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Прозрачные цены</h2>
            {/* Объяснение что включено */}
            <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px", textAlign: "left", marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Одна подписка включает:</div>
              {["30 000+ треков Jamendo", "Готовые музыкальные станции", "Автоматическое воспроизведение", "Официальный сертификат для проверок"].map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#C9A84C" }}>✓</span>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Тарифные карточки */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{ padding: "24px", background: plan.highlight ? "linear-gradient(135deg, rgba(26,107,154,0.3), rgba(13,61,94,0.3))" : "#0D1B2A", border: `2px solid ${plan.highlight ? "#C9A84C" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, position: "relative" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, right: 20, background: "#C9A84C", color: "#080C12", padding: "4px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                    РЕКОМЕНДУЕМ
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{plan.name}</div>
                    <div style={{ fontSize: 13, color: "#8BA7BE" }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                   <div style={{ fontSize: 20, fontWeight: 700, color: "#C9A84C" }}>{plan.usd}</div>
                   <div style={{ fontSize: 11, color: "#8BA7BE" }}>сум / месяц</div>
                  </div>
                </div>
                {plan.popular && (
                  <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 12, padding: "4px 10px", background: "rgba(34,197,94,0.1)", borderRadius: 6, display: "inline-block" }}>
                    ⭐ {plan.popular}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#C9A84C", fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 13, color: plan.highlight ? "#E8EFF5" : "#8BA7BE" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#trial" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 10, background: plan.highlight ? "#C9A84C" : "rgba(201,168,76,0.1)", border: plan.highlight ? "none" : "1px solid rgba(201,168,76,0.3)", color: plan.highlight ? "#080C12" : "#C9A84C", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  Начать бесплатно →
                </a>
              </div>
            ))}
          </div>

          {/* FonMusic Box */}
          <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "28px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 8 }}>FONMUSIC BOX</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>🎵 Автоматическая музыка 24/7</h3>
            <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 16 }}>
              Небольшая приставка, которая подключается к интернету и вашей аудиосистеме. Музыка запускается автоматически и не зависит от браузера или компьютера.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["Автозапуск", "Работает 24/7", "Без компьютера", "Стабильно"].map(f => (
                <span key={f} style={{ padding: "5px 12px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 100, fontSize: 12, color: "#C9A84C" }}>{f}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>$70</div>
                <div style={{ fontSize: 12, color: "#8BA7BE" }}>единоразовая покупка</div>
              </div>
              <a href="#trial" style={{ padding: "13px 24px", background: "#C9A84C", color: "#080C12", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Заказать Box →
              </a>
            </div>
          </div>

          {/* Сравнение */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 20, textAlign: "center" }}>Веб-плеер vs FonMusic Box</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#8BA7BE", marginBottom: 12, textAlign: "center" }}>🌐 Веб-плеер</div>
                {["Музыка в браузере", "Нужен компьютер", "Может остановиться"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "#EF4444", fontSize: 12, flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 12, textAlign: "center" }}>📦 FonMusic Box</div>
                {["Работает 24/7", "Запускается сам", "Не зависит от браузера"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "#22C55E", fontSize: 12, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: "#E8EFF5", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRIAL FORM */}
      <section id="trial" style={{ padding: `64px ${px}px`, position: "relative", overflow: "hidden", background: "#0A0F18" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12 }}>НАЧНИТЕ СЕГОДНЯ</div>
            <h2 style={{ fontSize: m ? 32 : 44, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              7 дней <span style={{ color: "#C9A84C" }}>бесплатно</span>
            </h2>
            <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.6 }}>
              Подключите ваше заведение уже сегодня. Музыка начнёт играть через несколько минут.
            </p>
          </div>
          <LeadForm />
          <div style={{ marginTop: 28, textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
            <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 12 }}>Хотите сначала послушать?</div>
            <a href="/demo" style={{ display: "inline-block", padding: "12px 24px", background: "transparent", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              ▶ Открыть демо-плеер
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: `28px ${px}px`, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: m ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 18, background: "#C9A84C", borderRadius: 2 }} />
              <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>FonMusic</span>
            </div>
            <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: m ? 8 : 24, fontSize: 13, color: "#8BA7BE" }}>
              <a href="tel:+998994100910" style={{ color: "#8BA7BE", textDecoration: "none" }}>+998 99 410 09 10</a>
              <a href="https://t.me/fonmusic2026" style={{ color: "#8BA7BE", textDecoration: "none" }}>Telegram</a>
              <span>info@fonmusic.uz</span>
            </div>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>© 2026 FonMusic.uz</div>
          </div>
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { max-width: 100vw; overflow-x: hidden; scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}
