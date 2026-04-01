"use client";
import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://ovafknvfckdmatrnlecr.supabase.co";
const SUPABASE_KEY = "sb_publishable_sMrkdTU705Zgw9-Sc12-Ww_XDrl1ASP";
const BASE_URL = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev";

const STATION_FOLDERS: Record<string, string> = {
  cozy_coffee: "Cozy Coffee",
  cocktail_dinner: "Cocktail and Dinner Groove",
  cool_calm: "Cool and Calm",
  lounge: "Lounge",
  luxury: "Luxury",
  shopping_vibes: "Shopping Vibes",
  spa_garden: "Spa Garden",
  workout: "Workout",
  on_the_rocks: "The Rocks",
  best_of_radio: "Best Of Radio",
};

const STATION_NAMES: Record<string, string> = {
  cozy_coffee: "☕ Coffee Mood",
  cocktail_dinner: "🍽️ Dinner & Lounge",
  cool_calm: "🎵 Calm Atmosphere",
  lounge: "🏨 Lounge Flow",
  luxury: "✨ Premium Mood",
  shopping_vibes: "🛍️ Retail Energy",
  spa_garden: "💆 Spa Relax",
  workout: "💪 Active Energy",
  on_the_rocks: "🎸 Bar Mood",
  best_of_radio: "📻 Mixed Selection",
};

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

function getTrackName(track: string): string {
  return track
    .replace(".mp3", "")
    .replace(/_/g, " ")
    .split("-")
    .slice(1)
    .join(" ")
    .trim() || track.replace(".mp3", "");
}

export default function PlayerPage() {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState("");
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [currentStation, setCurrentStation] = useState("cozy_coffee");
  const [volume, setVolume] = useState(1.0);
  const [showStations, setShowStations] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    if (!clientId) {
      window.location.href = "/dashboard";
      return;
    }
    loadClient(clientId);
  }, []);

  const loadClient = async (clientId: string) => {
    const data = await sb(`clients?id=eq.${clientId}&select=*`);
    if (!data || data.length === 0) {
      window.location.href = "/dashboard";
      return;
    }
    const c = data[0];
    if (c.subscription_status === "expired") {
      window.location.href = "/dashboard";
      return;
    }
    setClient(c);
    setCurrentStation(c.station_key || "cozy_coffee");
    setLoading(false);
    loadPlaylist(c.station_key || "cozy_coffee");
  };

  const loadPlaylist = async (stationKey: string) => {
    setIsLoadingTrack(true);
    const folder = STATION_FOLDERS[stationKey] || "Cozy Coffee";
    try {
      const encodedFolder = folder.replace(/ /g, "%20");
      const res = await fetch(`${BASE_URL}/${encodedFolder}/playlist.json`);
      const tracks: string[] = await res.json();
      const shuffled = tracks.sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
      setIsLoadingTrack(false);
      // Подготавливаем audio src заранее
      if (audioRef.current && shuffled[0]) {
        const encodedTrack = encodeURIComponent(shuffled[0]);
        audioRef.current.src = `${BASE_URL}/${encodedFolder}/${encodedTrack}`;
        audioRef.current.load();
      }
    } catch (e) {
      setIsLoadingTrack(false);
    }
  };

  const playTrack = (index: number, tracks?: string[], stationKey?: string) => {
    const list = tracks || playlist;
    const station = stationKey || currentStation;
    if (!list.length) return;
    const track = list[index % list.length];
    const folder = STATION_FOLDERS[station] || "Cozy Coffee";
    const encodedFolder = folder.replace(/ /g, "%20");
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

  const nextTrack = () => {
    const next = (trackIndex + 1) % playlist.length;
    playTrack(next);
  };

  const prevTrack = () => {
    const prev = (trackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prev);
  };

  const switchStation = async (stationKey: string) => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentStation(stationKey);
    setIsPlaying(false);
    setShowStations(false);
    setIsLoadingTrack(true);

    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ station_key: stationKey }),
    });

    const folder = STATION_FOLDERS[stationKey] || "Cozy Coffee";
    try {
      const encodedFolder = folder.replace(/ /g, "%20");
      const res = await fetch(`${BASE_URL}/${encodedFolder}/playlist.json`);
      const tracks: string[] = await res.json();
      const shuffled = tracks.sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
      setIsLoadingTrack(false);
      setTimeout(() => playTrack(0, shuffled, stationKey), 100);
    } catch (e) {
      setIsLoadingTrack(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: 16, color: "#8BA7BE" }}>⏳ Загрузка...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <audio
        ref={audioRef}
        onEnded={() => { const next = (trackIndex + 1) % playlist.length; playTrack(next); }}
        onError={() => { const next = (trackIndex + 1) % playlist.length; setTimeout(() => playTrack(next), 2000); }}
      />

      {/* HEADER */}
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          <span style={{ fontSize: 11, color: "#8BA7BE", padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 100 }}>Веб-плеер</span>
        </div>
        <a href="/dashboard" style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>← Кабинет</a>
      </header>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px" }}>

        {/* LOCATION INFO */}
        <div style={{ marginBottom: 24, padding: "14px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>ВАША ТОЧКА</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{client?.name}</div>
          <div style={{ fontSize: 12, color: "#C9A84C", marginTop: 2 }}>Режим: Веб-плеер</div>
        </div>

        {/* PLAYER CARD */}
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, padding: "32px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>
            {STATION_NAMES[currentStation]?.split(" ")[0] || "🎵"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {STATION_NAMES[currentStation]?.split(" ").slice(1).join(" ") || currentStation}
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, minHeight: 46, marginTop: 16 }}>
            {isLoadingTrack ? (
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

          {isPlaying && (
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28, justifyContent: "center", marginBottom: 20 }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{ width: 4, borderRadius: 2, background: i % 3 === 0 ? "#C9A84C" : "#1A6B9A", animation: `wave ${0.7 + i * 0.1}s ease-in-out infinite alternate`, opacity: 0.8 }} />
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
            <button onClick={prevTrack} style={{ background: "none", border: "none", color: "#8BA7BE", fontSize: 22, cursor: "pointer", padding: 8 }}>⏮</button>
            <button onClick={togglePlay} disabled={isLoadingTrack} style={{
              width: 72, height: 72, borderRadius: "50%",
              background: isLoadingTrack ? "rgba(201,168,76,0.3)" : "#C9A84C",
              border: "none", cursor: "pointer", fontSize: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto", boxShadow: "0 8px 32px rgba(201,168,76,0.4)",
            }}>
              {isLoadingTrack ? "⏳" : isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={nextTrack} style={{ background: "none", border: "none", color: "#8BA7BE", fontSize: 22, cursor: "pointer", padding: 8 }}>⏭</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#8BA7BE" }}>🔉</span>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              style={{ flex: 1, accentColor: "#C9A84C" }}
            />
            <span style={{ fontSize: 14, color: "#8BA7BE" }}>🔊</span>
          </div>
        </div>

        {/* STATION SELECTOR */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowStations(!showStations)} style={{
            width: "100%", padding: "14px 20px", background: "#0D1B2A",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
            color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>🎵 Сменить станцию</span>
            <span style={{ color: "#8BA7BE" }}>{showStations ? "▲" : "▼"}</span>
          </button>

          {showStations && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(STATION_NAMES).map(([key, name]) => (
                <button key={key} onClick={() => switchStation(key)} style={{
                  padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  fontFamily: "Georgia, serif",
                  background: currentStation === key ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${currentStation === key ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: currentStation === key ? "#C9A84C" : "#fff",
                  fontSize: 14, fontWeight: currentStation === key ? 700 : 400,
                  width: "100%",
                }}>
                  {name}
                  {currentStation === key && <span style={{ marginLeft: 8, fontSize: 10 }}>▶ ИГРАЕТ</span>}
                </button>
              ))}
            </div>
          )}
        </div>

    {/* UPSELL */}
<div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 16, overflow: "hidden" }}>
  <button onClick={() => setShowBox(!showBox)} style={{
    width: "100%", padding: "20px", background: "transparent", border: "none",
    cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 24 }}>🎵</span>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Подключите FonMusic Box</div>
        <div style={{ fontSize: 12, color: "#8BA7BE" }}>Музыка 24/7 без браузера</div>
      </div>
    </div>
    <span style={{ color: "#C9A84C", fontSize: 18 }}>{showBox ? "▲" : "▼"}</span>
  </button>

  {showBox && (
    <div style={{ padding: "0 20px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "20px 0 10px" }}>
        FonMusic Box — автоматическая музыка для бизнеса
      </h3>
      <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 16 }}>
        FonMusic Box — это небольшая приставка, которая подключается к интернету и аудиосистеме. Она автоматически воспроизводит лицензионную музыку 24/7 без браузера или компьютера.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {["✅ Работает 24/7", "✅ Автоматический запуск", "✅ Не нужен компьютер", "✅ Стабильное соединение", "✅ Удалённое управление из кабинета"].map(f => (
          <div key={f} style={{ fontSize: 13, color: "#E8EFF5" }}>{f}</div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#C9A84C", marginBottom: 10, fontWeight: 700 }}>КАК ЭТО РАБОТАЕТ</div>
        {["1️⃣ Подключите приставку к интернету", "2️⃣ Подключите к колонкам", "3️⃣ Музыка начинает играть автоматически"].map(s => (
          <div key={s} style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 6 }}>{s}</div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#C9A84C" }}>$70</div>
        <div style={{ fontSize: 12, color: "#8BA7BE" }}>единоразовая покупка</div>
      </div>
      <a href="/#trial" style={{
        display: "block", textAlign: "center", padding: "14px",
        background: "#C9A84C", color: "#080C12", borderRadius: 10,
        fontSize: 14, fontWeight: 700, textDecoration: "none",
        boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
      }}>
        Заказать FonMusic Box →
      </a>
    </div>
  )}
</div>

</div>

      <style>{`
        @keyframes wave { from { height: 15%; } to { height: 85%; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { max-width: 100vw; overflow-x: hidden; }
      `}</style>
    </main>
  );
}
