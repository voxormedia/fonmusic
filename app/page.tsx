"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeGenre, setActiveGenre] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGenre((prev) => (prev + 1) % genres.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const genres = ["Джаз", "Лаунж", "Поп", "Классика", "Эмбиент", "Босса-нова", "Инди", "Фанк"];

  const plans = [
    {
      name: "Базовый",
      price: "625 000",
      usd: "$50",
      desc: "Веб-плеер для старта",
      features: ["Доступ через браузер", "1 жанр на выбор", "Официальный сертификат", "Базовая поддержка"],
      highlight: false,
    },
    {
      name: "Стандарт",
      price: "875 000",
      usd: "$70",
      desc: "Android TV + автоматизация",
      features: ["Автозапуск при включении", "Все 27 жанров", "Официальный сертификат", "Приоритетная поддержка"],
      highlight: true,
    },
    {
      name: "Премиум",
      price: "1 250 000",
      usd: "$100",
      desc: "Для сетей от 5 точек",
      features: ["Скидка от 20%", "Личный кабинет", "Разные жанры в каждой точке", "Персональный менеджер"],
      highlight: false,
    },
  ];

  const steps = [
    { num: "01", title: "Выбираете тариф", desc: "Подбираем жанр и настроение музыки для вашего заведения" },
    { num: "02", title: "Мы устанавливаем", desc: "Приставка Android TV устанавливается за 30 минут" },
    { num: "03", title: "Музыка играет", desc: "Автозапуск при включении. Ничего не нужно настраивать" },
    { num: "04", title: "Вы защищены", desc: "Официальный сертификат на каждое заведение" },
  ];

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: "#080C12", color: "#E8EFF5", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "20px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: isScrolled ? "rgba(8,12,18,0.95)" : "transparent",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(201,168,76,0.15)" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 8, height: 32, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>FonMusic</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#8BA7BE" }}>
          <a href="#how" style={{ color: "#8BA7BE", textDecoration: "none" }}>Как это работает</a>
          <a href="#pricing" style={{ color: "#8BA7BE", textDecoration: "none" }}>Тарифы</a>
          <a href="#contact" style={{ color: "#8BA7BE", textDecoration: "none" }}>Контакты</a>
        </div>
        <a href="#contact" style={{
          padding: "10px 24px", background: "#C9A84C", color: "#080C12",
          borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none",
          letterSpacing: "0.03em",
        }}>Начать бесплатно</a>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "120px 48px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background effects */}
        <div style={{
          position: "absolute", top: "10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,107,154,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", left: "30%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100,
              fontSize: 12, color: "#C9A84C", letterSpacing: "0.1em",
              marginBottom: 32, fontFamily: "monospace",
            }}>
              ♪ ЛИЦЕНЗИОННАЯ ФОНОВАЯ МУЗЫКА
            </div>

            <h1 style={{
              fontSize: 64, fontWeight: 400, lineHeight: 1.1,
              marginBottom: 24, color: "#fff",
              fontStyle: "italic",
            }}>
              Музыка для<br />
              <span style={{ color: "#C9A84C", fontStyle: "normal", fontWeight: 700 }}>вашего бизнеса</span>
            </h1>

            <p style={{ fontSize: 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 48, maxWidth: 480 }}>
              Легальная фоновая музыка для ресторанов, магазинов и кафе в Узбекистане. 
              Официальный сертификат. Автоматически. Без забот.
            </p>

            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="#contact" style={{
                padding: "16px 36px", background: "#C9A84C", color: "#080C12",
                borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: "none",
              }}>
                Первый месяц бесплатно →
              </a>
              <a href="#how" style={{
                padding: "16px 24px", color: "#8BA7BE",
                fontSize: 14, textDecoration: "none",
              }}>
                Как это работает ↓
              </a>
            </div>

            <div style={{ display: "flex", gap: 40, marginTop: 56 }}>
              {[["600K+", "треков"], ["27", "жанров"], ["100%", "легально"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#C9A84C" }}>{val}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre card */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "linear-gradient(135deg, #0D1B2A, #162435)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 24, padding: 40,
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            }}>
              <div style={{ fontSize: 12, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 24, fontFamily: "monospace" }}>
                ▶ СЕЙЧАС ИГРАЕТ
              </div>
              <div style={{
                fontSize: 48, fontWeight: 700, color: "#fff",
                marginBottom: 8, transition: "all 0.5s ease",
                fontStyle: "italic",
              }}>
                {genres[activeGenre]}
              </div>
              <div style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 32 }}>
                Автоматически подобранный плейлист
              </div>

              {/* Waveform animation */}
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48, marginBottom: 32 }}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} style={{
                    flex: 1, background: i % 3 === 0 ? "#C9A84C" : "#1A6B9A",
                    borderRadius: 2, opacity: 0.7,
                    height: `${20 + Math.sin(i * 0.8 + activeGenre) * 60}%`,
                    transition: "height 0.5s ease",
                    animation: `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>

              <div style={{
                display: "flex", gap: 8, flexWrap: "wrap",
              }}>
                {["Ресторан", "Кафе", "Магазин", "Отель", "Салон", "Фитнес"].map((tag) => (
                  <span key={tag} style={{
                    padding: "4px 12px", background: "rgba(26,107,154,0.2)",
                    border: "1px solid rgba(26,107,154,0.3)",
                    borderRadius: 100, fontSize: 12, color: "#8BA7BE",
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: "absolute", top: -20, right: -20,
              background: "#C9A84C", color: "#080C12",
              padding: "12px 20px", borderRadius: 12,
              fontSize: 13, fontWeight: 700,
              boxShadow: "0 8px 24px rgba(201,168,76,0.4)",
            }}>
              ✓ Официальный<br />сертификат
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: "100px 48px", background: "#0A0F18" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 16, fontFamily: "monospace" }}>
              ПРОБЛЕМА
            </div>
            <h2 style={{ fontSize: 44, fontWeight: 700, color: "#fff" }}>
              Незаконная музыка —<br />угроза для бизнеса
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {[
              { icon: "⚠️", title: "Spotify и YouTube запрещены", desc: "Использование стриминговых сервисов в коммерческих заведениях нарушает условия лицензии" },
              { icon: "💸", title: "Серьёзные штрафы", desc: "При проверке инспекторами бизнес рискует получить значительные санкции" },
              { icon: "😰", title: "Репутационный риск", desc: "Инцидент при проверке может нанести серьёзный ущерб имиджу заведения" },
            ].map((item) => (
              <div key={item.title} style={{
                padding: 32, background: "#0D1B2A",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 16, fontFamily: "monospace" }}>
              КАК ЭТО РАБОТАЕТ
            </div>
            <h2 style={{ fontSize: 44, fontWeight: 700, color: "#fff" }}>Просто. Быстро. Легально.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{
                padding: 32, background: "#0D1B2A",
                border: `1px solid ${i === 0 ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16, position: "relative",
              }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: i === 0 ? "#C9A84C" : "rgba(26,107,154,0.5)", marginBottom: 16 }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>{step.desc}</p>
                {i < 3 && (
                  <div style={{
                    position: "absolute", right: -16, top: "50%",
                    transform: "translateY(-50%)",
                    color: "#C9A84C", fontSize: 20, zIndex: 1,
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "100px 48px", background: "#0A0F18" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 16, fontFamily: "monospace" }}>
              ТАРИФЫ
            </div>
            <h2 style={{ fontSize: 44, fontWeight: 700, color: "#fff" }}>Прозрачные цены</h2>
            <p style={{ fontSize: 16, color: "#8BA7BE", marginTop: 16 }}>Цены в эквиваленте по курсу ЦБ РУз на дату оплаты</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                padding: 40,
                background: plan.highlight ? "linear-gradient(135deg, #1A6B9A, #0D3D5E)" : "#0D1B2A",
                border: `2px solid ${plan.highlight ? "#C9A84C" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 20,
                position: "relative",
                transform: plan.highlight ? "scale(1.05)" : "scale(1)",
                boxShadow: plan.highlight ? "0 20px 60px rgba(26,107,154,0.3)" : "none",
              }}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                    background: "#C9A84C", color: "#080C12",
                    padding: "6px 20px", borderRadius: 100,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                    whiteSpace: "nowrap",
                  }}>РЕКОМЕНДУЕМ</div>
                )}

                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 24 }}>{plan.desc}</p>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: plan.highlight ? "#fff" : "#C9A84C" }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: "#8BA7BE" }}> сум/мес</span>
                </div>
                <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 32 }}>≈ {plan.usd} / по курсу ЦБ</div>

                <div style={{ borderTop: `1px solid ${plan.highlight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`, paddingTop: 24, marginBottom: 32 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ color: "#C9A84C", marginTop: 2 }}>✓</span>
                      <span style={{ fontSize: 14, color: plan.highlight ? "#E8EFF5" : "#8BA7BE" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <a href="#contact" style={{
                  display: "block", textAlign: "center",
                  padding: "14px", borderRadius: 8,
                  background: plan.highlight ? "#C9A84C" : "rgba(201,168,76,0.1)",
                  border: plan.highlight ? "none" : "1px solid rgba(201,168,76,0.3)",
                  color: plan.highlight ? "#080C12" : "#C9A84C",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Подключить →
                </a>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "#8BA7BE", marginTop: 40 }}>
            ★ Первый месяц — бесплатно для новых клиентов
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" style={{ padding: "100px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 12, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 24, fontFamily: "monospace" }}>
            НАЧНИТЕ СЕГОДНЯ
          </div>
          <h2 style={{ fontSize: 56, fontWeight: 700, color: "#fff", marginBottom: 24, fontStyle: "italic" }}>
            Первый месяц —<br />
            <span style={{ color: "#C9A84C", fontStyle: "normal" }}>бесплатно</span>
          </h2>
          <p style={{ fontSize: 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 48 }}>
            Подключите ваше заведение уже сегодня.<br />Музыка будет играть завтра утром.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+998994100910" style={{
              padding: "18px 40px", background: "#C9A84C", color: "#080C12",
              borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
            }}>
              Позвонить нам
            </a>
            <a href="https://t.me/fonmusic2026" style={{
              padding: "18px 40px",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#C9A84C",
              borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: "none",
            }}>
              Написать в Telegram
            </a>
          </div>

          <div style={{ marginTop: 48, fontSize: 14, color: "#8BA7BE" }}>
            fonmusic.uz · +998 99 410 09 10 · info@fonmusic.uz
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "32px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 13, color: "#8BA7BE",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div>© 2026 FonMusic.uz — Лицензионная фоновая музыка для бизнеса</div>
        <div>Ташкент, Узбекистан</div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </main>
  );
}
