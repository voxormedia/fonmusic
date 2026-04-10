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
  { key: "cozy_coffee",    name: "Для кофеен",        icon: "☕", desc: "Уютная и спокойная",    color1: "#2D1B0E", color2: "#8B4513", accent: "#C9A84C" },
  { key: "cocktail_dinner",name: "Для ужина",          icon: "🍽️", desc: "Элегантная атмосфера", color1: "#0A0F2E", color2: "#1a2a6c", accent: "#3B82F6" },
  { key: "cool_calm",      name: "Спокойная",          icon: "🎵", desc: "Тихо и расслабленно",  color1: "#0D1F2D", color2: "#1B4F72", accent: "#60A5FA" },
  { key: "lounge",         name: "Лаунж",              icon: "🏨", desc: "Лобби и лаунж",        color1: "#1A0A2E", color2: "#4a1a8a", accent: "#A78BFA" },
  { key: "luxury",         name: "Премиальная",        icon: "✨", desc: "Роскошь и стиль",       color1: "#1A1200", color2: "#4a3500", accent: "#F59E0B" },
  { key: "shopping_vibes", name: "Для магазинов",      icon: "🛍️", desc: "Энергичная и бодрая",  color1: "#0A1F2E", color2: "#0e4d6e", accent: "#06B6D4" },
  { key: "spa_garden",     name: "Для SPA",            icon: "💆", desc: "Расслабляющая",         color1: "#0A1F0F", color2: "#1a4a2a", accent: "#22C55E" },
  { key: "workout",        name: "Для фитнеса",        icon: "💪", desc: "Максимальная энергия",  color1: "#1F0A0A", color2: "#6a1a1a", accent: "#EF4444" },
  { key: "on_the_rocks",   name: "Для баров",          icon: "🎸", desc: "Вечерняя атмосфера",   color1: "#1A0A0F", color2: "#4a1a2a", accent: "#EC4899" },
  { key: "best_of_radio",  name: "Универсальная",      icon: "⭐", desc: "Подходит для всех",     color1: "#0A1020", color2: "#1a2a4a", accent: "#3B82F6" },
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
  const clean = track.replace(".mp3", "").replace(/_/g, " ");
  const parts = clean.split("-");
  return parts.slice(1).join(" ").trim() || clean;
}

function getArtistName(track: string): string {
  const clean = track.replace(".mp3", "").replace(/_/g, " ");
  return clean.split("-")[0]?.trim() || "Jamendo";
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatScheduleTime(time: string): string {
  return time.slice(0, 5);
}

function getNextSlot(items: any[]): any | null {
  if (!items.length) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  let found = false;
  for (const item of items) {
    const start = timeToMinutes(item.start_time);
    const end = timeToMinutes(item.end_time);
    const inRange = end < start ? cur >= start || cur < end : cur >= start && cur < end;
    if (inRange) { found = true; continue; }
    if (found) return item;
  }
  return items[0] || null;
}

function getMinutesUntilNext(items: any[]): number | null {
  if (!items.length) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  for (const item of items) {
    const start = timeToMinutes(item.start_time);
    const end = timeToMinutes(item.end_time);
    const inRange = end < start ? cur >= start || cur < end : cur >= start && cur < end;
    if (inRange) {
      const diff = end > cur ? end - cur : (24 * 60 - cur) + end;
      return diff;
    }
  }
  return null;
}

// ===== ОНБОРДИНГ =====
function OnboardingScreen({ client, scheduleItems, currentStation, onDone }: {
  client: any, scheduleItems: any[], currentStation: string, onDone: () => void
}) {
  const stationObj = STATIONS.find(s => s.key === currentStation) || STATIONS[9];
  const nextSlot = getNextSlot(scheduleItems);
  const nextStation = nextSlot ? STATIONS.find(s => s.key === nextSlot.stations?.station_key) : null;
  const minutesLeft = getMinutesUntilNext(scheduleItems);
  const hasSchedule = scheduleItems.length > 0;

  return (
    <main style={{ minHeight: "100vh", background: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Фон */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: `radial-gradient(circle, ${stationObj.color2}60 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: `radial-gradient(circle, ${stationObj.color1}40 0%, transparent 70%)` }} />
      </div>

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 10 }}>
        {/* Лого */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: stationObj.accent, borderRadius: 2 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Добро пожаловать, {client.name}! 🎵
          </h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7 }}>
            Музыка уже подобрана для вашего заведения
          </p>
        </div>

        {/* Карточка текущей атмосферы */}
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: `1px solid ${stationObj.accent}30`, borderRadius: 20, padding: "24px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#8BA7BE", letterSpacing: "0.1em", marginBottom: 12 }}>СЕЙЧАС ИГРАЕТ</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: hasSchedule ? 16 : 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${stationObj.color1}, ${stationObj.color2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1px solid ${stationObj.accent}40`, flexShrink: 0 }}>
              {stationObj.icon}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{stationObj.name}</div>
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>{stationObj.desc}</div>
            </div>
          </div>

          {/* Следующая смена */}
          {hasSchedule && nextStation && minutesLeft !== null && (
            <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>
                Следующая смена через {minutesLeft >= 60 ? `${Math.floor(minutesLeft / 60)}ч ${minutesLeft % 60}м` : `${minutesLeft} мин`}
              </div>
              <div style={{ fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{nextStation.icon}</span>
                <span>{nextStation.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Объяснение */}
        {hasSchedule && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#22C55E", fontWeight: 700, marginBottom: 4 }}>🔄 Музыка меняется автоматически</div>
            <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>
              В течение дня музыка сама переключается под время суток — утром одна атмосфера, вечером другая. Вам ничего не нужно делать.
            </div>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>
            💡 Если хотите другую музыку прямо сейчас — нажмите <span style={{ color: "#fff" }}>"Сменить музыку"</span> в плеере. Расписание продолжит работать с следующей смены.
          </div>
        </div>

        <button onClick={onDone} style={{
          width: "100%", padding: "18px", background: stationObj.accent,
          border: "none", borderRadius: 14, color: "#070B14",
          fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
          boxShadow: `0 8px 32px ${stationObj.accent}40`,
        }}>
          Понятно, запустить музыку →
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#4a5a6a" }}>
          Этот экран можно открыть снова из настроек
        </div>
      </div>
    </main>
  );
}

export default function PlayerPage() {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState("");
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [currentStation, setCurrentStation] = useState("best_of_radio");
  const [volume, setVolume] = useState(0.8);
  const [showStations, setShowStations] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<any[]>([]);
  const [trackFade, setTrackFade] = useState(1);
  const [eqBars, setEqBars] = useState([4, 8, 12, 7, 10, 5, 9, 6]);
  const [nowTime, setNowTime] = useState(new Date());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scheduleRef = useRef<any[]>([]);
  const lastScheduleStation = useRef<string>("");
  const clientRef = useRef<any>(null);
  const currentStationRef = useRef<string>("best_of_radio");
  const eqAnimRef = useRef<any>(null);

  const currentStationObj = STATIONS.find(s => s.key === currentStation) || STATIONS[9];
  const accent = currentStationObj.accent;
  const isAutoMode = clientRef.current?.music_mode !== "manual" && scheduleRef.current.length > 0;

  // Часы для таймлайна
  useEffect(() => {
    const interval = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Эквалайзер
  useEffect(() => {
    if (isPlaying) {
      eqAnimRef.current = setInterval(() => {
        setEqBars(prev => prev.map(() => Math.floor(Math.random() * 16) + 4));
      }, 150);
    } else {
      clearInterval(eqAnimRef.current);
      setEqBars([4, 8, 12, 7, 10, 5, 9, 6]);
    }
    return () => clearInterval(eqAnimRef.current);
  }, [isPlaying]);

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    if (!clientId) { window.location.href = "/login"; return; }
    initClient(clientId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (clientRef.current?.music_mode !== "manual") checkSchedule();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const initClient = async (clientId: string) => {
    const [data, tmpl] = await Promise.all([
      sb(`clients?id=eq.${clientId}&select=*`),
      sb("schedule_templates?select=*&order=template_name"),
    ]);
    if (!data || data.length === 0) { window.location.href = "/login"; return; }
    const c = data[0];
    if (c.subscription_status === "expired") { window.location.href = "/dashboard"; return; }
    setClient(c);
    clientRef.current = c;
    if (tmpl) setScheduleTemplates(tmpl);

    const station = c.station_key || "best_of_radio";
    setCurrentStation(station);
    currentStationRef.current = station;

    // Загружаем расписание
    let items: any[] = [];
    if (c.template_key) {
      items = await loadScheduleItems(c.template_key);
    }

    setLoading(false);

    // Показываем онбординг при первом входе
    const onboardingDone = localStorage.getItem(`fonmusic_onboarding_${clientId}`);
    if (!onboardingDone) {
      setShowOnboarding(true);
    }

    if (c.template_key && c.music_mode !== "manual" && items.length > 0) {
      scheduleRef.current = items;
      checkScheduleWithItems(items, station);
    } else {
      loadPlaylist(station);
    }
  };

  const loadScheduleItems = async (templateKey: string): Promise<any[]> => {
    try {
      const tmpl = await sb(`schedule_templates?template_key=eq.${templateKey}&select=id`);
      if (!tmpl || tmpl.length === 0) return [];
      const items = await sb(`schedule_template_items?template_id=eq.${tmpl[0].id}&select=start_time,end_time,stations(station_key)&order=start_time`);
      if (items && items.length > 0) {
        setScheduleItems(items);
        scheduleRef.current = items;
        return items;
      }
    } catch {}
    return [];
  };

  const checkSchedule = () => checkScheduleWithItems(scheduleRef.current, currentStationRef.current);

  const checkScheduleWithItems = (items: any[], currentSt: string) => {
    if (!items.length) return;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    for (const item of items) {
      const start = timeToMinutes(item.start_time);
      const end = timeToMinutes(item.end_time);
      const inRange = end < start ? cur >= start || cur < end : cur >= start && cur < end;
      if (inRange) {
        const stationKey = item.stations?.station_key;
        if (stationKey && stationKey !== lastScheduleStation.current) {
          lastScheduleStation.current = stationKey;
          setCurrentStation(stationKey);
          currentStationRef.current = stationKey;
          loadPlaylist(stationKey);
        }
        break;
      }
    }
  };

  const loadPlaylist = async (stationKey: string) => {
    setIsLoadingTrack(true);
    const folder = STATION_FOLDERS[stationKey] || "Best Of Radio";
    try {
      const res = await fetch(`${BASE_URL}/${folder.replace(/ /g, "%20")}/playlist.json`);
      const raw = await res.json();
      const tracks: string[] = raw.map((t: any) => typeof t === "string" ? t : t.f).filter(Boolean);
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
      setTrackIndex(0);
      setCurrentTrack(shuffled[0] || "");
      setIsLoadingTrack(false);
      setTimeout(() => playTrack(0, shuffled, stationKey), 100);
    } catch { setIsLoadingTrack(false); }
  };

  const playTrack = (index: number, tracks?: string[], stationKey?: string) => {
    const list = tracks || playlist;
    const station = stationKey || currentStationRef.current;
    if (!list.length) return;
    const track = list[index % list.length];
    const folder = STATION_FOLDERS[station] || "Best Of Radio";
    const url = `${BASE_URL}/${folder.replace(/ /g, "%20")}/${encodeURIComponent(track)}`;
    setTrackFade(0);
    setTimeout(() => {
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
      setProgress(0); setCurrentTime(0);
      setTrackFade(1);
    }, 300);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      if (!currentTrack) playTrack(0);
      else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
    }
  };

  const nextTrack = () => playTrack((trackIndex + 1) % playlist.length);
  const prevTrack = () => playTrack((trackIndex - 1 + playlist.length) % playlist.length);

  const switchStation = async (stationKey: string) => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentStation(stationKey);
    currentStationRef.current = stationKey;
    setIsPlaying(false);
    setShowStations(false);
    setIsLoadingTrack(true);
    setProgress(0); setCurrentTime(0);
    lastScheduleStation.current = stationKey;
    if (clientRef.current) clientRef.current.music_mode = "manual";
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ station_key: stationKey, music_mode: "manual" }),
    });
    setClient((prev: any) => ({ ...prev, music_mode: "manual", station_key: stationKey }));
    const folder = STATION_FOLDERS[stationKey] || "Best Of Radio";
    try {
      const res = await fetch(`${BASE_URL}/${folder.replace(/ /g, "%20")}/playlist.json`);
      const raw = await res.json();
      const tracks: string[] = raw.map((t: any) => typeof t === "string" ? t : t.f).filter(Boolean);
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled); setTrackIndex(0); setCurrentTrack(shuffled[0] || "");
      setIsLoadingTrack(false);
      setTimeout(() => playTrack(0, shuffled, stationKey), 100);
    } catch { setIsLoadingTrack(false); }
  };

  const handleOnboardingDone = () => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    if (clientId) localStorage.setItem(`fonmusic_onboarding_${clientId}`, "done");
    setShowOnboarding(false);
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
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  };

  // Текущий слот расписания
  const getCurrentSlot = () => {
    if (!scheduleItems.length) return null;
    const cur = nowTime.getHours() * 60 + nowTime.getMinutes();
    for (const item of scheduleItems) {
      const start = timeToMinutes(item.start_time);
      const end = timeToMinutes(item.end_time);
      const inRange = end < start ? cur >= start || cur < end : cur >= start && cur < end;
      if (inRange) return item;
    }
    return null;
  };

  const nextSlot = getNextSlot(scheduleItems);
  const nextSlotStation = nextSlot ? STATIONS.find(s => s.key === nextSlot.stations?.station_key) : null;
  const minutesLeft = getMinutesUntilNext(scheduleItems);
  const currentSlot = getCurrentSlot();

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE", fontSize: 14 }}>⏳ Загрузка...</div>
    </main>
  );

  if (showOnboarding) return (
    <OnboardingScreen
      client={client}
      scheduleItems={scheduleItems}
      currentStation={currentStation}
      onDone={handleOnboardingDone}
    />
  );

  return (
    <main style={{ minHeight: "100vh", fontFamily: "Georgia, serif", color: "#E8EFF5", position: "relative", overflow: "hidden", background: "#070B14" }}>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => playTrack((trackIndex + 1) % playlist.length)}
        onError={() => setTimeout(() => playTrack((trackIndex + 1) % playlist.length), 2000)}
      />

      {/* АТМОСФЕРНЫЙ ФОН */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", transition: "all 2s ease" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: `radial-gradient(circle, ${currentStationObj.color2}80 0%, transparent 70%)`, transition: "all 2s ease", animation: "float1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: `radial-gradient(circle, ${currentStationObj.color1}60 0%, transparent 70%)`, transition: "all 2s ease", animation: "float2 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: "30%", height: "30%", borderRadius: "50%", background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, transition: "all 2s ease", animation: "float3 6s ease-in-out infinite" }} />
      </div>

      {/* NAV */}
      <header style={{ position: "relative", zIndex: 10, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 18, background: accent, borderRadius: 2, transition: "background 1s" }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setShowOnboarding(true)} style={{ fontSize: 11, color: "#4a5a6a", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Как это работает?
          </button>
          <a href="/dashboard" style={{ fontSize: 12, color: "#8BA7BE", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>Кабинет</a>
        </div>
      </header>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 600, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* ГЛАВНАЯ КАРТОЧКА ПЛЕЕРА */}
        <div style={{
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
          border: `1px solid ${accent}30`, borderRadius: 28, padding: "32px 28px", marginBottom: 12,
          boxShadow: `0 0 60px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.08)`,
          transition: "border-color 1s, box-shadow 1s",
        }}>
          {/* Обложка */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 140, height: 140, borderRadius: 22,
              background: `linear-gradient(135deg, ${currentStationObj.color1}, ${currentStationObj.color2})`,
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 64, border: `1px solid ${accent}40`,
              boxShadow: `0 0 40px ${accent}30`, transition: "all 1s ease", opacity: trackFade,
            }}>
              {currentStationObj.icon}
            </div>

            {/* Эквалайзер */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 18, marginBottom: 14 }}>
              {eqBars.map((h, i) => (
                <div key={i} style={{ width: 3, borderRadius: 2, height: `${h}px`, background: isPlaying ? accent : "rgba(255,255,255,0.15)", transition: "height 0.15s ease, background 1s" }} />
              ))}
            </div>

            {/* Трек + контекст */}
            <div style={{ opacity: trackFade, transition: "opacity 0.3s" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>
                {isLoadingTrack ? "Загрузка..." : currentTrack ? getTrackName(currentTrack) : "Нажмите Play"}
              </div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 10 }}>
                {currentTrack ? getArtistName(currentTrack) : "—"}
              </div>

              {/* КОНТЕКСТ — почему играет эта музыка */}
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: accent, background: `${accent}15`, padding: "4px 14px", borderRadius: 100, border: `1px solid ${accent}30`, transition: "all 1s" }}>
                  {currentStationObj.icon} {currentStationObj.name}
                  {isAutoMode && <span style={{ color: "#22C55E", marginLeft: 4 }}>· Авто</span>}
                </div>
                {/* Следующая смена */}
                {isAutoMode && nextSlotStation && minutesLeft !== null && (
                  <div style={{ fontSize: 11, color: "#4a5a6a" }}>
                    Следующая смена через {minutesLeft >= 60 ? `${Math.floor(minutesLeft / 60)}ч ${minutesLeft % 60}м` : `${minutesLeft}м`} → {nextSlotStation.icon} {nextSlotStation.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Прогресс */}
          <div style={{ marginBottom: 8, position: "relative" }}>
            <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, ${accent}bb)`, borderRadius: 2, transition: "width 0.3s linear", boxShadow: `0 0 8px ${accent}80` }} />
            </div>
            <input type="range" min={0} max={100} step={0.1} value={progress} onChange={handleSeek}
              style={{ position: "absolute", top: -6, left: 0, width: "100%", opacity: 0, height: 16, cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4a5a6a", marginBottom: 24 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Кнопки */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 24 }}>
            <button onClick={prevTrack} style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#8BA7BE", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>⏮</button>
            <button onClick={togglePlay} disabled={isLoadingTrack} style={{ width: 80, height: 80, borderRadius: "50%", background: accent, border: "none", cursor: isLoadingTrack ? "wait" : "pointer", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 32px ${accent}60, 0 0 64px ${accent}30`, color: "#fff", transition: "all 1s" }}>
              {isLoadingTrack ? "⏳" : isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={nextTrack} style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#8BA7BE", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>⏭</button>
          </div>

          {/* Громкость */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#4a5a6a" }}>🔈</span>
            <div style={{ flex: 1, position: "relative", height: 4 }}>
              <div style={{ height: "100%", background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${volume * 100}%`, height: "100%", background: accent, borderRadius: 2, transition: "background 1s" }} />
              </div>
              <input type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
                style={{ position: "absolute", top: -6, left: 0, width: "100%", opacity: 0, height: 16, cursor: "pointer" }} />
            </div>
            <span style={{ fontSize: 11, color: "#4a5a6a", minWidth: 28, textAlign: "right" }}>{Math.round(volume * 100)}%</span>
            <span style={{ fontSize: 14, color: accent, transition: "color 1s" }}>🔊</span>
          </div>
        </div>

        {/* 2. СМЕНИТЬ МУЗЫКУ ПРЯМО СЕЙЧАС */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 10 }}>
          <button onClick={() => setShowStations(!showStations)} style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎛️</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Сменить музыку прямо сейчас</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>Выберите другую атмосферу</div>
              </div>
            </div>
            <span style={{ color: accent, fontSize: 11, transition: "color 1s" }}>{showStations ? "▲" : "▼"}</span>
          </button>
          {showStations && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px", maxHeight: 320, overflowY: "auto" }}>
              <div style={{ padding: "8px 14px 4px", fontSize: 11, color: "#4a5a6a" }}>
                💡 Музыка сменится сейчас. Расписание продолжит работать с следующего слота.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "4px" }}>
                {STATIONS.map(s => (
                  <button key={s.key} onClick={() => switchStation(s.key)} style={{
                    padding: "12px", borderRadius: 12, cursor: "pointer",
                    textAlign: "left", fontFamily: "Georgia, serif",
                    background: currentStation === s.key ? `${s.accent}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${currentStation === s.key ? `${s.accent}40` : "rgba(255,255,255,0.06)"}`,
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: currentStation === s.key ? 700 : 400, color: currentStation === s.key ? s.accent : "#fff", marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#4a5a6a" }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. КАК МЕНЯЕТСЯ МУЗЫКА — ТАЙМЛАЙН */}
        {scheduleItems.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 10 }}>
            <button onClick={() => setShowTimeline(!showTimeline)} style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Как меняется музыка в течение дня</div>
                  <div style={{ fontSize: 11, color: "#22C55E" }}>Автоматическое расписание · активно</div>
                </div>
              </div>
              <span style={{ color: accent, fontSize: 11 }}>{showTimeline ? "▲" : "▼"}</span>
            </button>
            {showTimeline && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {scheduleItems.map((item, i) => {
                    const stKey = item.stations?.station_key;
                    const st = STATIONS.find(s => s.key === stKey);
                    const isCurrent = currentSlot === item;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10,
                        background: isCurrent ? `${accent}12` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isCurrent ? `${accent}40` : "rgba(255,255,255,0.04)"}`,
                        transition: "all 0.3s",
                      }}>
                        <div style={{ width: 40, flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? accent : "#8BA7BE" }}>{formatScheduleTime(item.start_time)}</div>
                        </div>
                        <div style={{ width: 2, height: 20, background: isCurrent ? accent : "rgba(255,255,255,0.1)", borderRadius: 1, flexShrink: 0, transition: "background 1s" }} />
                        <span style={{ fontSize: 16 }}>{st?.icon || "🎵"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#fff" : "#8BA7BE" }}>{st?.name || stKey}</div>
                        </div>
                        {isCurrent && <div style={{ fontSize: 10, color: accent, fontWeight: 700 }}>СЕЙЧАС</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. BOX АПСЕЛЛ */}
        <div style={{ background: "rgba(201,168,76,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 18, overflow: "hidden" }}>
          <button onClick={() => setShowBox(!showBox)} style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📦</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C" }}>Музыка 24/7 без браузера</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>Хотите чтобы музыка играла автоматически?</div>
              </div>
            </div>
            <span style={{ color: "#C9A84C", fontSize: 11 }}>{showBox ? "▲" : "▼"}</span>
          </button>
          {showBox && (
            <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
              <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, margin: "14px 0" }}>
                Небольшая приставка подключается к аудиосистеме и запускает музыку автоматически — без браузера, без компьютера, без участия человека.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {["Работает 24/7", "Автозапуск", "Без компьютера", "Удалённое управление"].map(f => (
                  <span key={f} style={{ fontSize: 11, padding: "3px 10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 100, color: "#C9A84C" }}>{f}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#C9A84C" }}>$70</span>
                  <span style={{ fontSize: 11, color: "#8BA7BE", marginLeft: 8 }}>единоразово</span>
                </div>
                <a href="https://t.me/fonmusic2026" target="_blank" style={{ padding: "10px 20px", background: "#C9A84C", color: "#080C12", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  Узнать подробнее →
                </a>
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(1.05)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-15px)} }
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body { overflow-x:hidden; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
      `}</style>
    </main>
  );
}
