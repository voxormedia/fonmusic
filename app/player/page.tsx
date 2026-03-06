"use client";
import { useState, useRef, useEffect } from "react";

const BASE_URL = "https://pub-64201f50168741fda74f8a768be60cbe.r2.dev";

const tracks: Record<string, { title: string; file: string }[]> = {
  fast: [
    { title: "Slow Glow", file: "fast/Slow%20Glow.mp3" },
    { title: "Warm Air", file: "fast/Warm%20Air.mp3" },
  ],
  medium: [
    { title: "Soft Horizon", file: "medium/Soft%20Horizon.mp3" },
    { title: "Soft Lights", file: "medium/Soft%20Lights.mp3" },
  ],
  slow: [
    { title: "Warm Air", file: "slow/Warm%20Air.mp3" },
  ],
  night: [
    { title: "Warm Air", file: "night/Warm%20Air.mp3" },
    { title: "Warm Echo", file: "night/Warm%20Echo.mp3" },
  ],
  mix: [
    { title: "Aero", file: "mix/Aero.mp3" },
    { title: "After Midnight", file: "mix/After%20Midnight.mp3" },
    { title: "Deep Wave - After Rain", file: "mix/Deep%20Wave%20-%20After%20rain.mp3" },
    { title: "Deep Wave - Moonline", file: "mix/Deep%20Wave%20-%20Moonline%20.mp3" },
  ],
};

const filters = ["ALL", "FAST", "MEDIUM", "SLOW", "NIGHT", "MIX"];

export default function PlayerPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [currentTrack, setCurrentTrack] = useState(tracks.fast[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  const allTracks = Object.entries(tracks).flatMap(([cat, list]) =>
    list.map(t => ({ ...t, category: cat }))
  );

  const filteredTracks = activeFilter === "ALL"
    ? allTracks
    : allTracks.filter(t => t.category === activeFilter.toLowerCase());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => playNext();
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack]);

  const playTrack = (track: { title: string; file: string }) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const playNext = () => {
    const idx = allTracks.findIndex(t => t.file === currentTrack.file);
    const next = allTracks[(idx + 1) % allTracks.length];
    playTrack(next);
  };

  const playPrev = () => {
    const idx = allTracks.findIndex(t => t.file === currentTrack.file);
    const prev = allTracks[(idx - 1 + allTracks.length) % allTracks.length];
    playTrack(prev);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) {
      audioRef.current.currentTime = ratio * audioRef.current.duration;
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", color: "#E8EFF5", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>

      {/* NAV */}
      <nav style={{
        padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </a>
        <div style={{ fontSize: 13, color: "#8BA7BE" }}>Веб-плеер</div>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px" }}>

        {/* PLAYER CARD */}
        <div style={{
          width: "100%", maxWidth: 640,
          background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 24, overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}>

          {/* NOW PLAYING */}
          <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "monospace" }}>
              ▶ СЕЙЧАС ИГРАЕТ
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4, fontStyle: "italic" }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: 13, color: "#8BA7BE" }}>FonMusic · Лицензионная музыка</div>

            {/* PROGRESS */}
            <div style={{ marginTop: 24 }}>
              <div
                onClick={seek}
                style={{
                  height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2,
                  cursor: "pointer", position: "relative", marginBottom: 8,
                }}
              >
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${progress}%`, background: "#C9A84C", borderRadius: 2,
                  transition: "width 0.1s linear",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8BA7BE" }}>
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 24 }}>
              <button id="playBtn" onClick={togglePlay} style={{
               width: 56, height: 56, borderRadius: "50%",
                fontSize: 20, cursor: "pointer", padding: 8,
              }}>⏮</button>

              <button onClick={togglePlay} style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#C9A84C", border: "none", cursor: "pointer",
                fontSize: 20, color: "#080C12", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(201,168,76,0.4)",
              }}>
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button onClick={playNext} style={{
                background: "none", border: "none", color: "#8BA7BE",
                fontSize: 20, cursor: "pointer", padding: 8,
              }}>⏭</button>
            </div>

            {/* VOLUME */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 14, color: "#8BA7BE" }}>🔉</span>
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
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

          {/* FILTERS */}
          <div style={{ padding: "16px 32px", display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "6px 16px", borderRadius: 100, fontSize: 12, cursor: "pointer",
                background: activeFilter === f ? "#C9A84C" : "rgba(255,255,255,0.05)",
                border: activeFilter === f ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: activeFilter === f ? "#080C12" : "#8BA7BE",
                fontWeight: activeFilter === f ? 700 : 400,
              }}>{f}</button>
            ))}
          </div>

          {/* TRACK LIST */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {filteredTracks.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#8BA7BE", fontSize: 14 }}>
                Треки загружаются...
              </div>
            ) : filteredTracks.map((track, i) => (
              <div
                key={track.file}
                onClick={() => playTrack(track)}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 32px", cursor: "pointer",
                  background: currentTrack.file === track.file ? "rgba(201,168,76,0.08)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  borderLeft: currentTrack.file === track.file ? "3px solid #C9A84C" : "3px solid transparent",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ fontSize: 13, color: "#8BA7BE", width: 24 }}>
                  {currentTrack.file === track.file && isPlaying ? "♪" : `${String(i + 1).padStart(2, "0")}`}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: currentTrack.file === track.file ? "#fff" : "#E8EFF5" }}>
                  {track.title}
                </div>
                <div style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 100,
                  background: "rgba(26,107,154,0.2)", color: "#8BA7BE",
                  border: "1px solid rgba(26,107,154,0.3)",
                  textTransform: "uppercase",
                }}>
                  {track.category}
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: currentTrack.file === track.file && isPlaying ? "#C9A84C" : "rgba(255,255,255,0.2)",
                }} />
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "#8BA7BE", textAlign: "center" }}>
          Лицензионная музыка · JAMENDO Licensing · fonmusic.uz
        </p>
      </div>

      <audio ref={audioRef} src={`${BASE_URL}/${currentTrack.file}`} />
    </main>
  );
}
