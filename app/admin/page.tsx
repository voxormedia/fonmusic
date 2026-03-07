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

function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Ресторан");
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
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "32px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Заявка отправлена!</div>
      <div style={{ fontSize: 15, color: "#8BA7BE" }}>Мы свяжемся с вами в течение 30 минут</div>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Название заведения"
          style={{ padding: "14px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ваш телефон (+998...)"
          style={{ padding: "14px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }} />
        <select value={type} onChange={e => setType(e.target.value)}
          style={{ padding: "14px 18px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }}>
          {["Ресторан", "Кафе", "Магазин", "Отель", "Салон красоты", "Фитнес", "Другое"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <button onClick={send} disabled={loading} style={{ width: "100%", padding: "18px", background: "#C9A84C", color: "#080C12", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer", boxSizing: "border-box" }}>
        {loading ? "Отправляем..." : "Получить 10 дней бесплатно →"}
      </button>
      <div style={{ marginTop: 16, fontSize: 13, color: "#8BA7BE" }}>
        или <a href="tel:+998994100910" style={{ color: "#C9A84C" }}>+998 99 410 09 10</a> · <a href="https://t.me/fonmusic2026" style={{ color: "#C9A84C" }}>Telegram</a>
      </div>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
    if (!mounted) return null;
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeGenre, setActiveGenre] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveGenre(p => (p + 1) % genres.length), 2000);
    return () => clearInterval(interval);
  }, []);

  const genres = ["Джаз", "Лаунж", "Поп", "Классика", "Эмбиент", "Босса-нова", "Инди", "Фанк"];

  const plans = [
    { name: "Базовый", price: "625 000", usd: "$50", desc: "Веб-плеер для старта", features: ["Доступ через браузер", "1 жанр на выбор", "Официальный сертификат", "Базовая поддержка"], highlight: false },
    { name: "Стандарт", price: "875 000", usd: "$70", desc: "Android TV + автоматизация", features: ["Автозапуск при включении", "Все 27 жанров", "Официальный сертификат", "Приоритетная поддержка"], highlight: true },
    { name: "Премиум", price: "1 250 000", usd: "$100", desc: "Для сетей от 5 точек", features: ["Скидка от 20%", "Личный кабинет", "Разные жанры в каждой точке", "Персональный менеджер"], highlight: false },
  ];

  const steps = [
    { num: "01", title: "Выбираете тариф", desc: "Подбираем жанр и настроение музыки для вашего заведения" },
    { num: "02", title: "Мы устанавливаем", desc: "Приставка Android TV устанавливается за 30 минут" },
    { num: "03", title: "Музыка играет", desc: "Автозапуск при включении. Ничего не нужно настраивать" },
    { num: "04", title: "Вы защищены", desc: "Официальный сертификат на каждое заведение" },
  ];

  const px = isMobile ? "20px" : "48px";

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: "#080C12", color: "#E8EFF5", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: `16px ${px}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isScrolled ? "rgba(8,12,18,0.95)" : "transparent", backdropFilter: isScrolled ? "blur(20px)" : "none", borderBottom: isScrolled ? "1px solid rgba(201,168,76,0.15)" : "none", transition: "all 0.4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#8BA7BE" }}>
            <a href="#how" style={{ color: "#8BA7BE", textDecoration: "none" }}>Как это работает</a>
            <a href="#pricing" style={{ color: "#8BA7BE", textDecoration: "none" }}>Тарифы</a>
            <a href="#contact" style={{ color: "#8BA7BE", textDecoration: "none" }}>Контакты</a>
          </div>
        )}
        <a href="#contact" style={{ padding: isMobile ? "8px 16px" : "10px 24px", background: "#C9A84C", color: "#080C12", borderRadius: 6, fontSize: isMobile ? 12 : 14, fontWeight: 700, textDecoration: "none" }}>
          {isMobile ? "Начать" : "Начать бесплатно"}
        </a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: isMobile ? "100px 20px 60px" : "120px 48px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", right: "-5%", width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,107,154,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, fontSize: 11, color: "#C9A84C", letterSpacing: "0.08em", marginBottom: 24, fontFamily: "monospace" }}>
              ♪ ЛИЦЕНЗИОННАЯ ФОНОВАЯ МУЗЫКА
            </div>
            <h1 style={{ fontSize: isMobile ? 40 : 64, fontWeight: 400, lineHeight: 1.1, marginBottom: 20, color: "#fff", fontStyle: "italic" }}>
              Музыка для<br />
              <span style={{ color: "#C9A84C", fontStyle: "normal", fontWeight: 700 }}>вашего бизнеса</span>
            </h1>
            <p style={{ fontSize: isMobile ? 15 : 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              Легальная фоновая музыка для ресторанов, магазинов и кафе в Узбекистане. Официальный сертификат. Автоматически.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <a href="#contact" style={{ padding: isMobile ? "14px 24px" : "16px 36px", background: "#C9A84C", color: "#080C12", borderRadius: 8, fontSize: isMobile ? 14 : 16, fontWeight: 700, textDecoration: "none" }}>
                Первые 10 дней бесплатно →
              </a>
              {!isMobile && <a href="#how" style={{ padding: "16px 24px", color: "#8BA7BE", fontSize: 14, textDecoration: "none" }}>Как это работает ↓</a>}
            </div>
            <div style={{ display: "flex", gap: isMobile ? 24 : 40, marginTop: 40 }}>
              {[["600K+", "треков"], ["27", "жанров"], ["100%", "легально"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#C9A84C" }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre card */}
          <div style={{ position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: isMobile ? 24 : 40, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 16, fontFamily: "monospace" }}>▶ СЕЙЧАС ИГРАЕТ</div>
              <div style={{ fontSize: isMobile ? 32 : 48, fontWeight: 700, color: "#fff", marginBottom: 8, fontStyle: "italic" }}>{genres[activeGenre]}</div>
              <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 24 }}>Автоматически подобранный плейлист</div>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 40, marginBottom: 24 }}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} style={{ flex: 1, background: i % 3 === 0 ? "#C9A84C" : "#1A6B9A", borderRadius: 2, opacity: 0.7, height: `${20 + Math.sin(i * 0.8 + activeGenre) * 60}%`, transition: "height 0.5s ease" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Ресторан", "Кафе", "Магазин", "Отель", "Салон", "Фитнес"].map(tag => (
                  <span key={tag} style={{ padding: "3px 10px", background: "rgba(26,107,154,0.2)", border: "1px solid rgba(26,107,154,0.3)", borderRadius: 100, fontSize: 11, color: "#8BA7BE" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", top: -16, right: -12, background: "#C9A84C", color: "#080C12", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, boxShadow: "0 8px 24px rgba(201,168,76,0.4)" }}>
              ✓ Официальный<br />сертификат
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: `80px ${px}`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "monospace" }}>ПРОБЛЕМА</div>
            <h2 style={{ fontSize: isMobile ? 28 : 44, fontWeight: 700, color: "#fff" }}>Незаконная музыка —<br />угроза для бизнеса</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
            {[
              { icon: "⚠️", title: "Spotify и YouTube запрещены", desc: "Использование стриминговых сервисов в коммерческих заведениях нарушает условия лицензии" },
              { icon: "💸", title: "Серьёзные штрафы", desc: "При проверке инспекторами бизнес рискует получить значительные санкции" },
              { icon: "😰", title: "Репутационный риск", desc: "Инцидент при проверке может нанести серьёзный ущерб имиджу заведения" },
            ].map(item => (
              <div key={item.title} style={{ padding: isMobile ? 24 : 32, background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: `80px ${px}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "monospace" }}>КАК ЭТО РАБОТАЕТ</div>
            <h2 style={{ fontSize: isMobile ? 28 : 44, fontWeight: 700, color: "#fff" }}>Просто. Быстро. Легально.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 16 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ padding: isMobile ? 20 : 32, background: "#0D1B2A", border: `1px solid ${i === 0 ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16 }}>
                <div style={{ fontSize: isMobile ? 32 : 48, fontWeight: 700, color: i === 0 ? "#C9A84C" : "rgba(26,107,154,0.5)", marginBottom: 12 }}>{step.num}</div>
                <h3 style={{ fontSize: isMobile ? 13 : 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: `80px ${px}`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "monospace" }}>ТАРИФЫ</div>
            <h2 style={{ fontSize: isMobile ? 28 : 44, fontWeight: 700, color: "#fff" }}>Прозрачные цены</h2>
            <p style={{ fontSize: 14, color: "#8BA7BE", marginTop: 12 }}>Цены в эквиваленте по курсу ЦБ РУз на дату оплаты</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 16 : 24 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{ padding: isMobile ? 28 : 40, background: plan.highlight ? "linear-gradient(135deg, #1A6B9A, #0D3D5E)" : "#0D1B2A", border: `2px solid ${plan.highlight ? "#C9A84C" : "rgba(255,255,255,0.06)"}`, borderRadius: 20, position: "relative", transform: isMobile ? "scale(1)" : plan.highlight ? "scale(1.05)" : "scale(1)" }}>
                {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", color: "#080C12", padding: "5px 18px", borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>РЕКОМЕНДУЕМ</div>}
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>{plan.desc}</p>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: plan.highlight ? "#fff" : "#C9A84C" }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}> сум/мес</span>
                </div>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 24 }}>≈ {plan.usd} / по курсу ЦБ</div>
                <div style={{ borderTop: `1px solid ${plan.highlight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`, paddingTop: 20, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ color: "#C9A84C" }}>✓</span>
                      <span style={{ fontSize: 13, color: plan.highlight ? "#E8EFF5" : "#8BA7BE" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#contact" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 8, background: plan.highlight ? "#C9A84C" : "rgba(201,168,76,0.1)", border: plan.highlight ? "none" : "1px solid rgba(201,168,76,0.3)", color: plan.highlight ? "#080C12" : "#C9A84C", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  Подключить →
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "#8BA7BE", marginTop: 32 }}>★ Первые 10 дней — бесплатно для новых клиентов</p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" style={{ padding: `80px ${px}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 20, fontFamily: "monospace" }}>НАЧНИТЕ СЕГОДНЯ</div>
          <h2 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 700, color: "#fff", marginBottom: 20, fontStyle: "italic" }}>
            Первые 10 дней —<br />
            <span style={{ color: "#C9A84C", fontStyle: "normal" }}>бесплатно</span>
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 40 }}>
            Подключите ваше заведение уже сегодня.<br />Музыка будет играть завтра утром.
          </p>
          <LeadForm />
          <div style={{ marginTop: 40, fontSize: 13, color: "#8BA7BE" }}>
            fonmusic.uz · +998 99 410 09 10 · info@fonmusic.uz
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: `24px ${px}`, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 12, color: "#8BA7BE", textAlign: isMobile ? "center" : "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 18, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div>© 2026 FonMusic.uz — Лицензионная фоновая музыка для бизнеса</div>
        <div>Ташкент, Узбекистан</div>
      </footer>

      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } html { scroll-behavior: smooth; }`}</style>
    </main>
  );
}
