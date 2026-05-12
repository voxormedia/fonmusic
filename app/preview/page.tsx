"use client";
import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
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
  genre_jazz: "Jazz",
  genre_chillout: "Chillout",
  genre_deep_house: "Deep House",
  genre_lofi: "Lo-fi",
  genre_bossa_nova: "Bossa Nova",
  genre_ambient: "Ambient",
  genre_smooth_jazz: "Smooth Jazz",
  genre_pop: "Pop",
};

const STATIONS = [
  { key: "cozy_coffee",    name: "Кофейня",        icon: "☕", desc: "Уютно и спокойно",      color1: "#2D1B0E", color2: "#8B4513", accent: "#C9A84C" },
  { key: "cocktail_dinner",name: "Ресторан / ужин", icon: "🍽️", desc: "Элегантный вечер",     color1: "#0A0F2E", color2: "#1a2a6c", accent: "#3B82F6" },
  { key: "cool_calm",      name: "Тихий фон",      icon: "🎵", desc: "Ненавязчиво",          color1: "#0D1F2D", color2: "#1B4F72", accent: "#60A5FA" },
  { key: "lounge",         name: "Отель / lounge", icon: "🏨", desc: "Лобби и лаунж",         color1: "#1A0A2E", color2: "#4a1a8a", accent: "#A78BFA" },
  { key: "luxury",         name: "Бутик / премиум", icon: "✨", desc: "Стильно и дорого",      color1: "#1A1200", color2: "#4a3500", accent: "#F59E0B" },
  { key: "shopping_vibes", name: "Магазин",        icon: "🛍️", desc: "Энергично и бодро",     color1: "#0A1F2E", color2: "#0e4d6e", accent: "#06B6D4" },
  { key: "spa_garden",     name: "SPA / салон",    icon: "💆", desc: "Мягко и расслабленно",  color1: "#0A1F0F", color2: "#1a4a2a", accent: "#22C55E" },
  { key: "workout",        name: "Фитнес",         icon: "💪", desc: "Максимальная энергия",  color1: "#1F0A0A", color2: "#6a1a1a", accent: "#EF4444" },
  { key: "on_the_rocks",   name: "Бар",            icon: "🎸", desc: "Вечерний драйв",        color1: "#1A0A0F", color2: "#4a1a2a", accent: "#EC4899" },
  { key: "best_of_radio",  name: "Универсальная",  icon: "⭐", desc: "Подходит для всех",    color1: "#0A1020", color2: "#1a2a4a", accent: "#3B82F6" },
];

const BUSINESS_STATION_KEYS = ["cozy_coffee", "cocktail_dinner", "shopping_vibes", "spa_garden", "workout", "on_the_rocks", "lounge", "luxury", "cool_calm", "best_of_radio"];
const DEMO_SCHEDULE_ITEMS = [
  { start_time: "01:00:00", end_time: "09:00:00", stations: { station_key: "luxury" } },
  { start_time: "09:00:00", end_time: "11:00:00", stations: { station_key: "best_of_radio" } },
  { start_time: "11:00:00", end_time: "17:00:00", stations: { station_key: "shopping_vibes" } },
  { start_time: "17:00:00", end_time: "18:00:00", stations: { station_key: "best_of_radio" } },
  { start_time: "18:00:00", end_time: "22:00:00", stations: { station_key: "shopping_vibes" } },
  { start_time: "22:00:00", end_time: "01:00:00", stations: { station_key: "luxury" } },
];

function hasDemoAccess(account: any) {
  if (!account) return false;
  if (account.subscription_status === "demo" || account.plan === "trial") return true;
  const demoUntil = account.demo_expires_at || account.trial_until;
  return Boolean(demoUntil && new Date(demoUntil) > new Date());
}

function hasScheduleAccess(account: any) {
  const plan = account?.plan || "";
  return hasDemoAccess(account) || ["standard", "premium"].includes(plan);
}

const GENRE_PLAYLISTS = [
  { key: "genre_jazz", name: "Jazz", desc: "633 трека", icon: "🎷", color1: "#102033", color2: "#21415F", accent: "#60A5FA" },
  { key: "genre_chillout", name: "Chillout", desc: "682 трека", icon: "🌙", color1: "#101827", color2: "#27385F", accent: "#8BA7BE" },
  { key: "genre_deep_house", name: "Deep House", desc: "161 трек", icon: "🌃", color1: "#111729", color2: "#1E3A5F", accent: "#3B82F6" },
  { key: "genre_lofi", name: "Lo-fi", desc: "247 треков", icon: "🎧", color1: "#172018", color2: "#31523A", accent: "#22C55E" },
  { key: "genre_bossa_nova", name: "Bossa Nova", desc: "59 треков", icon: "🌴", color1: "#1F1A0A", color2: "#5A4315", accent: "#C9A84C" },
  { key: "genre_ambient", name: "Ambient", desc: "469 треков", icon: "☁️", color1: "#0E1D22", color2: "#26525F", accent: "#06B6D4" },
  { key: "genre_smooth_jazz", name: "Smooth Jazz", desc: "252 трека", icon: "🎺", color1: "#1A1200", color2: "#4A3500", accent: "#F59E0B" },
  { key: "genre_pop", name: "Pop", desc: "1802 трека", icon: "✨", color1: "#211026", color2: "#5B2866", accent: "#EC4899" },
];

const GENRE_STATIONS = GENRE_PLAYLISTS.map(g => ({ ...g, desc: "Жанровая подборка" }));
const ALL_STATIONS = [...STATIONS, ...GENRE_STATIONS];
type PlaylistTrack = string | { f: string; folder?: string; url?: string };

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

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

function getTrackFile(t: PlaylistTrack) {
  return typeof t === "string" ? t : t.f || "";
}

function getTrackName(t: PlaylistTrack) {
  const clean = getTrackFile(t).replace(".mp3", "").replace(/_/g, " ");
  const parts = clean.split("-");
  return parts.slice(1).join(" ").trim() || clean;
}

function getArtistName(t: PlaylistTrack) {
  return getTrackFile(t).replace(".mp3", "").replace(/_/g, " ").split("-")[0]?.trim() || "Jamendo";
}

function toMin(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fmtTime(time: string) { return time.slice(0, 5); }

function normalizeScheduleSlots(slots: any[]) {
  const cleanSlots = slots
    .map((slot) => ({
      ...slot,
      start_time: `${(slot.start_time || "00:00").slice(0, 5)}:00`,
      selected_station_key: slot.selected_station_key || slot.stations?.station_key || "best_of_radio",
    }))
    .sort((a, b) => toMin(a.start_time) - toMin(b.start_time));

  return cleanSlots.map((slot, index) => ({
    ...slot,
    end_time: cleanSlots[(index + 1) % cleanSlots.length]?.start_time || "23:59:00",
  }));
}

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

function getCurrentScheduleStation(items: any[], fallbackStation: string) {
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  for (const item of items) {
    const s = toMin(item.start_time), e = toMin(item.end_time);
    const inRange = e < s ? cur >= s || cur < e : cur >= s && cur < e;
    if (inRange && item.stations?.station_key) return item.stations.station_key;
  }
  return fallbackStation;
}

function PreviewScheduleEditor({ scheduleItems, accent, onSave, onCancel }: any) {
  const [slots, setSlots] = useState(normalizeScheduleSlots(scheduleItems.map((item: any) => ({
    ...item,
    selected_station_key: item.stations?.station_key || "best_of_radio",
  }))));
  const [error, setError] = useState("");

  const save = () => {
    const normalizedSlots = normalizeScheduleSlots(slots);
    const uniqueTimes = new Set(normalizedSlots.map((slot: any) => slot.start_time));
    if (uniqueTimes.size !== normalizedSlots.length) {
      setError("Есть одинаковое время. Измените один из слотов.");
      return;
    }

    onSave(normalizedSlots.map((slot: any) => ({
      ...slot,
      stations: { station_key: slot.selected_station_key },
    })));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#8BA7BE" }}>Время и музыка</div>
        <button
          onClick={() => setSlots(normalizeScheduleSlots([...slots, { start_time: "12:00:00", end_time: "13:00:00", selected_station_key: "best_of_radio" }]))}
          style={{ padding: "7px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}
        >
          + Слот
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {slots.map((slot: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="time"
              value={fmtTime(slot.start_time)}
              onChange={e => {
                const updated = [...slots];
                updated[i] = { ...updated[i], start_time: `${e.target.value}:00` };
                setSlots(updated);
              }}
              style={{ width: 92, padding: "8px 10px", background: "#162435", border: `1px solid ${accent}40`, borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, outline: "none", fontFamily: "Georgia, serif" }}
            />
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
            {slots.length > 1 && (
              <button
                onClick={() => setSlots(slots.filter((_: any, index: number) => index !== i))}
                style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#8BA7BE", cursor: "pointer", fontSize: 14 }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} style={{ flex: 1, padding: "11px", background: accent, border: "none", borderRadius: 10, color: "#070B14", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          Применить в демо
        </button>
        <button onClick={onCancel} style={{ padding: "11px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8BA7BE", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          Отмена
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#4a5a6a", marginTop: 8, textAlign: "center" }}>
        Это не меняет музыку в заведении
      </div>
    </div>
  );
}

// ===== ГЛАВНЫЙ ПЛЕЕР =====
export default function PlayerPage() {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [currentStation, setCurrentStation] = useState("best_of_radio");
  const [volume, setVolume] = useState(0.8);
  const [collectionTab, setCollectionTab] = useState<"business" | "genre">("business");
  const [showTimeline, setShowTimeline] = useState(true);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState("");
  const [showBox, setShowBox] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [trackFade, setTrackFade] = useState(1);
  const [eqBars, setEqBars] = useState([4, 8, 12, 7, 10, 5, 9, 6]);
  const [, setNowTick] = useState(Date.now());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scheduleRef = useRef<any[]>([]);
  const lastScheduleStation = useRef<string>("");
  const clientRef = useRef<any>(null);
  const currentStationRef = useRef<string>("best_of_radio");
  const eqAnimRef = useRef<any>(null);

  const stObj = ALL_STATIONS.find(s => s.key === currentStation) || STATIONS[9];
  const accent = stObj.accent;
  const isAutoMode = client?.music_mode !== "manual" && scheduleRef.current.length > 0;
  const canUseSchedule = hasScheduleAccess(client);

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
  const params = new URLSearchParams(window.location.search);
  const locationId = params.get("location_id");
  initClient(clientId, locationId || undefined);
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
      if (clientRef.current?.music_mode !== "manual") checkSchedule();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const initClient = async (clientId: string, locationId?: string) => {
  const data = await sb(`clients?id=eq.${clientId}&select=*`);
  if (!data || data.length === 0) { window.location.href = "/login"; return; }
  const c = data[0];
  if (c.subscription_status === "expired") { window.location.href = "/dashboard"; return; }

  // Загружаем данные точки если есть location_id
  let locationData = null;
  if (locationId) {
    const loc = await sb(`locations?id=eq.${locationId}&client_id=eq.${c.id}&select=*`);
    if (loc && loc.length > 0) locationData = loc[0];
  }

  // Используем настройки точки, но сохраняем id аккаунта клиента.
  const effectiveData = locationData || c;
  const mergedClient = {
    ...c,
    ...effectiveData,
    id: c.id,
    plan: effectiveData.plan || c.plan,
    subscription_status: effectiveData.subscription_status || c.subscription_status,
    demo_expires_at: effectiveData.demo_expires_at || c.demo_expires_at,
    trial_until: effectiveData.trial_until || c.trial_until,
    _locationId: locationData?.id || null,
    location_name: locationData?.name,
  };
  setClient(mergedClient);
  clientRef.current = mergedClient;

// Preview не регистрируется как рабочее устройство и не занимает лимит плеера.

const station = effectiveData.station_key || "best_of_radio";
    setCurrentStation(station);
    currentStationRef.current = station;
    let items: any[] = [];
    const scheduleAllowed = hasScheduleAccess(mergedClient);
    const templateKey = effectiveData.template_key || effectiveData.default_template_key || c.template_key || c.default_template_key || "cafe_standard";
    if (scheduleAllowed) items = await loadScheduleItems(templateKey);
    if (scheduleAllowed && items.length === 0) {
      items = DEMO_SCHEDULE_ITEMS;
      setScheduleItems(items);
      scheduleRef.current = items;
    }
    setLoading(false);
    if (scheduleAllowed && effectiveData.music_mode !== "manual" && items.length > 0) {
  scheduleRef.current = items;
  const scheduleStation = getCurrentScheduleStation(items, station);
  lastScheduleStation.current = scheduleStation;
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
      const res = await fetch(`${BASE_URL}/${encodePath(folder)}/playlist.json`);
      const raw = await res.json();
      const tracks: PlaylistTrack[] = raw
        .map((t: any) => typeof t === "string" ? t : { f: t.f, folder: t.folder, url: t.url })
        .filter((t: PlaylistTrack) => getTrackFile(t));
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled); setTrackIndex(0); setCurrentTrack(shuffled[0] || null);
      setIsLoadingTrack(false);
      setTimeout(() => playTrack(0, shuffled, stationKey), 100);
    } catch { setIsLoadingTrack(false); }
  };

  const playTrack = (index: number, tracks?: PlaylistTrack[], stationKey?: string) => {
    const list = tracks || playlist;
    const station = stationKey || currentStationRef.current;
    if (!list.length) return;
    const track = list[index % list.length];
    const folder = typeof track === "string" ? STATION_FOLDERS[station] || "Best Of Radio" : track.folder || STATION_FOLDERS[station] || "Best Of Radio";
    const url = typeof track === "string" || !track.url ? `${BASE_URL}/${encodePath(folder)}/${encodeURIComponent(getTrackFile(track))}` : track.url;
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
    setIsPlaying(false); setIsLoadingTrack(true);
    setProgress(0); setCurrentTime(0); lastScheduleStation.current = stationKey;
    if (clientRef.current) clientRef.current = { ...clientRef.current, music_mode: "manual", station_key: stationKey };
    setClient((prev: any) => ({ ...prev, music_mode: "manual", station_key: stationKey }));
    const folder = STATION_FOLDERS[stationKey] || "Best Of Radio";
    try {
      const res = await fetch(`${BASE_URL}/${encodePath(folder)}/playlist.json`);
      const raw = await res.json();
      const tracks: PlaylistTrack[] = raw
        .map((t: any) => typeof t === "string" ? t : { f: t.f, folder: t.folder, url: t.url })
        .filter((t: PlaylistTrack) => getTrackFile(t));
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled); setTrackIndex(0); setCurrentTrack(shuffled[0] || null);
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
          <button onClick={async () => {
  localStorage.removeItem("fonmusic_client_id");
  localStorage.removeItem("fonmusic_session_expiry");
  window.location.href = "/login";
}} style={{ fontSize: 12, color: "#8BA7BE", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
  Выйти
</button>
        </div>
      </header>

      <div className="player-shell" style={{ position: "relative", zIndex: 10, maxWidth: 1080, margin: "0 auto", padding: "0 20px 40px" }}>
        <div className="preview-banner" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#22C55E", marginBottom: 4 }}>👁 Режим просмотра</div>
          <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.5 }}>
            Можно слушать станции и изучать расписание. Музыка в заведении не остановится и не изменится.
          </div>
        </div>

        {/* 1. ПЛЕЕР */}
        <div className="player-card" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: `1px solid ${accent}30`, borderRadius: 28, padding: "32px 28px", marginBottom: 12, boxShadow: `0 0 60px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.08)`, transition: "border-color 1s, box-shadow 1s" }}>
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
      Предпросмотр · в заведении ничего не изменилось
    </div>
    <button onClick={async () => {
      if (clientRef.current) clientRef.current = { ...clientRef.current, music_mode: "automatic" };
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

        {/* 2. МУЗЫКАЛЬНЫЕ ПОДБОРКИ */}
        <div className="collections-card" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>🎛️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Музыкальные подборки</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>В preview переключение работает только здесь и не меняет заведение.</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10, padding: 4, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
              <button onClick={() => setCollectionTab("business")} style={{ padding: "9px 10px", border: "none", borderRadius: 9, cursor: "pointer", background: collectionTab === "business" ? `${accent}22` : "transparent", color: collectionTab === "business" ? accent : "#8BA7BE", fontSize: 12, fontWeight: 800, fontFamily: "Georgia, serif" }}>По заведению</button>
              <button onClick={() => setCollectionTab("genre")} style={{ padding: "9px 10px", border: "none", borderRadius: 9, cursor: "pointer", background: collectionTab === "genre" ? `${accent}22` : "transparent", color: collectionTab === "genre" ? accent : "#8BA7BE", fontSize: 12, fontWeight: 800, fontFamily: "Georgia, serif" }}>По жанру</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              {collectionTab === "business" && BUSINESS_STATION_KEYS.map(key => {
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
              {collectionTab === "genre" && GENRE_PLAYLISTS.map(g => (
                <button key={g.key} onClick={() => switchStation(g.key)} style={{ padding: "12px", borderRadius: 12, cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "left", background: currentStation === g.key ? `${g.accent}15` : "rgba(255,255,255,0.03)", border: `1px solid ${currentStation === g.key ? `${g.accent}40` : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{g.icon}</span>
                    <div style={{ fontSize: 12, fontWeight: currentStation === g.key ? 800 : 700, color: currentStation === g.key ? g.accent : "#fff" }}>{g.name}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#4a5a6a" }}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. ТАЙМЛАЙН + РЕДАКТОР */}
        {canUseSchedule && scheduleItems.length > 0 && (
          <div className="schedule-card" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Расписание</div>
                </div>
              </div>
              <span style={{ color: "#8BA7BE", fontSize: 12, fontWeight: 700 }}>Просмотр</span>
            </div>

            {showTimeline && (
  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ fontSize: 13, color: "#8BA7BE" }}>{showScheduleEditor ? "Демо-редактор" : "Сегодня"}</div>
      <button onClick={() => setShowScheduleEditor(!showScheduleEditor)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, color: "#fff", padding: "6px 12px", flexShrink: 0, cursor: "pointer", fontFamily: "Georgia, serif" }}>
        {showScheduleEditor ? "Готово" : "Изменить"}
      </button>
    </div>

                {scheduleNotice && (
                  <div style={{ fontSize: 12, color: "#22C55E", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 10, padding: "9px 10px", marginBottom: 10 }}>
                    {scheduleNotice}
                  </div>
                )}

                {!showScheduleEditor ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {scheduleItems.map((item, i) => {
                    const stKey = item.stations?.station_key;
                    const st = STATIONS.find(s => s.key === stKey);
                    const isCurrent = currentSlot === item;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: isCurrent ? `${accent}12` : "rgba(255,255,255,0.02)", border: `1px solid ${isCurrent ? `${accent}40` : "rgba(255,255,255,0.04)"}`, transition: "all 0.3s" }}>
                        <div style={{ width: 44, flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isCurrent ? accent : "#8BA7BE" }}>{fmtTime(item.start_time)}</div>
                        </div>
                        <div style={{ width: 2, height: 20, background: isCurrent ? accent : "rgba(255,255,255,0.1)", borderRadius: 1, flexShrink: 0 }} />
                        <span style={{ fontSize: 16 }}>{st?.icon || "🎵"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#fff" : "#8BA7BE" }}>{st?.name || stKey}</div>
                        </div>
                        {isCurrent && <div style={{ fontSize: 11, color: accent, fontWeight: 700 }}>Сейчас</div>}
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <PreviewScheduleEditor
                    scheduleItems={scheduleItems}
                    accent={accent}
                    onSave={(updatedItems: any[]) => {
                      setScheduleItems(updatedItems);
                      scheduleRef.current = updatedItems;
                      setScheduleNotice("Изменения применены в демо-режиме");
                      setShowScheduleEditor(false);
                      if (clientRef.current?.music_mode !== "manual") checkScheduleWithItems(updatedItems, currentStationRef.current);
                    }}
                    onCancel={() => setShowScheduleEditor(false)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {!canUseSchedule && (
          <div className="schedule-card" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "16px 20px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Автоматическое расписание</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>Доступно в тарифе <span style={{ color: "#C9A84C" }}>Стандарт</span> и выше</div>
              </div>
              <a href="/pricing" style={{ fontSize: 11, color: "#C9A84C", textDecoration: "none", padding: "5px 12px", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8 }}>Перейти →</a>
            </div>
          </div>
        )}

    {/* 4. BOX */}
<div className="box-card" style={{ background: "rgba(201,168,76,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 18, overflow: "hidden" }}>
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
        750 000 сум · 500 000 сум при оплате за 3 месяца · 0 сум при оплате за 12 месяцев
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
        .player-shell {
          display: grid;
          grid-template-columns: minmax(0, 600px) minmax(320px, 420px);
          gap: 14px;
          align-items: start;
        }
        .preview-banner { grid-column: 1 / -1; }
        .player-card, .collections-card, .box-card { grid-column: 1; }
        .schedule-card {
          grid-column: 2;
          grid-row: 2 / span 2;
          position: sticky;
          top: 18px;
        }
        @media (max-width: 980px) {
          .player-shell { display: block; max-width: 600px !important; }
          .schedule-card { position: static; }
        }
      `}</style>
    </main>
  );
}
