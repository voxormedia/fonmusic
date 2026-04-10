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

const STATION_ID_MAP: Record<string, number> = {
  cozy_coffee: 1, cocktail_dinner: 2, cool_calm: 3, lounge: 4,
  luxury: 5, shopping_vibes: 6, spa_garden: 7, workout: 8,
  on_the_rocks: 9, best_of_radio: 10,
};

const STATIONS = [
  { key: "cozy_coffee",    name: "Для кофеен",    icon: "☕", desc: "Уютная и спокойная",   color1: "#2D1B0E", color2: "#8B4513", accent: "#C9A84C" },
  { key: "cocktail_dinner",name: "Для ужина",      icon: "🍽️", desc: "Элегантная атмосфера",color1: "#0A0F2E", color2: "#1a2a6c", accent: "#3B82F6" },
  { key: "cool_calm",      name: "Спокойная",      icon: "🎵", desc: "Тихо и расслабленно", color1: "#0D1F2D", color2: "#1B4F72", accent: "#60A5FA" },
  { key: "lounge",         name: "Лаунж",          icon: "🏨", desc: "Лобби и лаунж",       color1: "#1A0A2E", color2: "#4a1a8a", accent: "#A78BFA" },
  { key: "luxury",         name: "Премиальная",    icon: "✨", desc: "Роскошь и стиль",      color1: "#1A1200", color2: "#4a3500", accent: "#F59E0B" },
  { key: "shopping_vibes", name: "Для магазинов",  icon: "🛍️", desc: "Энергичная и бодрая", color1: "#0A1F2E", color2: "#0e4d6e", accent: "#06B6D4" },
  { key: "spa_garden",     name: "Для SPA",        icon: "💆", desc: "Расслабляющая",        color1: "#0A1F0F", color2: "#1a4a2a", accent: "#22C55E" },
  { key: "workout",        name: "Для фитнеса",    icon: "💪", desc: "Максимальная энергия", color1: "#1F0A0A", color2: "#6a1a1a", accent: "#EF4444" },
  { key: "on_the_rocks",   name: "Для баров",      icon: "🎸", desc: "Вечерняя атмосфера",  color1: "#1A0A0F", color2: "#4a1a2a", accent: "#EC4899" },
  { key: "best_of_radio",  name: "Универсальная",  icon: "⭐", desc: "Подходит для всех",    color1: "#0A1020", color2: "#1a2a4a", accent: "#3B82F6" },
];

const QUICK_STATIONS = ["cozy_coffee", "cocktail_dinner", "cool_calm", "shopping_vibes"];

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

function getTrackName(t: string) {
  const clean = t.replace(".mp3", "").replace(/_/g, " ");
  const parts = clean.split("-");
  return parts.slice(1).join(" ").trim() || clean;
}

function getArtistName(t: string) {
  return t.replace(".mp3", "").replace(/_/g, " ").split("-")[0]?.trim() || "Jamendo";
}

function toMin(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fmtTime(time: string) { return time.slice(0, 5); }

function fmtSec(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
}

function getNextSlot(items: any[]) {
  if (!items.length) return null;
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  let found = false;
  for (const item of items) {
    const s = toMin(item.start_time), e = toMin(item.end_time);
    const inRange = e < s ? cur >= s || cur < e : cur >= s && cur < e;
    if (inRange) { found = true; continue; }
    if (found) return item;
  }
  return items[0] || null;
}

function getMinLeft(items: any[]) {
  if (!items.length) return null;
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  for (const item of items) {
    const s = toMin(item.start_time), e = toMin(item.end_time);
    const inRange = e < s ? cur >= s || cur < e : cur >= s && cur < e;
    if (inRange) return e > cur ? e - cur : (24 * 60 - cur) + e;
  }
  return null;
}

function getCurrentSlot(items: any[]) {
  if (!items.length) return null;
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  for (const item of items) {
    const s = toMin(item.start_time), e = toMin(item.end_time);
    const inRange = e < s ? cur >= s || cur < e : cur >= s && cur < e;
    if (inRange) return item;
  }
  return null;
}

// ===== РЕДАКТОР РАСПИСАНИЯ =====
function ScheduleEditor({ client, scheduleItems, accent, onSave, onCancel }: any) {
  const [slots, setSlots] = useState(scheduleItems.map((item: any) => ({
    ...item,
    selected_station_key: item.stations?.station_key || "best_of_radio",
  })));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      };

      const customKey = `custom_${client.id}`;
      let templateId: number;

      const existing = await fetch(`${SUPABASE_URL}/rest/v1/schedule_templates?template_key=eq.${customKey}&select=id`, { headers });
      const existingData = await existing.json();

      if (existingData && existingData.length > 0) {
        templateId = existingData[0].id;
        await fetch(`${SUPABASE_URL}/rest/v1/schedule_template_items?template_id=eq.${templateId}`, { method: "DELETE", headers });
      } else {
        const tmplRes = await fetch(`${SUPABASE_URL}/rest/v1/schedule_templates`, {
          method: "POST", headers,
          body: JSON.stringify({
            template_key: customKey,
            template_name: `${client.name} (личное)`,
            business_type: client.business_type || "custom",
          }),
        });
        const tmplData = await tmplRes.json();
        templateId = tmplData[0].id;
        await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${client.id}`, {
          method: "PATCH", headers,
          body: JSON.stringify({ template_key: customKey }),
        });
      }

      const newSlots = slots.map((slot: any) => ({
        template_id: templateId,
        start_time: slot.start_time,
        end_time: slot.end_time,
        station_id: STATION_ID_MAP[slot.selected_station_key] || 10,
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/schedule_template_items`, {
        method: "POST", headers,
        body: JSON.stringify(newSlots),
      });

      const updatedItems = slots.map((slot: any) => ({
        ...slot,
        stations: { station_key: slot.selected_station_key },
      }));

      onSave(updatedItems);
    } catch {
      setError("Ошибка сохранения. Попробуйте ещё раз.");
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 12 }}>
        Выберите атмосферу для каждого временного слота:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {slots.map((slot: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: accent, width: 44, flexShrink: 0 }}>
              {fmtTime(slot.start_time)}
            </div>
            <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 1, flexShrink: 0 }} />
            <select
              value={slot.selected_station_key}
              onChange={e => {
                const updated = [...slots];
                updated[i] = { ...updated[i], selected_station_key: e.target.value };
                setSlots(updated);
              }}
              style={{ flex: 1, padding: "8px 12px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", fontFamily: "Georgia, serif" }}
            >
              {STATIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.icon} {s.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {error && <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} disabled={saving} style={{ flex: 1, padding: "11px", background: accent, border: "none", borderRadius: 10, color: "#070B14", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          {saving ? "Сохраняем..." : "✓ Сохранить расписание"}
        </button>
        <button onClick={onCancel} style={{ padding: "11px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8BA7BE", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
         Отмена
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#4a5a6a", marginTop: 8, textAlign: "center" }}>
        Изменения сохранятся и будут работать автоматически
      </div>
      <button onClick={async () => {
        if (!confirm("Вернуться к стандартному расписанию для вашего типа заведения?")) return;
        const headers = {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        };
        const defaultKey = client.default_template_key || "cafe_standard";
await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${client.id}`, {
  method: "PATCH", headers,
  body: JSON.stringify({ template_key: defaultKey, music_mode: "automatic" }),
});
        onCancel();
        window.location.reload();
      }} style={{ width: "100%", marginTop: 6, padding: "9px", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#4a5a6a", fontSize: 11, cursor: "pointer", fontFamily: "Georgia, serif" }}>
        ↩ Вернуться к стандартному расписанию
      </button>
    </div>
  );
}

// ===== ОНБОРДИНГ =====
function OnboardingScreen({ client, scheduleItems, currentStation, onDone }: any) {
  const st = STATIONS.find(s => s.key === currentStation) || STATIONS[9];
  const nextSlot = getNextSlot(scheduleItems);
  const nextSt = nextSlot ? STATIONS.find(s => s.key === nextSlot.stations?.station_key) : null;
  const minLeft = getMinLeft(scheduleItems);
  const hasSchedule = scheduleItems.length > 0;

  return (
    <main style={{ minHeight: "100vh", background: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: `radial-gradient(circle, ${st.color2}60 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: `radial-gradient(circle, ${st.color1}40 0%, transparent 70%)` }} />
      </div>
      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: st.accent, borderRadius: 2 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Добро пожаловать, {client.name}! 🎵</h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7 }}>Музыка уже подобрана для вашего заведения</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: `1px solid ${st.accent}30`, borderRadius: 20, padding: "24px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#8BA7BE", letterSpacing: "0.1em", marginBottom: 12 }}>СЕЙЧАС ИГРАЕТ</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: hasSchedule ? 16 : 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${st.color1}, ${st.color2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1px solid ${st.accent}40`, flexShrink: 0 }}>
              {st.icon}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{st.name}</div>
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>{st.desc}</div>
            </div>
          </div>
          {hasSchedule && nextSt && minLeft !== null && (
            <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>
                Следующая смена через {minLeft >= 60 ? `${Math.floor(minLeft / 60)}ч ${minLeft % 60}м` : `${minLeft} мин`}
              </div>
              <div style={{ fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{nextSt.icon}</span><span>{nextSt.name}</span>
              </div>
            </div>
          )}
        </div>

        {hasSchedule && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#22C55E", fontWeight: 700, marginBottom: 4 }}>🔄 Музыка меняется автоматически</div>
            <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>
              В течение дня музыка сама переключается под время суток. Вам ничего не нужно делать.
            </div>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>
            💡 Хотите другую музыку прямо сейчас? Нажмите <span style={{ color: "#fff" }}>"Сменить музыку"</span> в плеере. Расписание продолжит работать с следующей смены.
          </div>
        </div>

        <button onClick={onDone} style={{ width: "100%", padding: "18px", background: st.accent, border: "none", borderRadius: 14, color: "#070B14", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", boxShadow: `0 8px 32px ${st.accent}40` }}>
          Понятно, запустить музыку →
        </button>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#4a5a6a" }}>Этот экран можно открыть снова — кнопка "Как это работает?"</div>
      </div>
    </main>
  );
}

// ===== ГЛАВНЫЙ ПЛЕЕР =====
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
  const [showAllStations, setShowAllStations] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [trackFade, setTrackFade] = useState(1);
  const [eqBars, setEqBars] = useState([4, 8, 12, 7, 10, 5, 9, 6]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scheduleRef = useRef<any[]>([]);
  const lastScheduleStation = useRef<string>("");
  const clientRef = useRef<any>(null);
  const currentStationRef = useRef<string>("best_of_radio");
  const eqAnimRef = useRef<any>(null);

  const stObj = STATIONS.find(s => s.key === currentStation) || STATIONS[9];
  const accent = stObj.accent;
  const isAutoMode = client?.music_mode !== "manual" && scheduleRef.current.length > 0;

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
    const data = await sb(`clients?id=eq.${clientId}&select=*`);
    if (!data || data.length === 0) { window.location.href = "/login"; return; }
    const c = data[0];
    if (c.subscription_status === "expired") { window.location.href = "/dashboard"; return; }
    setClient(c);
    clientRef.current = c;
    const station = c.station_key || "best_of_radio";
    setCurrentStation(station);
    currentStationRef.current = station;
    let items: any[] = [];
    if (c.template_key) items = await loadScheduleItems(c.template_key);
    setLoading(false);
    const onboardingDone = localStorage.getItem(`fonmusic_onboarding_${clientId}`);
    if (!onboardingDone) setShowOnboarding(true);
    if (c.template_key && c.music_mode !== "manual" && items.length > 0) {
  scheduleRef.current = items;
  // Находим текущую станцию по расписанию
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  let scheduleStation = station;
  for (const item of items) {
    const s = toMin(item.start_time), e = toMin(item.end_time);
    const inRange = e < s ? cur >= s || cur < e : cur >= s && cur < e;
    if (inRange && item.stations?.station_key) {
      scheduleStation = item.stations.station_key;
      lastScheduleStation.current = scheduleStation;
      break;
    }
  }
  setCurrentStation(scheduleStation);
  currentStationRef.current = scheduleStation;
  loadPlaylist(scheduleStation);
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

  const checkScheduleWithItems = (items: any[], _cur: string) => {
    if (!items.length) return;
    const cur = new Date().getHours() * 60 + new Date().getMinutes();
    for (const item of items) {
      const s = toMin(item.start_time), e = toMin(item.end_time);
      const inRange = e < s ? cur >= s || cur < e : cur >= s && cur < e;
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
      setPlaylist(shuffled); setTrackIndex(0); setCurrentTrack(shuffled[0] || "");
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
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      setCurrentTrack(track);
      setTrackIndex(index % list.length);
      setProgress(0); setCurrentTime(0); setTrackFade(1);
    }, 300);
  };

  const togglePlay = async () => {
  if (isPlaying && audioRef.current) {
    audioRef.current.pause();
    setIsPlaying(false);
    return;
  }
  if (!audioRef.current || !audioRef.current.src) {
    await loadPlaylist(currentStationRef.current);
    return;
  }
  audioRef.current.play().catch(() => {});
  setIsPlaying(true);
};

  const nextTrack = () => playTrack((trackIndex + 1) % playlist.length);
  const prevTrack = () => playTrack((trackIndex - 1 + playlist.length) % playlist.length);

  const switchStation = async (stationKey: string) => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentStation(stationKey); currentStationRef.current = stationKey;
    setIsPlaying(false); setShowAllStations(false); setIsLoadingTrack(true);
    setProgress(0); setCurrentTime(0); lastScheduleStation.current = stationKey;
    if (clientRef.current) clientRef.current.music_mode = "manual";
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ station_key: stationKey, music_mode: "manual" }) });
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
  // Запускаем музыку сразу после нажатия кнопки пользователем
  setTimeout(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (!audioRef.current) {
      loadPlaylist(currentStationRef.current);
    }
  }, 100);
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
    if (audioRef.current && audioRef.current.duration)
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
  };

  const nextSlot = getNextSlot(scheduleItems);
  const nextSlotSt = nextSlot ? STATIONS.find(s => s.key === nextSlot.stations?.station_key) : null;
  const minLeft = getMinLeft(scheduleItems);
  const currentSlot = getCurrentSlot(scheduleItems);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  if (showOnboarding) return <OnboardingScreen client={client} scheduleItems={scheduleItems} currentStation={currentStation} onDone={() => {
  const clientId = localStorage.getItem("fonmusic_client_id");
  if (clientId) localStorage.setItem(`fonmusic_onboarding_${clientId}`, "done");
  setShowOnboarding(false);
  if (audioRef.current) {
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }
}} />;
  return (
    <main style={{ minHeight: "100vh", fontFamily: "Georgia, serif", color: "#E8EFF5", position: "relative", overflow: "hidden", background: "#070B14" }}>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate}
        onEnded={() => playTrack((trackIndex + 1) % playlist.length)}
        onError={() => setTimeout(() => playTrack((trackIndex + 1) % playlist.length), 2000)} />

      {/* АТМОСФЕРНЫЙ ФОН */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: `radial-gradient(circle, ${stObj.color2}80 0%, transparent 70%)`, transition: "all 2s ease", animation: "float1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: `radial-gradient(circle, ${stObj.color1}60 0%, transparent 70%)`, transition: "all 2s ease", animation: "float2 10s ease-in-out infinite" }} />
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
          <button onClick={() => { localStorage.removeItem("fonmusic_client_id"); window.location.href = "/login"; }} style={{ fontSize: 12, color: "#8BA7BE", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
  Выйти
</button>
        </div>
      </header>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 600, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* 1. ПЛЕЕР */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: `1px solid ${accent}30`, borderRadius: 28, padding: "32px 28px", marginBottom: 12, boxShadow: `0 0 60px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.08)`, transition: "border-color 1s, box-shadow 1s" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 140, height: 140, borderRadius: 22, background: `linear-gradient(135deg, ${stObj.color1}, ${stObj.color2})`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, border: `1px solid ${accent}40`, boxShadow: `0 0 40px ${accent}30`, transition: "all 1s ease", opacity: trackFade }}>
              {stObj.icon}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 18, marginBottom: 14 }}>
              {eqBars.map((h, i) => (
                <div key={i} style={{ width: 3, borderRadius: 2, height: `${h}px`, background: isPlaying ? accent : "rgba(255,255,255,0.15)", transition: "height 0.15s ease, background 1s" }} />
              ))}
            </div>
            <div style={{ opacity: trackFade, transition: "opacity 0.3s" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>
                {isLoadingTrack ? "Загрузка..." : currentTrack ? getTrackName(currentTrack) : "Нажмите Play"}
              </div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 10 }}>
                {currentTrack ? getArtistName(currentTrack) : "—"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: accent, background: `${accent}15`, padding: "4px 14px", borderRadius: 100, border: `1px solid ${accent}30`, transition: "all 1s" }}>
  {stObj.icon} Сейчас играет: {stObj.name}
  {isAutoMode
    ? <span style={{ color: "#22C55E", marginLeft: 4 }}>· Авто</span>
    : <span style={{ color: "#F59E0B", marginLeft: 4 }}>· Вручную</span>
  }
</div>
{isAutoMode && nextSlotSt && minLeft !== null && (
  <div style={{ fontSize: 11, color: "#4a5a6a" }}>
    По расписанию до {nextSlot ? fmtTime(nextSlot.start_time) : "—"} · следующая → {nextSlotSt.icon} {nextSlotSt.name}
  </div>
)}
{!isAutoMode && scheduleItems.length > 0 && (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <div style={{ fontSize: 11, color: "#F59E0B" }}>
      Временно · расписание продолжит работать автоматически
    </div>
    <button onClick={async () => {
      if (clientRef.current) clientRef.current.music_mode = "automatic";
      await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ music_mode: "automatic" }) });
      setClient((prev: any) => ({ ...prev, music_mode: "automatic" }));
      checkSchedule();
    }} style={{ fontSize: 11, color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 100, padding: "3px 12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
      🔄 Вернуться к расписанию
    </button>
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
            <span>{fmtSec(currentTime)}</span><span>{fmtSec(duration)}</span>
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

        {/* 2. СМЕНИТЬ МУЗЫКУ */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🎛️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Сменить музыку прямо сейчас</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>Музыку можно сменить вручную. Расписание продолжит работать автоматически.</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {QUICK_STATIONS.map(key => {
                const s = STATIONS.find(st => st.key === key)!;
                const isActive = currentStation === key;
                return (
                  <button key={key} onClick={() => switchStation(key)} style={{ padding: "12px", borderRadius: 12, cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "left", background: isActive ? `${s.accent}15` : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? `${s.accent}40` : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? s.accent : "#fff" }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: "#4a5a6a" }}>{s.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowAllStations(!showAllStations)} style={{ width: "100%", padding: "9px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 12, color: "#8BA7BE" }}>
              {showAllStations ? "Скрыть ▲" : "Посмотреть все атмосферы ▼"}
            </button>
          </div>
          {showAllStations && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px", maxHeight: 280, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "4px" }}>
                {STATIONS.filter(s => !QUICK_STATIONS.includes(s.key)).map(s => {
                  const isActive = currentStation === s.key;
                  return (
                    <button key={s.key} onClick={() => switchStation(s.key)} style={{ padding: "12px", borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif", background: isActive ? `${s.accent}15` : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? `${s.accent}40` : "rgba(255,255,255,0.06)"}` }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? s.accent : "#fff", marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: "#4a5a6a" }}>{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. ТАЙМЛАЙН + РЕДАКТОР */}
        {scheduleItems.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 10 }}>
            <button onClick={() => { setShowTimeline(!showTimeline); setShowScheduleEditor(false); }} style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Как меняется музыка в течение дня</div>
                    <button onClick={e => { e.stopPropagation(); setShowTimeline(true); setShowScheduleEditor(!showScheduleEditor); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#8BA7BE", padding: "2px 8px", fontFamily: "Georgia, serif" }}>
                      ✏️ Изменить
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "#22C55E" }}>Автоматическое расписание · активно</div>
                </div>
              </div>
              <span style={{ color: accent, fontSize: 11 }}>{showTimeline ? "▲" : "▼"}</span>
            </button>

            {showTimeline && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 10 }}>
                  🔄 Музыка автоматически меняется в течение дня
                </div>

                {!showScheduleEditor ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {scheduleItems.map((item, i) => {
                      const stKey = item.stations?.station_key;
                      const st = STATIONS.find(s => s.key === stKey);
                      const isCurrent = currentSlot === item;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: isCurrent ? `${accent}12` : "rgba(255,255,255,0.02)", border: `1px solid ${isCurrent ? `${accent}40` : "rgba(255,255,255,0.04)"}`, transition: "all 0.3s" }}>
                          <div style={{ width: 40, flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? accent : "#8BA7BE" }}>{fmtTime(item.start_time)}</div>
                          </div>
                          <div style={{ width: 2, height: 20, background: isCurrent ? accent : "rgba(255,255,255,0.1)", borderRadius: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 16 }}>{st?.icon || "🎵"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#fff" : "#8BA7BE" }}>{st?.name || stKey}</div>
                          </div>
                          {isCurrent && <div style={{ fontSize: 10, color: accent, fontWeight: 700 }}>СЕЙЧАС</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ScheduleEditor
                    client={client}
                    scheduleItems={scheduleItems}
                    accent={accent}
                    onSave={(newItems: any[]) => {
                      setScheduleItems(newItems);
                      setShowScheduleEditor(false);
                      scheduleRef.current = newItems;
                      checkSchedule();
                    }}
                    onCancel={() => setShowScheduleEditor(false)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. BOX */}
<div style={{ background: "rgba(201,168,76,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 18, overflow: "hidden" }}>
  <button onClick={() => setShowBox(!showBox)} style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18 }}>📦</span>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C" }}>Музыка 24/7 без браузера</div>
        <div style={{ fontSize: 11, color: "#8BA7BE" }}>FonMusic Box — маленькое устройство для заведения</div>
      </div>
    </div>
    <span style={{ color: "#C9A84C", fontSize: 11 }}>{showBox ? "▲" : "▼"}</span>
  </button>
  {showBox && (
    <div style={{ padding: "0 20px 24px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
      {/* Фото устройства */}
      <div style={{ textAlign: "center", margin: "16px 0" }}>
        <img
          src="https://pub-b2c1411547b247808cb42732bb122560.r2.dev/images/fonmusic-box-small.png"
          alt="FonMusic Box"
          style={{ width: "100%", maxWidth: 280, borderRadius: 16, border: "1px solid rgba(201,168,76,0.2)" }}
        />
        <div style={{ fontSize: 10, color: "#4a5a6a", marginTop: 6 }}>FonMusic Box · автономное устройство</div>
      </div>

      {/* 3 преимущества */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {[
          { icon: "📡", title: "Работает круглосуточно", desc: "Музыка играет автоматически без перерывов" },
          { icon: "⚡", title: "Включается сам", desc: "После включения электричества музыка запускается" },
          { icon: "🎛️", title: "Управляется удалённо", desc: "Меняйте атмосферу и расписание из любого места" },
        ].map(f => (
          <div key={f.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#8BA7BE", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#4a5a6a", marginBottom: 14, textAlign: "center" }}>
        Подходит для кафе, магазинов, салонов и фитнес-клубов
      </div>

      <a href="https://t.me/fonmusic2026" target="_blank" style={{ display: "block", textAlign: "center", padding: "13px", background: "#C9A84C", color: "#070B14", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
        Подключить FonMusic Box →
      </a>
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
