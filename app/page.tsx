"use client";
import { useState, useEffect, useRef } from "react";

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

const BASE_URL = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev";

const BUSINESS_TYPES = [
  { key: "cafe", icon: "☕", name: "Кафе", desc: "Уютная атмосфера", station: "Cozy Coffee", folder: "Cozy Coffee", color: "#C9A84C" },
  { key: "restaurant", icon: "🍽️", name: "Ресторан", desc: "Элегантный вечер", station: "Dinner & Lounge", folder: "Cocktail and Dinner Groove", color: "#3B82F6" },
  { key: "boutique", icon: "🛍️", name: "Бутик", desc: "Стиль и энергия", station: "Retail Energy", folder: "Shopping Vibes", color: "#A855F7" },
  { key: "fitness", icon: "💪", name: "Фитнес", desc: "Максимальная энергия", station: "Active Energy", folder: "Workout", color: "#EF4444" },
  { key: "spa", icon: "💆", name: "SPA", desc: "Расслабление", station: "Spa Relax", folder: "Spa Garden", color: "#22C55E" },
  { key: "bar", icon: "🎸", name: "Бар", desc: "Вечерняя атмосфера", station: "Bar Mood", folder: "The Rocks", color: "#F59E0B" },
  { key: "hotel", icon: "🏨", name: "Отель", desc: "Премиальный лобби", station: "Lounge Flow", folder: "Lounge", color: "#8BA7BE" },
  { key: "market", icon: "🛒", name: "Супермаркет", desc: "Нейтральный фон", station: "All Day Mix", folder: "Best Of Radio", color: "#06B6D4" },
];

const FAQS = [
  { q: "Можно ли использовать Spotify или YouTube в заведении?", a: "Нет. Spotify, YouTube и обычное радио запрещены для коммерческого использования. Их лицензия рассчитана только на личное прослушивание. FonMusic — это легальный сервис специально для бизнеса." },
  { q: "Нужен ли отдельный договор?", a: "Нет. Вы принимаете публичную оферту при регистрации. Факт оплаты является акцептом договора согласно законодательству РУз. После оплаты вы получаете электронный сертификат." },
  { q: "Как работает FonMusic Box?", a: "Это небольшая Android-приставка которая подключается к интернету и вашей аудиосистеме. После подключения музыка запускается автоматически и работает 24/7 без участия человека." },
  { q: "Можно ли слушать только через браузер?", a: "Да! Веб-плеер работает на любом устройстве — компьютере, планшете или телефоне. Просто откройте личный кабинет и нажмите Play." },
  { q: "Что будет если закончится подписка?", a: "Музыка автоматически остановится. Вы получите уведомление за 3 дня до окончания. После оплаты доступ возобновляется мгновенно." },
  { q: "Можно ли менять музыку самостоятельно?", a: "Да! В личном кабинете вы можете выбрать станцию вручную или настроить автоматическое расписание — музыка будет меняться по времени дня." },
];


function DemoPlayer() {
  const [selectedBusiness, setSelectedBusiness] = useState(BUSINESS_TYPES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playStation = async (business: typeof BUSINESS_TYPES[0]) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    setSelectedBusiness(business);
    setIsPlaying(false);
    setIsLoading(true);
    setCurrentTrack("");
    try {
      const res = await fetch(`${BASE_URL}/${business.folder.replace(/ /g, "%20")}/playlist.json`);
      const data = await res.json();
      const tracks = data.map((t: any) => typeof t === "string" ? t : t.f).filter(Boolean);
      const track = tracks[Math.floor(Math.random() * Math.min(20, tracks.length))];
      const url = `${BASE_URL}/${business.folder.replace(/ /g, "%20")}/${encodeURIComponent(track)}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.volume = 0.7;
      audio.oncanplay = () => {
        setIsLoading(false);
        setCurrentTrack(track.replace(".mp3", "").split("-").slice(1).join(" ").trim());
        audio.play();
        setIsPlaying(true);
      };
      audio.onerror = () => { setIsLoading(false); setIsPlaying(false); };
      audio.onended = () => setIsPlaying(false);
    } catch { setIsLoading(false); }
  };

  const togglePlay = () => {
    if (!audioRef.current) { playStation(selectedBusiness); return; }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; } };
  }, []);

  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: "28px", overflow: "hidden" }}>
      <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 8 }}>ДЕМО-ПЛЕЕР</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Послушайте музыку для вашего бизнеса</h3>
      <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>Выберите тип заведения и нажмите Play</p>

      {/* Выбор бизнеса */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {BUSINESS_TYPES.map(b => (
          <button key={b.key} onClick={() => playStation(b)} style={{
            padding: "10px 6px", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "center",
            background: selectedBusiness.key === b.key ? `rgba(${b.key === "cafe" ? "201,168,76" : b.key === "restaurant" ? "59,130,246" : b.key === "boutique" ? "168,85,247" : b.key === "fitness" ? "239,68,68" : b.key === "spa" ? "34,197,94" : b.key === "bar" ? "245,158,11" : b.key === "hotel" ? "139,167,190" : "6,182,212"},0.15)` : "rgba(255,255,255,0.03)",
            border: `1px solid ${selectedBusiness.key === b.key ? b.color : "rgba(255,255,255,0.06)"}`,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon}</div>
            <div style={{ fontSize: 10, color: selectedBusiness.key === b.key ? "#fff" : "#8BA7BE", fontWeight: selectedBusiness.key === b.key ? 700 : 400 }}>{b.name}</div>
          </button>
        ))}
      </div>

      {/* Плеер */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={togglePlay} style={{
          width: 52, height: 52, borderRadius: "50%", background: selectedBusiness.color,
          border: "none", cursor: "pointer", fontSize: 20, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        }}>
          {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            {selectedBusiness.icon} {selectedBusiness.station}
          </div>
          <div style={{ fontSize: 11, color: "#8BA7BE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {isLoading ? "Загрузка..." : currentTrack || "Нажмите Play для воспроизведения"}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#4a5a6a", flexShrink: 0 }}>Jamendo</div>
      </div>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    { name: "Базовый", price: "599 000", desc: "Для небольших заведений", popular: "", features: ["Веб-плеер в браузере", "30 000+ треков", "Готовые станции", "Без рекламы", "Официальный сертификат"], highlight: false },
    { name: "Стандарт", price: "849 000", desc: "Для кафе, ресторанов и магазинов", popular: "Самый популярный", features: ["Всё из Базового", "Автоматическое расписание", "Удалённое управление", "FonMusic Box в комплекте", "Музыка 24/7"], highlight: true },
    { name: "Премиум", price: "999 000", desc: "Для сетей заведений", popular: "", features: ["Всё из Стандарта", "Несколько заведений", "Разные атмосферы в точках", "Централизованное управление", "Приоритетная поддержка"], highlight: false },
  ];

  const steps = [
    { num: "01", icon: "☕", title: "Выберите тип бизнеса", desc: "Кафе, ресторан, магазин, фитнес — система подберёт идеальную музыку" },
    { num: "02", icon: "🎵", title: "Получите готовую программу", desc: "Станции и расписание настраиваются автоматически" },
    { num: "03", icon: "▶", title: "Запустите музыку", desc: "Через браузер или FonMusic Box — музыка играет 24/7" },
    { num: "04", icon: "📄", title: "Вы защищены", desc: "Официальный сертификат JAMENDO для проверяющих органов" },
  ];

  const risks = [
    { icon: "🚫", title: "Spotify и YouTube запрещены", desc: "Использование в коммерческих заведениях нарушает лицензионное соглашение" },
    { icon: "💸", title: "Штрафы при проверке", desc: "Инспекторы могут выписать серьёзные санкции за нелегальную музыку" },
    { icon: "📉", title: "Репутационный риск", desc: "Инцидент при проверке — удар по имиджу вашего заведения" },
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
            <a href="#demo" style={{ color: "#8BA7BE", textDecoration: "none" }}>Демо</a>
            <a href="#pricing" style={{ color: "#8BA7BE", textDecoration: "none" }}>Тарифы</a>
            <a href="/license" style={{ color: "#8BA7BE", textDecoration: "none" }}>Лицензия</a>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/dashboard" style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#8BA7BE", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            {m ? "Кабинет" : "Войти в кабинет"}
          </a>
          <a href="#trial" style={{ padding: m ? "9px 14px" : "9px 20px", background: "#C9A84C", color: "#080C12", borderRadius: 8, fontSize: m ? 12 : 13, fontWeight: 700, textDecoration: "none" }}>
            {m ? "7 дней бесплатно" : "Начать бесплатно"}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${m ? 100 : 120}px ${px}px ${m ? 60 : 80}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: m ? 300 : 700, height: m ? 300 : 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, fontSize: 11, color: "#C9A84C", letterSpacing: "0.08em", marginBottom: 28 }}>
          ♪ ЛИЦЕНЗИРОВАННАЯ МУЗЫКА · ОФИЦИАЛЬНО
        </div>
        <h1 style={{ fontSize: m ? 36 : 64, fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: "#fff", maxWidth: 700 }}>
          Музыка для бизнеса<br /><span style={{ color: "#C9A84C" }}>без рекламы и рисков</span>
        </h1>
        <p style={{ fontSize: m ? 15 : 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
          Лицензированная фоновая музыка для кафе, ресторанов, магазинов, фитнес-клубов и салонов. Официальный сертификат.
        </p>
        <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: 12, width: m ? "100%" : "auto", marginBottom: 48 }}>
          <a href="#trial" style={{ padding: m ? "18px 24px" : "16px 36px", background: "#C9A84C", color: "#080C12", borderRadius: 12, fontSize: m ? 16 : 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.3)", textAlign: "center" }}>
            Попробовать 7 дней бесплатно
          </a>
          <a href="#demo" style={{ padding: m ? "18px 24px" : "16px 36px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 12, fontSize: m ? 16 : 17, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
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

      {/* DEMO PLAYER */}
      <section id="demo" style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>ДЕМО</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>Услышьте атмосферу вашего заведения</h2>
            <p style={{ fontSize: 14, color: "#8BA7BE", marginTop: 10 }}>Реальная музыка из нашего каталога</p>
          </div>
          <DemoPlayer />
        </div>
      </section>

      {/* FOR BUSINESS */}
      <section style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>ДЛЯ КАКИХ БИЗНЕСОВ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>Музыка для каждого заведения</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }}>
            {BUSINESS_TYPES.map(b => (
              <a key={b.key} href="#demo" style={{ padding: "20px 12px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, textAlign: "center", textDecoration: "none", display: "block", transition: "all 0.2s" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>{b.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>ТАРИФЫ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Прозрачные цены</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{ padding: "24px", background: plan.highlight ? "linear-gradient(135deg, rgba(26,107,154,0.3), rgba(13,61,94,0.3))" : "#0D1B2A", border: `2px solid ${plan.highlight ? "#C9A84C" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, position: "relative" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, right: 20, background: "#C9A84C", color: "#080C12", padding: "4px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>РЕКОМЕНДУЕМ</div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{plan.name}</div>
                    <div style={{ fontSize: 13, color: "#8BA7BE" }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#C9A84C" }}>{plan.price}</div>
                    <div style={{ fontSize: 11, color: "#8BA7BE" }}>сум / месяц</div>
                  </div>
                </div>
                {plan.popular && (
                  <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 12, padding: "4px 10px", background: "rgba(34,197,94,0.1)", borderRadius: 6, display: "inline-block" }}>⭐ {plan.popular}</div>
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
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>📦 Автоматическая музыка 24/7</h3>
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
        </div>
      </section>

      {/* LICENSE BLOCK */}
      <section style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h2 style={{ fontSize: m ? 22 : 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Лицензированная музыка для бизнеса</h2>
            <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 24, maxWidth: 460, margin: "0 auto 24px" }}>
              FonMusic использует лицензированный каталог Jamendo, предназначенный для коммерческого воспроизведения. Каждый клиент получает официальный сертификат.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 24 }}>
              {["✓ Кафе и кофейни", "✓ Рестораны", "✓ Магазины", "✓ Фитнес-клубы", "✓ Салоны красоты", "✓ Отели"].map(f => (
                <span key={f} style={{ fontSize: 13, color: "#22C55E" }}>{f}</span>
              ))}
            </div>
            <a href="/license" style={{ display: "inline-block", padding: "12px 28px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Подробнее о лицензии →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>FAQ</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>Частые вопросы</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", padding: "18px 20px", background: "transparent", border: "none",
                  cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "left" }}>{faq.q}</span>
                  <span style={{ color: "#C9A84C", fontSize: 18, flexShrink: 0 }}>{openFaq === i ? "▲" : "▼"}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIAL FORM */}
<section id="trial" style={{ padding: `64px ${px}px`, position: "relative", overflow: "hidden" }}>
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
  <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", textAlign: "center" }}>
    <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12 }}>НАЧНИТЕ СЕГОДНЯ</div>
    <h2 style={{ fontSize: m ? 32 : 44, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
      7 дней <span style={{ color: "#C9A84C" }}>бесплатно</span>
    </h2>
    <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.6, marginBottom: 32 }}>
      Подключите ваше заведение уже сегодня. Музыка начнёт играть через несколько минут.
    </p>
    <a href="/signup" style={{ display: "block", padding: "20px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 18, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.35)", marginBottom: 16 }}>
      Начать 7 дней бесплатно →
    </a>
    <div style={{ fontSize: 13, color: "#8BA7BE" }}>
      или <a href="tel:+998994100910" style={{ color: "#C9A84C", textDecoration: "none" }}>+998 99 410 09 10</a> · <a href="https://t.me/fonmusic2026" style={{ color: "#C9A84C", textDecoration: "none" }}>Telegram</a>
    </div>
  </div>
</section>

      {/* FOOTER */}
      <footer style={{ padding: `40px ${px}px`, borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0A0F18" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 18, background: "#C9A84C", borderRadius: 2 }} />
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>FonMusic</span>
              </div>
              <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>Лицензированная фоновая музыка для бизнеса в Узбекистане</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Навигация</div>
              {[
                { label: "Как работает", href: "#how" },
                { label: "Демо", href: "#demo" },
                { label: "Тарифы", href: "#pricing" },
                { label: "Войти в кабинет", href: "/dashboard" },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: 8 }}>
                  <a href={l.href} style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>{l.label}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Юридическое</div>
              {[
                { label: "Публичная оферта", href: "/offer" },
                { label: "Лицензия на музыку", href: "/license" },
                { label: "Политика конфиденциальности", href: "/privacy" },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: 8 }}>
                  <a href={l.href} style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>{l.label}</a>
                </div>
              ))}
              <div style={{ marginTop: 16, fontSize: 13, color: "#8BA7BE" }}>
                <div><a href="tel:+998994100910" style={{ color: "#C9A84C", textDecoration: "none" }}>+998 99 410 09 10</a></div>
                <div><a href="https://t.me/fonmusic2026" style={{ color: "#8BA7BE", textDecoration: "none" }}>Telegram</a></div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>© 2026 FonMusic.uz · Voxor Media Group</div>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>Лицензированная музыка для бизнеса</div>
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
