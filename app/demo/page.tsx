"use client";
import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://ovafknvfckdmatrnlecr.supabase.co";
const SUPABASE_KEY = "sb_publishable_sMrkdTU705Zgw9-Sc12-Ww_XDrl1ASP";
const BASE_URL = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev";

const DEMO_STATIONS = [
  { key: "cozy_coffee", folder: "Cozy Coffee", name: "Coffee Mood", icon: "☕", desc: "Для кафе и кофеен" },
  { key: "cocktail_dinner", folder: "Cocktail and Dinner Groove", name: "Dinner & Lounge", icon: "🍽️", desc: "Для ресторанов" },
  { key: "shopping_vibes", folder: "Shopping Vibes", name: "Retail Energy", icon: "🛍️", desc: "Для магазинов" },
  { key: "spa_garden", folder: "Spa Garden", name: "Spa Relax", icon: "💆", desc: "Для спа и салонов" },
  { key: "on_the_rocks", folder: "On The Rocks", name: "Bar Mood", icon: "🎸", desc: "Для баров" },
];

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);
  const [currentStation, setCurrentStation] = useState(DEMO_STATIONS[0]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted) loadPlaylist(currentStation);
  }, [mounted]);

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

  const playTrack = (index: number, tracks?: string[]) => {
    const list = tracks || playlist;
    if (!list.length) return;
    const track = list[index % list.length];
    const encodedFolder = currentStation.folder.replace(/ /g, "%20");
    const encodedTrack = track.replace(/ /g, "%20");
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
      // Автоплей при смене станции
      setTimeout(() => playTrack(0, shuffled), 100);
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

      {/* HEADER */}
      <header style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          <span style={{ fontSize: 11, color: "#8BA7BE", padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 100 }}>Демо</span>
        </div>
        <div style={{ fontSize: 12, color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", padding: "5px 12px", borderRadius: 100 }}>
          🕐 Тестовый доступ
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 40px" }}>

        {/* CURRENT STATION CARD */}
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, padding: "32px 24px", marginBottom: 20, textAlign: "center" }}>

          {/* Station icon */}
          <div style={{ fontSize: 56, marginBottom: 12 }}>{currentStation.icon}</div>

          {/* Station name */}
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{currentStation.name}</div>
          <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>{currentStation.desc}</div>

          {/* Now playing */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", marginBottom: 28, minHeight: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {isLoading ? (
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>⏳ Загрузка...</div>
            ) : currentTrack ? (
              <>
                <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 4 }}>
                  {isPlaying ? "▶ СЕЙЧАС ИГРАЕТ" : "⏸ ПАУЗА"}
                </div>
                <div style={{ fontSize: 13, color: "#E8EFF5", fontStyle: "italic" }}>{getTrackName(currentTrack)}</div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>Нажмите Play для воспроизведения</div>
            )}
          </div>

          {/* Waveform animation */}
          {isPlaying && (
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32, justifyContent: "center", marginBottom: 24 }}>
              {[...Array(16)].map((_, i) => (
                <div key={i} style={{
                  width: 4, borderRadius: 2,
                  background: i % 3 === 0 ? "#C9A84C" : "#1A6B9A",
                  height: `${30 + Math.sin(Date.now() / 200 + i) * 70}%`,
                  animation: `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
                  opacity: 0.8,
                }} />
              ))}
            </div>
          )}

          {/* PLAY BUTTON */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: isLoading ? "rgba(201,168,76,0.3)" : "#C9A84C",
              border: "none", cursor: isLoading ? "default" : "pointer",
              fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 8px 32px rgba(201,168,76,0.4)",
              transition: "transform 0.1s",
            }}
          >
            {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {/* STATIONS LIST */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 12, letterSpacing: "0.05em" }}>ДЕМО-СТАНЦИИ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMO_STATIONS.map(station => (
              <button
                key={station.key}
                onClick={() => switchStation(station)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                  background: currentStation.key === station.key ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${currentStation.key === station.key ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`,
                  transition: "all 0.2s",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 24 }}>{station.icon}</span>
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

        {/* INFO BLOCK */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 16 }}>
            Вы используете <strong style={{ color: "#fff" }}>демо-версию FonMusic</strong>. Полный доступ включает:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "10 музыкальных станций",
              "Автоматическое расписание",
              "Android TV приставка",
              "Официальный сертификат JAMENDO",
            ].map(f => (
              <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#C9A84C", fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 13, color: "#8BA7BE" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA BUTTON */}
        <a href="/#trial" style={{ display: "block", padding: "18px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: "0 8px 32px rgba(201,168,76,0.3)", marginBottom: 16 }}>
          Подключить FonMusic →
        </a>

        <a href="/" style={{ display: "block", textAlign: "center", fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>
          ← На главную
        </a>
      </div>

      <style>{`
        @keyframes wave {
          from { height: 20%; }
          to { height: 90%; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { max-width: 100vw; overflow-x: hidden; }
      `}</style>
    </main>
  );
}
