"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const BASE_URL = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev";

const DEMO_STATIONS = [
  { key: "cozy_coffee", folder: "Cozy Coffee", name: "Coffee Mood", icon: "☕", desc: "Для кафе и кофеен", type: "cafe" },
  { key: "cocktail_dinner", folder: "Cocktail and Dinner Groove", name: "Dinner & Lounge", icon: "🍽️", desc: "Для ресторанов", type: "restaurant" },
  { key: "shopping_vibes", folder: "Shopping Vibes", name: "Retail Energy", icon: "🛍️", desc: "Для магазинов", type: "shop" },
  { key: "spa_garden", folder: "Spa Garden", name: "Spa Relax", icon: "💆", desc: "Для спа и салонов", type: "spa" },
  { key: "workout", folder: "Workout", name: "Active Energy", icon: "💪", desc: "Для фитнеса", type: "fitness" },
];

const TYPE_MAP: Record<string, string> = {
  cafe: "cozy_coffee",
  restaurant: "cocktail_dinner",
  shop: "shopping_vibes",
  retail: "shopping_vibes",
  spa: "spa_garden",
  fitness: "workout",
  bar: "on_the_rocks",
  hotel: "lounge",
};

const TYPE_TITLES: Record<string, string> = {
  cafe: "Музыка для кафе",
  restaurant: "Музыка для ресторанов",
  shop: "Музыка для магазинов",
  retail: "Музыка для магазинов",
  spa: "Музыка для спа и салонов",
  fitness: "Музыка для фитнеса",
  bar: "Музыка для баров",
  hotel: "Музыка для отелей",
};

function LeadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Кафе");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!name || !phone) return;
    setLoading(true);
    const text = `🎵 Новая заявка FonMusic (Демо)!\n\n🏢 Заведение: ${name}\n📞 Телефон: ${phone}\n🍽 Тип: ${type}`;
    await fetch(`https://api.telegram.org/bot8572453029:AAGacP96un1FuPOcj6hmc708pOBv7nYPIiI/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: "500210645", text }),
    });
    setLoading(false);
    setSent(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#0D1B2A", borderRadius: "24px 24px 0 0", padding: "32px 24px 40px", border: "1px solid rgba(201,168,76,0.2)" }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Заявка отправлена!</div>
            <div style={{ fontSize: 14, color: "#8BA7BE" }}>Мы свяжемся с вами в течение 30 минут</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Получите 7 дней бесплатно</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#8BA7BE", fontSize: 24, cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 24, lineHeight: 1.6 }}>
              Оставьте контакт — мы подключим полный доступ к FonMusic для вашего заведения
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Название заведения"
                style={{ padding: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none" }} />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 __ ___ __ __" type="tel"
                style={{ padding: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none" }} />
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ padding: "16px", background: "#162435", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none" }}>
                {["Кафе", "Ресторан", "Магазин", "Отель", "Салон красоты", "Фитнес", "Бар", "Другое"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button onClick={send} disabled={loading} style={{ width: "100%", padding: "18px", background: "#C9A84C", color: "#080C12", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(201,168,76,0.3)" }}>
              {loading ? "Отправляем..." : "Получить 7 дней бесплатно →"}
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", border: "none", color: "#8BA7BE", fontSize: 13, cursor: "pointer", marginTop: 8 }}>
              Продолжить слушать
            </button>
          </>
        )}
      </div>
    </div>
  );
}

  function DemoPlayer() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "cafe";

  const getInitialStation = () => {
    const stationKey = TYPE_MAP[typeParam] || "cozy_coffee";
    return DEMO_STATIONS.find(s => s.key === stationKey) || DEMO_STATIONS[0];
  };

  const [mounted, setMounted] = useState(false);
  const [currentStation, setCurrentStation] = useState<typeof DEMO_STATIONS[0]>(DEMO_STATIONS[0]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pageTitle = TYPE_TITLES[typeParam] || "Демо FonMusic";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted) {
      const initial = getInitialStation();
      setCurrentStation(initial);
      loadPlaylist(initial);
    }
  }, [mounted]);

  // Таймер 90 сек → показать форму
  useEffect(() => {
    if (isPlaying && !modalShown) {
      timerRef.current = setTimeout(() => {
        setShowModal(true);
        setModalShown(true);
      }, 90000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, modalShown]);

  const loadPlaylist = async (station: typeof DEMO_STATIONS[0]) => {
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const encodedFolder = station.folder.replace(/ /g, "%20");
      const res = await fetch(`${BASE_URL}/${encodedFolder}/playlist.json`);
      const tracks: string[] = await res.json();
      const shuffled = tracks.sort(() => Math.random() - 0.5).slice(0, 50);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const playTrack = (index: number, tracks?: string[], station?: typeof DEMO_STATIONS[0]) => {
    const list = tracks || playlist;
    const st = station || currentStation;
    if (!list.length) return;
    const track = list[index % list.length];
    const encodedFolder = st.folder.replace(/ /g, "%20");
    const encodedTrack = encodeURIComponent(track);
    const url = `${BASE_URL}/${encodedFolder}/${encodedTrack}`;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    setTrackIndex(index % list.length);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!currentTrack) {
        playTrack(0);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const switchStation = async (station: typeof DEMO_STATIONS[0]) => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentStation(station);
    setIsPlaying(false);
    setIsLoading(true);
    try {
      const encodedFolder = station.folder.replace(/ /g, "%20");
      const res = await fetch(`${BASE_URL}/${encodedFolder}/playlist.json`);
      const tracks: string[] = await res.json();
      const shuffled = tracks.sort(() => Math.random() - 0.5).slice(0, 50);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
      setIsLoading(false);
      setTimeout(() => playTrack(0, shuffled, station), 100);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const getTrackName = (track: string) => {
    return track
      .replace(".mp3", "")
      .replace(/_/g, " ")
      .split("-")
      .slice(1)
      .join(" ")
      .trim() || track.replace(".mp3", "");
  };

  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <audio
        ref={audioRef}
        onEnded={() => {
          const next = (trackIndex + 1) % playlist.length;
          playTrack(next);
        }}
        onError={() => {
          const next = (trackIndex + 1) % playlist.length;
          setTimeout(() => playTrack(next), 2000);
        }}
      />

      {/* MODAL */}
      {showModal && (
        <LeadModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}

      {/* HEADER */}
      <header style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          <span style={{ fontSize: 11, color: "#8BA7BE", padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 100 }}>Демо</span>
        </div>
        <button onClick={() => setShowModal(true)} style={{ fontSize: 12, color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", padding: "6px 14px", borderRadius: 100, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          7 дней бесплатно
        </button>
      </header>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 40px" }}>

        {/* PAGE TITLE */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4, marginTop: 16 }}>{pageTitle}</h1>
        <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 24 }}>Слушайте демо — переключайте станции</p>

        {/* CURRENT STATION CARD */}
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, padding: "28px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{currentStation.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{currentStation.name}</div>
          <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>{currentStation.desc}</div>

          {/* Now playing */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, minHeight: 46 }}>
            {isLoading ? (
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>⏳ Загрузка...</div>
            ) : currentTrack ? (
              <>
                <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 3 }}>
                  {isPlaying ? "▶ СЕЙЧАС ИГРАЕТ" : "⏸ ПАУЗА"}
                </div>
                <div style={{ fontSize: 13, color: "#E8EFF5", fontStyle: "italic" }}>{getTrackName(currentTrack)}</div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>Нажмите Play</div>
            )}
          </div>

          {/* Waveform */}
          {isPlaying && (
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28, justifyContent: "center", marginBottom: 20 }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{
                  width: 4, borderRadius: 2,
                  background: i % 3 === 0 ? "#C9A84C" : "#1A6B9A",
                  animation: `wave ${0.7 + i * 0.1}s ease-in-out infinite alternate`,
                  opacity: 0.8,
                }} />
              ))}
            </div>
          )}

          {/* PLAY BUTTON */}
          <button onClick={togglePlay} disabled={isLoading} style={{
            width: 76, height: 76, borderRadius: "50%",
            background: isLoading ? "rgba(201,168,76,0.3)" : "#C9A84C",
            border: "none", cursor: isLoading ? "default" : "pointer",
            fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto", boxShadow: "0 8px 32px rgba(201,168,76,0.4)",
          }}>
            {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {/* STATIONS LIST */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 10, letterSpacing: "0.05em" }}>ДОСТУПНЫЕ СТАНЦИИ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMO_STATIONS.map(station => (
              <button key={station.key} onClick={() => switchStation(station)} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                background: currentStation.key === station.key ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${currentStation.key === station.key ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`,
                width: "100%",
              }}>
                <span style={{ fontSize: 22 }}>{station.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: currentStation.key === station.key ? "#C9A84C" : "#fff" }}>
                    {station.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#8BA7BE" }}>{station.desc}</div>
                </div>
                {currentStation.key === station.key && isPlaying && (
                  <div style={{ fontSize: 10, color: "#C9A84C", background: "rgba(201,168,76,0.1)", padding: "3px 8px", borderRadius: 100 }}>
                    ИГРАЕТ
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "18px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 12 }}>
            Полный доступ включает:
          </div>
          {["10 станций Jamendo", "Автоматическое расписание", "Android TV приставка", "Официальный сертификат"].map(f => (
            <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "#C9A84C", fontSize: 12 }}>✓</span>
              <span style={{ fontSize: 13, color: "#8BA7BE" }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => setShowModal(true)} style={{ display: "block", width: "100%", padding: "18px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: "0 8px 32px rgba(201,168,76,0.3)", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 12 }}>
          Подключить FonMusic →
        </button>

        <a href="/" style={{ display: "block", textAlign: "center", fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>
          ← На главную
        </a>
      </div>

      <style>{`
        @keyframes wave {
          from { height: 15%; }
          to { height: 85%; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { max-width: 100vw; overflow-x: hidden; }
      `}</style>
    </main>
  );
}
export default function DemoPage() {
  return (
    <Suspense fallback={null}>
      <DemoPlayer />
    </Suspense>
  );
}
