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

const STATIONS = [
  { key: "best_of_radio", name: "All Day Mix", icon: "⭐", desc: "Универсальная музыка" },
  { key: "cozy_coffee", name: "Coffee Mood", icon: "☕", desc: "Для кофеен" },
  { key: "cocktail_dinner", name: "Dinner & Lounge", icon: "🍽️", desc: "Для ресторанов" },
  { key: "cool_calm", name: "Calm Atmosphere", icon: "🎵", desc: "Спокойная атмосфера" },
  { key: "lounge", name: "Lounge Flow", icon: "🏨", desc: "Лобби и лаунж" },
  { key: "luxury", name: "Premium Mood", icon: "✨", desc: "Премиальные пространства" },
  { key: "shopping_vibes", name: "Retail Energy", icon: "🛍️", desc: "Для магазинов" },
  { key: "spa_garden", name: "Spa Relax", icon: "💆", desc: "Спа и салоны" },
  { key: "workout", name: "Active Energy", icon: "💪", desc: "Фитнес" },
  { key: "on_the_rocks", name: "Bar Mood", icon: "🎸", desc: "Для баров" },
];

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
  return track.replace(".mp3", "").replace(/_/g, " ").split("-").slice(1).join(" ").trim() || track.replace(".mp3", "");
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
  const [volume, setVolume] = useState(0.8);
  const [showStations, setShowStations] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    if (!clientId) { window.location.href = "/dashboard"; return; }
    loadClient(clientId);
  }, []);

  const loadClient = async (clientId: string) => {
    const data = await sb(`clients?id=eq.${clientId}&select=*`);
    if (!data || data.length === 0) { window.location.href = "/dashboard"; return; }
    const c = data[0];
    if (c.subscription_status === "expired") { window.location.href = "/dashboard"; return; }
    setClient(c);
    const station = c.station_key || "cozy_coffee";
    setCurrentStation(station);
    setLoading(false);
    loadPlaylist(station);
  };

  const loadPlaylist = async (stationKey: string) => {
    setIsLoadingTrack(true);
    const folder = STATION_FOLDERS[stationKey] || "Cozy Coffee";
    try {
      const res = await fetch(`${BASE_URL}/${folder.replace(/ /g, "%20")}/playlist.json`);
      const tracks: string[] = await res.json();
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
      setIsLoadingTrack(false);
    } catch {
      setIsLoadingTrack(false);
    }
  };

  const playTrack = (index: number, tracks?: string[], stationKey?: string) => {
    const list = tracks || playlist;
    const station = stationKey || currentStation;
    if (!list.length) return;
    const track = list[index % list.length];
    const folder = STATION_FOLDERS[station] || "Cozy Coffee";
    const url = `${BASE_URL}/${folder.replace(/ /g, "%20")}/${encodeURIComponent(track)}`;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.volume = volume;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    setTrackIndex(index % list.length);
    setProgress(0);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!currentTrack) { playTrack(0); }
      else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
    }
  };

  const nextTrack = () => playTrack((trackIndex + 1) % playlist.length);
  const prevTrack = () => playTrack((trackIndex - 1 + playlist.length) % playlist.length);

  const switchStation = async (stationKey: string) => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentStation(stationKey);
    setIsPlaying(false);
    setShowStations(false);
    setIsLoadingTrack(true);
    setProgress(0);
    setCurrentTime(0);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ station_key: stationKey, music_mode: "manual" }),
    });
    const folder = STATION_FOLDERS[stationKey] || "Cozy Coffee";
    try {
      const res = await fetch(`${BASE_URL}/${folder.replace(/ /g, "%20")}/playlist.json`);
      const tracks: string[] = await res.json();
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
      setIsLoadingTrack(false);
      setTimeout(() => playTrack(0, shuffled, stationKey), 100);
    } catch { setIsLoadingTrack(false); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      setProgress(audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentStationObj = STATIONS.find(s => s.key === currentStation);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => playTrack((trackIndex + 1) % playlist.length)}
        onError={() => setTimeout(() => playTrack((trackIndex + 1) % playlist.length), 2000)}
      />

      {/* HEADER */}
      <header style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 18, background: "#3B82F6", borderRadius: 2 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          <span style={{ fontSize: 10, color: "#3B82F6", padding: "2px 8px", background: "rgba(59,130,246,0.1)", borderRadius: 100, border: "1px solid rgba(59,130,246,0.2)" }}>Плеер</span>
        </div>
        <a href="/dashboard" style={{ fontSize: 12, color: "#8BA7BE", textDecoration: "none" }}>← Кабинет</a>
      </header>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px" }}>

        {/* CLIENT INFO */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {currentStationObj?.icon || "🎵"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{client?.name}</div>
            <div style={{ fontSize: 11, color: "#8BA7BE" }}>{currentStationObj?.name || currentStation}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: isPlaying ? "#22C55E" : "#555" }} />
            <span style={{ fontSize: 11, color: isPlaying ? "#22C55E" : "#555" }}>{isPlaying ? "Играет" : "Пауза"}</span>
          </div>
        </div>

        {/* PLAYER CARD */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 20, padding: "28px 24px", marginBottom: 16 }}>

          {/* TRACK INFO */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {currentStationObj?.icon || "🎵"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {isLoadingTrack ? "Загрузка..." : currentTrack ? getTrackName(currentTrack) : "Нажмите Play"}
              </div>
              <div style={{ fontSize: 12, color: "#8BA7BE" }}>{currentStationObj?.name || "—"} · Jamendo</div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ marginBottom: 6 }}>
            <input type="range" min={0} max={100} step={0.1} value={progress} onChange={handleSeek}
              style={{ width: "100%", accentColor: "#3B82F6", height: 4, cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4a5a6a", marginBottom: 24 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* CONTROLS */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            <button onClick={prevTrack} style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 42, height: 42, cursor: "pointer", color: "#8BA7BE", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ⏮
            </button>
            <button onClick={togglePlay} disabled={isLoadingTrack} style={{
              width: 62, height: 62, borderRadius: "50%",
              background: isLoadingTrack ? "rgba(59,130,246,0.3)" : "#3B82F6",
              border: "none", cursor: "pointer", fontSize: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
              color: "#fff",
            }}>
              {isLoadingTrack ? "⏳" : isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={nextTrack} style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 42, height: 42, cursor: "pointer", color: "#8BA7BE", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ⏭
            </button>
          </div>

          {/* VOLUME */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#4a5a6a" }}>🔈</span>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              style={{ flex: 1, accentColor: "#3B82F6", cursor: "pointer" }}
            />
            <span style={{ fontSize: 11, color: "#4a5a6a", minWidth: 28, textAlign: "right" }}>{Math.round(volume * 100)}%</span>
            <span style={{ fontSize: 14, color: "#3B82F6" }}>🔊</span>
          </div>
        </div>

        {/* STATION SELECTOR */}
        <div style={{ background: "#0D1B2A", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
          <button onClick={() => setShowStations(!showStations)} style={{
            width: "100%", padding: "16px 20px", background: "transparent", border: "none",
            cursor: "pointer", fontFamily: "Georgia, serif",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{currentStationObj?.icon || "🎵"}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Выбор станции</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>{currentStationObj?.name || "—"}</div>
              </div>
            </div>
            <span style={{ color: "#3B82F6", fontSize: 12 }}>{showStations ? "▲" : "▼"}</span>
          </button>

          {showStations && (
            <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", padding: "8px" }}>
              {STATIONS.map(s => (
                <button key={s.key} onClick={() => switchStation(s.key)} style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  textAlign: "left", fontFamily: "Georgia, serif", marginBottom: 4,
                  background: currentStation === s.key ? "rgba(59,130,246,0.1)" : "transparent",
                  border: `0.5px solid ${currentStation === s.key ? "rgba(59,130,246,0.3)" : "transparent"}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 18, width: 24 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: currentStation === s.key ? 700 : 400, color: currentStation === s.key ? "#3B82F6" : "#fff" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#4a5a6a" }}>{s.desc}</div>
                  </div>
                  {currentStation === s.key && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* UPSELL BOX */}
        {client?.playback_target !== "box" && (
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 16, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Подключите FonMusic Box</div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 16 }}>Музыка 24/7 без браузера и компьютера</div>
            <a href="/#trial" style={{ display: "inline-block", padding: "10px 24px", background: "#C9A84C", color: "#080C12", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Узнать подробнее →
            </a>
          </div>
        )}

      </div>

      <style>{`
        input[type=range] { height: 4px; cursor: pointer; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </main>
  );
}
