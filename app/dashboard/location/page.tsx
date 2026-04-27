"use client";
import { useState, useEffect, useRef } from "react";

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

async function sendCommand(deviceId: string, command: string, extra: Record<string, any> = {}) {
  return await sb("commands", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId, command, executed: false, ...extra }),
  });
}

const STATIONS = [
  { key: "cozy_coffee",     label: "Для кофеен",    icon: "☕" },
  { key: "cocktail_dinner", label: "Для ужина",      icon: "🍽" },
  { key: "on_the_rocks",    label: "Для баров",      icon: "🎸" },
  { key: "shopping_vibes",  label: "Для магазинов",  icon: "🛍" },
  { key: "spa_garden",      label: "Для SPA",        icon: "🧘" },
  { key: "workout",         label: "Для фитнеса",    icon: "💪" },
  { key: "lounge",          label: "Лаунж",          icon: "🏨" },
  { key: "cool_calm",       label: "Спокойная",      icon: "🎵" },
  { key: "best_of_radio",   label: "Универсальная",  icon: "⭐" },
];

export default function LocationPage() {
  const [location, setLocation] = useState<any>(null);
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(70);
  const [sending, setSending] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { window.location.href = "/dashboard"; return; }

    const clientId = localStorage.getItem("fonmusic_client_id");
    if (!clientId) { window.location.href = "/login"; return; }

    loadLocation(id, clientId);
  }, []);

  const loadLocation = async (id: string, clientId: string) => {
    const data = await sb(`locations?id=eq.${id}&client_id=eq.${clientId}&select=*`);
    if (!data || data.length === 0) { window.location.href = "/dashboard"; return; }
    const loc = data[0];
    setLocation(loc);
    setLoading(false);

    if (loc.device_id) {
      loadDeviceStatus(loc.device_id);
      pollRef.current = setInterval(() => loadDeviceStatus(loc.device_id), 15000);
    }
  };

  const loadDeviceStatus = async (deviceId: string) => {
    const data = await sb(`device_status?device_id=eq.${deviceId}&select=*`);
    if (data && data.length > 0) {
      const s = data[0];
      setDeviceStatus(s);
      const updatedAt = new Date(s.updated_at);
      const now = new Date();
      const diffMin = (now.getTime() - updatedAt.getTime()) / 60000;
      setIsOnline(diffMin < 5);
      if (s.volume !== undefined) setVolume(s.volume);
    }
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const cmd = async (command: string, extra: Record<string, any> = {}, label?: string) => {
    if (!location?.device_id) return;
    setSending(label || command);
    await sendCommand(location.device_id, command, extra);
    setTimeout(() => setSending(null), 1500);
  };

  const handleVolumeChange = async (val: number) => {
    setVolume(val);
    if (!location?.device_id) return;
    await sendCommand(location.device_id, "set_volume", { volume: val });
  };

  const changeStation = async (stationKey: string) => {
    await cmd("change_station", { genre: stationKey }, stationKey);
    setLocation((prev: any) => ({ ...prev, station_key: stationKey }));
    await sb(`locations?id=eq.${location.id}`, {
      method: "PATCH",
      body: JSON.stringify({ station_key: stationKey }),
    });
  };

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  const currentStation = STATIONS.find(s => s.key === location?.station_key) || STATIONS[0];
  const isBox = location?.device_type === "box";

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>

      {/* NAV */}
      <nav style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/dashboard" style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>← Назад</a>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 18, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#8BA7BE" }}>📦 {location?.name}</div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>

        {/* ТЕКУЩИЙ ТРЕК */}
        <div style={{
          background: "linear-gradient(135deg, #0D1B2A 0%, #162435 100%)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 20, padding: "28px 28px 24px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: "#4a5a6a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            Сейчас играет
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))",
              border: "1px solid rgba(201,168,76,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
            }}>
              {currentStation.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {deviceStatus?.current_track || "—"}
              </div>
              <div style={{ fontSize: 13, color: "#C9A84C" }}>
                Станция: {currentStation.label}
              </div>
            </div>
          </div>

          {/* PLAY / NEXT */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => cmd("next_track", {}, "next")} disabled={sending === "next" || !isBox} style={{
              flex: 1, padding: "14px", borderRadius: 12, cursor: isBox ? "pointer" : "default",
              background: sending === "next" ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C", fontSize: 14, fontWeight: 700, fontFamily: "Georgia, serif",
              opacity: !isBox ? 0.5 : 1,
            }}>
              {sending === "next" ? "⏳" : "⏭"} Следующий трек
            </button>
            <button onClick={() => cmd("restart", {}, "restart")} disabled={sending === "restart" || !isBox} style={{
              padding: "14px 18px", borderRadius: 12, cursor: isBox ? "pointer" : "default",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#EF4444", fontSize: 13, fontFamily: "Georgia, serif",
              opacity: !isBox ? 0.5 : 1,
            }}>
              {sending === "restart" ? "⏳" : "🔄"}
            </button>
          </div>
        </div>

        {/* СТАТУС УСТРОЙСТВА */}
        <div style={{
          background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: "16px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isOnline ? "#22C55E" : "#EF4444",
              boxShadow: isOnline ? "0 0 8px #22C55E" : "none",
            }} />
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>
              📦 FonMusic Box
            </span>
            <span style={{ fontSize: 12, color: isOnline ? "#22C55E" : "#EF4444" }}>
              {isOnline ? "Онлайн" : "Нет соединения"}
            </span>
          </div>
          {deviceStatus && (
            <div style={{ fontSize: 11, color: "#4a5a6a" }}>
              {location?.device_id} · cache: {deviceStatus.cache_size_mb}MB
            </div>
          )}
        </div>

        {/* ГРОМКОСТЬ */}
        <div style={{
          background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>🔊 Громкость</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>{volume}%</div>
          </div>
          <input
            type="range" min={0} max={100} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            onMouseUp={e => handleVolumeChange(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={e => handleVolumeChange(Number((e.target as HTMLInputElement).value))}
            disabled={!isBox}
            style={{ width: "100%", accentColor: "#C9A84C", cursor: isBox ? "pointer" : "default", opacity: !isBox ? 0.5 : 1 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "#4a5a6a" }}>0</span>
            <span style={{ fontSize: 10, color: "#4a5a6a" }}>100</span>
          </div>
        </div>

        {/* СМЕНА АТМОСФЕРЫ */}
        <div style={{
          background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>🎭 Сменить атмосферу</div>
          <div style={{ fontSize: 12, color: "#4a5a6a", marginBottom: 14 }}>Временно меняет музыку. Расписание вернёт своё автоматически.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {STATIONS.map(s => (
              <button key={s.key} onClick={() => changeStation(s.key)} disabled={!isBox && location?.device_type !== "web"} style={{
                padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif",
                background: location?.station_key === s.key ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${location?.station_key === s.key ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: location?.station_key === s.key ? "#C9A84C" : "#8BA7BE",
                fontSize: 12, fontWeight: location?.station_key === s.key ? 700 : 400,
                transition: "all 0.15s",
              }}>
                {sending === s.key ? "⏳" : s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ПРИВЯЗАТЬ УСТРОЙСТВО */}
        {!location?.device_id && (
          <div style={{
            background: "rgba(201,168,76,0.05)", border: "1px dashed rgba(201,168,76,0.3)",
            borderRadius: 16, padding: "20px 24px", marginBottom: 16, textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: 14, color: "#C9A84C", fontWeight: 700, marginBottom: 6 }}>Устройство не привязано</div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 16 }}>
              Введите Device ID с экрана бокса чтобы управлять им
            </div>
            <DeviceBindForm locationId={location?.id} onBind={(deviceId) => setLocation((prev: any) => ({ ...prev, device_id: deviceId }))} />
          </div>
        )}

        {/* НЕТ СОЕДИНЕНИЯ */}
        {!isOnline && location?.device_id && (
          <div style={{
            padding: "14px 20px", background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 700, marginBottom: 4 }}>🔴 Устройство не отвечает</div>
            <div style={{ fontSize: 12, color: "#8BA7BE" }}>
              Проверьте интернет на устройстве. Последний сеанс: {deviceStatus?.updated_at ? new Date(deviceStatus.updated_at).toLocaleString("ru-RU") : "—"}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function DeviceBindForm({ locationId, onBind }: { locationId: string, onBind: (id: string) => void }) {
  const [deviceId, setDeviceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const bind = async () => {
    if (!deviceId.trim()) return;
    setSaving(true);
    setError("");
    const check = await fetch(`${SUPABASE_URL}/rest/v1/device_status?device_id=eq.${deviceId.trim()}&select=device_id`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    });
    const data = await check.json();
    if (!data || data.length === 0) {
      setError("Устройство не найдено. Проверьте ID на экране бокса.");
      setSaving(false);
      return;
    }
    await fetch(`${SUPABASE_URL}/rest/v1/locations?id=eq.${locationId}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json", "Prefer": "return=minimal",
      },
      body: JSON.stringify({ device_id: deviceId.trim() }),
    });
    onBind(deviceId.trim());
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
      <input
        value={deviceId} onChange={e => setDeviceId(e.target.value.toUpperCase())}
        placeholder="TOX3_XXXXXX"
        style={{
          padding: "10px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", width: 160,
          fontFamily: "monospace", letterSpacing: 1,
        }}
      />
      <button onClick={bind} disabled={saving || !deviceId} style={{
        padding: "10px 18px", background: "#C9A84C", border: "none", borderRadius: 10,
        color: "#080C12", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
      }}>
        {saving ? "..." : "Привязать"}
      </button>
      {error && <div style={{ width: "100%", fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</div>}
    </div>
  );
}
