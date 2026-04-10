"use client";
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ovafknvfckdmatrnlecr.supabase.co";
const SUPABASE_KEY = "sb_publishable_sMrkdTU705Zgw9-Sc12-Ww_XDrl1ASP";

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

const STATION_LABELS: Record<string, { name: string, icon: string, desc: string }> = {
  cozy_coffee:    { name: "Музыка для кофеен",    icon: "☕", desc: "Уютная и спокойная" },
  cocktail_dinner:{ name: "Музыка для ужина",     icon: "🍽️", desc: "Элегантная атмосфера" },
  cool_calm:      { name: "Спокойная атмосфера",  icon: "🎵", desc: "Тихо и расслабленно" },
  lounge:         { name: "Лаунж атмосфера",      icon: "🏨", desc: "Для лобби и лаунжа" },
  luxury:         { name: "Премиальная атмосфера",icon: "✨", desc: "Роскошь и стиль" },
  shopping_vibes: { name: "Музыка для магазинов", icon: "🛍️", desc: "Энергичная и бодрая" },
  spa_garden:     { name: "Музыка для SPA",       icon: "💆", desc: "Расслабляющая" },
  workout:        { name: "Музыка для фитнеса",   icon: "💪", desc: "Максимальная энергия" },
  on_the_rocks:   { name: "Музыка для баров",     icon: "🎸", desc: "Вечерняя атмосфера" },
  best_of_radio:  { name: "Универсальная музыка", icon: "⭐", desc: "Подходит для всех" },
};

function getStationLabel(key: string) {
  return STATION_LABELS[key] || { name: key, icon: "🎵", desc: "" };
}

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getTrackName(track: string): string {
  return track.replace(".mp3", "").replace(/_/g, " ").split("-").slice(1).join(" ").trim() || track.replace(".mp3", "");
}

function getDeviceStatus(updatedAt: string) {
  const updated = new Date(updatedAt + "Z");
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - updated.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const timeAgo = diffSec < 60 ? `${diffSec} сек назад` : `${diffMin} мин назад`;
  if (diffMin < 2) return { level: "online", label: "Онлайн", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", timeAgo };
  if (diffMin < 10) return { level: "noconn", label: "Нет связи", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", timeAgo };
  return { level: "unavailable", label: "Недоступно", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", timeAgo };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function getNextChangeMinutes(scheduleItems: any[]): number | null {
  if (!scheduleItems.length) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  for (const item of scheduleItems) {
    const end = timeToMinutes(item.end_time);
    const start = timeToMinutes(item.start_time);
    const inRange = end < start ? cur >= start || cur < end : cur >= start && cur < end;
    if (inRange) {
      const diff = end > cur ? end - cur : (24 * 60 - cur) + end;
      return diff;
    }
  }
  return null;
}

// ===== ЭКРАН ВЫБОРА СПОСОБА ВОСПРОИЗВЕДЕНИЯ =====
function PlaybackSetupScreen({ client, onSelect }: { client: any, onSelect: (target: string) => void }) {
  const [selecting, setSelecting] = useState(false);

  const select = async (target: string) => {
    setSelecting(true);
    await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${client.id}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({ playback_target: target }),
    });
    setSelecting(false);
    onSelect(target);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Лого */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 5, height: 24, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
            Добро пожаловать, {client.name}! 🎵
          </h1>
          <p style={{ fontSize: 15, color: "#8BA7BE", lineHeight: 1.7 }}>
            Как вы будете воспроизводить музыку в заведении?
          </p>
        </div>

        {/* Варианты */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>

          {/* Веб-плеер */}
          <button onClick={() => select("web")} disabled={selecting} style={{
            padding: "24px", background: "#0D1B2A", border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 20, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                🎧
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Через браузер</div>
                <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.6, marginBottom: 12 }}>
                  Подходит для компьютера, ноутбука или планшета. Музыка играет прямо в браузере.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Бесплатно", "Сразу готово", "Любое устройство"].map(f => (
                    <span key={f} style={{ fontSize: 11, padding: "3px 10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 100, color: "#3B82F6" }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#3B82F6", borderRadius: 10, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
              ▶ Запустить плеер в браузере
            </div>
          </button>

          {/* FonMusic Box */}
          <button onClick={() => select("box")} disabled={selecting} style={{
            padding: "24px", background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 20, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                📦
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  Через FonMusic Box
                  <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 8px", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, color: "#C9A84C" }}>РЕКОМЕНДУЕМ</span>
                </div>
                <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.6, marginBottom: 12 }}>
                  Небольшая приставка для стабильной работы 24/7. Подключается к аудиосистеме и работает автоматически.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Работает 24/7", "Автозапуск", "Без компьютера", "Стабильно"].map(f => (
                    <span key={f} style={{ fontSize: 11, padding: "3px 10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 100, color: "#C9A84C" }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#C9A84C" }}>
              📦 Подключить FonMusic Box
            </div>
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#4a5a6a" }}>
          Вы сможете изменить способ воспроизведения в настройках кабинета
        </div>
      </div>
    </main>
  );
}

function PaywallScreen() {
  return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⏰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Тестовый период завершён</h1>
        <p style={{ fontSize: 15, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 32 }}>
          Чтобы музыка продолжала играть в вашем заведении, подключите подписку FonMusic
        </p>
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: 28, marginBottom: 24 }}>
          {["10 музыкальных атмосфер", "Автоматическое расписание", "Android TV приставка", "Официальный сертификат", "Личный кабинет"].map(f => (
            <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "#C9A84C" }}>✓</span>
              <span style={{ fontSize: 14, color: "#E8EFF5" }}>{f}</span>
            </div>
          ))}
        </div>
        <a href="/#trial" style={{ display: "block", padding: "18px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", marginBottom: 16 }}>
          Оформить подписку →
        </a>
        <a href="tel:+998994100910" style={{ display: "block", padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8BA7BE", borderRadius: 12, fontSize: 14, textDecoration: "none" }}>
          Позвонить нам: +998 99 410 09 10
        </a>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<"loading" | "setup" | "dashboard" | "paywall">("loading");
  const [client, setClient] = useState<any>(null);
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<any[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [success, setSuccess] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [currentMood, setCurrentMood] = useState<"calm" | "standard" | "energetic">("standard");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    if (!clientId) { window.location.href = "/login"; return; }
    initClient(clientId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const initClient = async (clientId: string) => {
    const data = await sb(`clients?id=eq.${clientId}&select=*`);
    if (!data || data.length === 0) { window.location.href = "/login"; return; }
    const c = data[0];
    setClient(c);

    if (c.subscription_status === "expired") { setScreen("paywall"); return; }
    if (c.subscription_status === "demo" && c.demo_expires_at) {
      const days = getDaysLeft(c.demo_expires_at);
      setDaysLeft(days);
      if (days <= 0) {
        await sb(`clients?id=eq.${c.id}`, { method: "PATCH", body: JSON.stringify({ subscription_status: "expired" }) });
        setScreen("paywall"); return;
      }
    }

    // Показываем экран выбора если playback_target не выбран
    if (!c.playback_target) {
      setScreen("setup"); return;
    }

    // Если web плеер — редиректим на /player
if (c.playback_target === "web") {
  window.location.href = "/player";
  return;
}
setScreen("dashboard");
loadData(c);
if (c.device_id) loadDeviceStatus(c);
  };

  const handlePlaybackSelect = (target: string) => {
    const updated = { ...client, playback_target: target };
    setClient(updated);
    // Если выбрал веб — сразу в плеер
    if (target === "web") {
      window.location.href = "/player";
      return;
    }
    setScreen("dashboard");
    loadData(updated);
    if (updated.device_id) loadDeviceStatus(updated);
  };

  useEffect(() => {
    if (screen === "dashboard" && client) {
      const interval = setInterval(() => loadDeviceStatus(client), 30000);
      return () => clearInterval(interval);
    }
  }, [screen, client]);

  const loadData = async (c?: any) => {
    const cl = c || client;
    const [s, tmpl] = await Promise.all([
      sb("stations?is_active=eq.true&select=*&order=display_name"),
      sb("schedule_templates?select=*&order=template_name"),
    ]);
    if (s) setStations(s);
    if (tmpl) setScheduleTemplates(tmpl);
    if (cl?.template_key) loadScheduleItems(cl.template_key);
  };

  const loadScheduleItems = async (templateKey: string) => {
    const tmpl = await sb(`schedule_templates?template_key=eq.${templateKey}&select=id`);
    if (!tmpl || tmpl.length === 0) return;
    const items = await sb(`schedule_template_items?template_id=eq.${tmpl[0].id}&select=start_time,end_time,stations(station_key)&order=start_time`);
    if (items) setScheduleItems(items);
  };

  const loadDeviceStatus = async (cl?: any) => {
    const c = cl || client;
    if (!c?.device_id) return;
    const [data, clientData] = await Promise.all([
      sb(`device_status?device_id=eq.${c.device_id}&select=*`),
      sb(`clients?id=eq.${c.id}&select=station_key,music_mode,template_key`),
    ]);
    if (data && data.length > 0) setDeviceStatus(data[0]);
    if (clientData && clientData.length > 0) setClient((prev: any) => ({ ...prev, ...clientData[0] }));
  };

  const logout = () => { localStorage.removeItem("fonmusic_client_id"); window.location.href = "/login"; };

  const sendCommand = async (command: string, extra?: object) => {
    if (!client?.device_id) return;
    await sb("commands", { method: "POST", body: JSON.stringify({ device_id: client.device_id, command, genre: client.station_key, executed: false, ...extra }) });
  };

  const switchMode = async (mode: "automatic" | "manual") => {
    if (!client || saving) return;
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ music_mode: mode }) });
    if (mode === "automatic" && client.template_key) await sendCommand("refresh_schedule");
    setClient({ ...client, music_mode: mode });
    setSaving(false);
    setSuccess(mode === "automatic" ? "Автоматический режим включён" : "Ручной режим включён");
    setTimeout(() => setSuccess(""), 3000);
  };

  const changeStation = async (stationKey: string) => {
    if (!client || saving) return;
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ station_key: stationKey, music_mode: "manual" }) });
    await sendCommand("change_station", { genre: stationKey });
    setClient({ ...client, station_key: stationKey, music_mode: "manual" });
    setSaving(false);
    setSuccess(`${getStationLabel(stationKey).name} — включена`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const nextTrack = async () => {
    if (!client || saving) return;
    setSaving(true);
    await sendCommand("next_track");
    setSaving(false);
    setSuccess("Переключаем трек...");
    setTimeout(() => { setSuccess(""); loadDeviceStatus(); }, 5000);
  };

  const restartMusic = async () => {
    if (!client || saving) return;
    setSaving(true);
    await sendCommand("restart");
    setSaving(false);
    setSuccess("Перезапускаем бокс...");
    setTimeout(() => { setSuccess(""); loadDeviceStatus(); }, 8000);
  };

  const setMood = async (mood: "calm" | "standard" | "energetic") => {
    if (!client || saving) return;
    setSaving(true);
    setCurrentMood(mood);
    if (mood === "standard") {
      await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ music_mode: "automatic" }) });
      if (client.template_key) await sendCommand("refresh_schedule");
      setClient({ ...client, music_mode: "automatic" });
      setSuccess("Стандартная атмосфера — расписание активно");
    } else {
      const stationKey = mood === "calm" ? "cool_calm" : "shopping_vibes";
      await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ station_key: stationKey, music_mode: "manual" }) });
      await sendCommand("change_station", { genre: stationKey });
      setClient({ ...client, station_key: stationKey, music_mode: "manual" });
      setSuccess(mood === "calm" ? "Спокойная атмосфера включена" : "Энергичная атмосфера включена");
    }
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const changeSchedule = async (templateKey: string) => {
    if (!client || savingSchedule) return;
    setSavingSchedule(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ template_key: templateKey, music_mode: "automatic" }) });
    await sendCommand("refresh_schedule");
    setClient({ ...client, template_key: templateKey, music_mode: "automatic" });
    await loadScheduleItems(templateKey);
    setSavingSchedule(false);
    setSuccess("Расписание обновлено!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) return;
    setPasswordError("");
    if (oldPassword !== client.password) { setPasswordError("Неверный текущий пароль"); return; }
    if (newPassword.length < 4) { setPasswordError("Пароль должен быть не менее 4 символов"); return; }
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ password: newPassword }) });
    setClient({ ...client, password: newPassword });
    setSaving(false);
    setPasswordSuccess("Пароль успешно изменён!");
    setOldPassword(""); setNewPassword("");
    setTimeout(() => { setPasswordSuccess(""); setShowChangePassword(false); }, 2000);
  };

  const getCurrentScheduleSlot = () => {
    if (!scheduleItems.length) return null;
    const cur = now.getHours() * 60 + now.getMinutes();
    for (const item of scheduleItems) {
      const start = timeToMinutes(item.start_time);
      const end = timeToMinutes(item.end_time);
      const inRange = end < start ? cur >= start || cur < end : cur >= start && cur < end;
      if (inRange) return item;
    }
    return null;
  };

  if (screen === "loading") return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  if (screen === "paywall") return <PaywallScreen />;

  if (screen === "setup") return <PlaybackSetupScreen client={client} onSelect={handlePlaybackSelect} />;

  const isAutoMode = client?.music_mode === "automatic";
  const isBoxMode = client?.playback_target === "box";
  const currentSlot = getCurrentScheduleSlot();
  const nextChangeMin = getNextChangeMinutes(scheduleItems);
  const currentStationLabel = getStationLabel(deviceStatus?.current_station || client?.station_key || "best_of_radio");

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>

      {/* NAV */}
      <nav style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <a href="/" style={{ fontSize: 17, fontWeight: 700, color: "#fff", textDecoration: "none" }}>FonMusic</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {daysLeft !== null && daysLeft > 0 && (
            <div style={{ fontSize: 12, color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", padding: "4px 10px", borderRadius: 100 }}>
              Демо: {daysLeft} дн.
            </div>
          )}
          <div style={{ fontSize: 13, color: "#8BA7BE" }}>👤 {client?.name}</div>
          <button onClick={logout} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Выйти
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>

        {success && (
          <div style={{ padding: "12px 20px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontSize: 14, color: "#22C55E", marginBottom: 20 }}>
            ✓ {success}
          </div>
        )}

        {daysLeft !== null && daysLeft > 0 && (
          <div style={{ padding: "16px 20px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 14, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#C9A84C" }}>🕐 Тестовый период: осталось <strong>{daysLeft} дней</strong></div>
            <a href="/#trial" style={{ fontSize: 13, color: "#080C12", background: "#C9A84C", padding: "7px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Подключить →</a>
          </div>
        )}

        {/* 1. СТАТУС + СЕЙЧАС ИГРАЕТ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: 2, marginBottom: 8 }}>▶ СЕЙЧАС ИГРАЕТ</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {currentStationLabel.icon} {currentStationLabel.name}
              </div>
              <div style={{ fontSize: 13, color: "#8BA7BE", fontStyle: "italic" }}>
                {deviceStatus?.current_track ? getTrackName(deviceStatus.current_track) : "—"}
              </div>
            </div>
            {isBoxMode && deviceStatus && (() => {
              const status = getDeviceStatus(deviceStatus.updated_at);
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div style={{ padding: "4px 12px", background: status.bg, border: `1px solid ${status.border}`, borderRadius: 100 }}>
                    <span style={{ fontSize: 12, color: status.color }}>{status.level === "online" ? "🟢" : status.level === "noconn" ? "🟡" : "🔴"} FonMusic Box · {status.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#4a5a6a" }}>{status.timeAgo}</span>
                </div>
              );
            })()}
            {!isBoxMode && (
              <div style={{ padding: "4px 12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 100 }}>
                <span style={{ fontSize: 12, color: "#3B82F6" }}>🌐 Веб-плеер</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: isBoxMode ? 16 : 0 }}>
            <button onClick={nextTrack} disabled={saving} style={{ padding: "10px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              ⏭ Следующий трек
            </button>
            {isBoxMode ? (
              <button onClick={restartMusic} disabled={saving} style={{ padding: "10px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#EF4444", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                🔄 Перезапустить бокс
              </button>
            ) : (
              <a href="/player" style={{ padding: "10px 18px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, color: "#3B82F6", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                🎧 Открыть плеер
              </a>
            )}
            {/* Переключить режим воспроизведения */}
          </div>
          {/* Громкость — только для бокса */}
          {isBoxMode && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: "#8BA7BE", flexShrink: 0 }}>🔈</span>
              <input type="range" min={0} max={100} step={5} defaultValue={70}
                onMouseUp={async e => {
                  const vol = parseInt((e.target as HTMLInputElement).value);
                  await sendCommand("set_volume", { volume: vol });
                  setSuccess(`Громкость: ${vol}%`);
                  setTimeout(() => setSuccess(""), 2000);
                }}
                onTouchEnd={async e => {
                  const vol = parseInt((e.target as HTMLInputElement).value);
                  await sendCommand("set_volume", { volume: vol });
                }}
                style={{ flex: 1, accentColor: "#C9A84C", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "#C9A84C", flexShrink: 0 }}>🔊</span>
              <span style={{ fontSize: 12, color: "#8BA7BE", flexShrink: 0 }}>Громкость бокса</span>
            </div>
          )}
        </div>

        {/* 2. РЕЖИМ МУЗЫКИ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🎛️ Режим музыки</h2>
          <p style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 16 }}>
            {isAutoMode ? "Музыка меняется автоматически по расписанию" : "Вы управляете музыкой вручную"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => switchMode("automatic")} style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif",
              background: isAutoMode ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
              border: `${isAutoMode ? "2px" : "1px"} solid ${isAutoMode ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: isAutoMode ? "#22C55E" : "#333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isAutoMode && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isAutoMode ? "#22C55E" : "#fff" }}>Автоматически</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>По расписанию</div>
              </div>
            </button>
            <button onClick={() => switchMode("manual")} style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif",
              background: !isAutoMode ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
              border: `${!isAutoMode ? "2px" : "1px"} solid ${!isAutoMode ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: !isAutoMode ? "#3B82F6" : "#333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {!isAutoMode && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: !isAutoMode ? "#3B82F6" : "#fff" }}>Ручной</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>Выбор атмосферы</div>
              </div>
            </button>
          </div>
        </div>
  
        {/* 4. МУЗЫКА СЕГОДНЯ */}
        {isAutoMode && scheduleItems.length > 0 && (
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>📅 Музыка сегодня</h2>
              {nextChangeMin !== null && (
                <div style={{ fontSize: 12, color: "#C9A84C", background: "rgba(201,168,76,0.1)", padding: "4px 10px", borderRadius: 100 }}>
                  Следующая смена через {nextChangeMin >= 60 ? `${Math.floor(nextChangeMin / 60)}ч ${nextChangeMin % 60}м` : `${nextChangeMin}м`}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {scheduleItems.map((item, i) => {
                const stationKey = item.stations?.station_key;
                const label = getStationLabel(stationKey);
                const isCurrent = currentSlot === item;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
                    background: isCurrent ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isCurrent ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.04)"}`,
                  }}>
                    <div style={{ width: 48, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? "#C9A84C" : "#8BA7BE" }}>{formatTime(item.start_time)}</div>
                    </div>
                    <div style={{ width: 2, height: 24, background: isCurrent ? "#C9A84C" : "rgba(255,255,255,0.1)", borderRadius: 1, flexShrink: 0 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <span style={{ fontSize: 16 }}>{label.icon}</span>
                      <div style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#fff" : "#8BA7BE" }}>{label.name}</div>
                    </div>
                    {isCurrent && <div style={{ fontSize: 10, color: "#C9A84C", fontWeight: 700 }}>СЕЙЧАС</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. БЫСТРАЯ СМЕНА АТМОСФЕРЫ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>✨ Быстрая смена атмосферы</h2>
          <p style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 16 }}>Изменить настроение заведения прямо сейчас</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "calm", label: "Спокойно", icon: "🌿", color: "#22C55E", desc: "Тихо и уютно" },
              { key: "standard", label: "Стандарт", icon: "🎵", color: "#C9A84C", desc: "По расписанию" },
              { key: "energetic", label: "Энергично", icon: "⚡", color: "#EF4444", desc: "Живо и бодро" },
            ].map(mood => (
              <button key={mood.key} onClick={() => setMood(mood.key as any)} disabled={saving} style={{
                flex: 1, padding: "14px 10px", borderRadius: 12, cursor: "pointer", fontFamily: "Georgia, serif", textAlign: "center",
                background: currentMood === mood.key ? `rgba(${mood.key === "calm" ? "34,197,94" : mood.key === "standard" ? "201,168,76" : "239,68,68"},0.12)` : "rgba(255,255,255,0.03)",
                border: `${currentMood === mood.key ? "2px" : "1px"} solid ${currentMood === mood.key ? `rgba(${mood.key === "calm" ? "34,197,94" : mood.key === "standard" ? "201,168,76" : "239,68,68"},0.5)` : "rgba(255,255,255,0.08)"}`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{mood.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: currentMood === mood.key ? mood.color : "#fff", marginBottom: 2 }}>{mood.label}</div>
                <div style={{ fontSize: 10, color: "#8BA7BE" }}>{mood.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. МУЗЫКА ПО АТМОСФЕРЕ (ручной режим) */}
        {!isAutoMode && (
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🎵 Музыка по атмосфере</h2>
            <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Выберите подходящую музыку для вашего заведения</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {stations.map(s => {
                const label = getStationLabel(s.station_key);
                const isActive = client?.station_key === s.station_key;
                return (
                  <button key={s.station_key} onClick={() => changeStation(s.station_key)} disabled={saving} style={{
                    padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif",
                    background: isActive ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                    border: `${isActive ? "2px" : "1px"} solid ${isActive ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{label.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#3B82F6" : "#fff" }}>{label.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8BA7BE", lineHeight: 1.4 }}>{label.desc}</div>
                    {isActive && (
                      <div style={{ marginTop: 8, fontSize: 10, color: "#3B82F6", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3B82F6", display: "inline-block" }} />
                        ИГРАЕТ СЕЙЧАС
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. ПОДДЕРЖКА */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>💬 Поддержка</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Если возникли вопросы — мы на связи</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="https://t.me/fonmusic2026" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: "rgba(0,136,204,0.1)", border: "1px solid rgba(0,136,204,0.3)", borderRadius: 10, color: "#0088CC", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              ✈ Telegram
            </a>
            <a href="https://wa.me/998994100910" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, color: "#25D166", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              💬 WhatsApp
            </a>
            <a href="tel:+998994100910" style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8BA7BE", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              📞 +998 99 410 09 10
            </a>
          </div>
        </div>

        {/* 8. СМЕНА ПАРОЛЯ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showChangePassword ? 16 : 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>🔑 Пароль</h2>
            <button onClick={() => { setShowChangePassword(!showChangePassword); setPasswordError(""); }} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              {showChangePassword ? "Отмена" : "Изменить пароль"}
            </button>
          </div>
          {showChangePassword && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Текущий пароль"
                style={{ padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Новый пароль"
                style={{ padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              {passwordError && <div style={{ fontSize: 13, color: "#EF4444" }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ fontSize: 13, color: "#22C55E" }}>{passwordSuccess}</div>}
              <button onClick={changePassword} disabled={saving} style={{ padding: "12px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Сохранить пароль
              </button>
            </div>
          )}
        </div>

        {/* 9. СЕРТИФИКАТ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>📄 Сертификат</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Официальный сертификат лицензии на музыку</p>
          <button onClick={() => window.print()} style={{ padding: "12px 20px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            🖨️ Распечатать сертификат
          </button>
        </div>

      </div>
    </main>
  );
}
