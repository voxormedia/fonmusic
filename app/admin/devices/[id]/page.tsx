"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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

function getDeviceStatus(updatedAt: string) {
  const updated = new Date(updatedAt + "Z");
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - updated.getTime()) / 60000);
  const diffSec = Math.floor((now.getTime() - updated.getTime()) / 1000);
  const timeAgo = diffSec < 60 ? `${diffSec} сек назад` : `${diffMin} мин назад`;
  if (diffMin < 2) return { label: "Онлайн", color: "#22C55E", bg: "rgba(34,197,94,0.1)", dot: "🟢", timeAgo };
  if (diffMin < 10) return { label: "Нет связи", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", dot: "🟡", timeAgo };
  return { label: "Недоступно", color: "#EF4444", bg: "rgba(239,68,68,0.1)", dot: "🔴", timeAgo };
}

function getTrackName(track: string): string {
  return track.replace(".mp3", "").replace(/_/g, " ").split("-").slice(1).join(" ").trim() || track.replace(".mp3", "");
}

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
  best_of_radio: "⭐ All Day Mix",
};

const STATIONS = [
  { key: "cozy_coffee", name: "☕ Coffee Mood" },
  { key: "cocktail_dinner", name: "🍽️ Dinner & Lounge" },
  { key: "cool_calm", name: "🎵 Calm Atmosphere" },
  { key: "lounge", name: "🏨 Lounge Flow" },
  { key: "luxury", name: "✨ Premium Mood" },
  { key: "shopping_vibes", name: "🛍️ Retail Energy" },
  { key: "spa_garden", name: "💆 Spa Relax" },
  { key: "workout", name: "💪 Active Energy" },
  { key: "on_the_rocks", name: "🎸 Bar Mood" },
  { key: "best_of_radio", name: "⭐ All Day Mix" },
];

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [commands, setCommands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedStation, setSelectedStation] = useState("cozy_coffee");

  useEffect(() => {
    const authed = sessionStorage.getItem("fonmusic_admin");
    if (!authed) { router.push("/admin"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [dev, cmds] = await Promise.all([
      sb(`device_status?device_id=eq.${deviceId}&select=*`),
      sb(`commands?device_id=eq.${deviceId}&select=*&order=created_at.desc&limit=15`),
    ]);
    if (dev && dev.length > 0) {
      setDevice(dev[0]);
      setSelectedStation(dev[0].current_station || "cozy_coffee");
      const cl = await sb(`clients?device_id=eq.${deviceId}&select=*`);
      if (cl && cl.length > 0) setClient(cl[0]);
    }
    if (cmds) setCommands(cmds);
    setLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const sendCommand = async (command: string, extra?: object) => {
    setSaving(true);
    await sb("commands", {
      method: "POST",
      body: JSON.stringify({
        device_id: deviceId,
        command,
        executed: false,
        ...extra,
      }),
    });
    setSaving(false);
    showSuccess(`Команда "${command}" отправлена!`);
    setTimeout(() => loadData(), 3000);
  };

  const changeStation = async () => {
    setSaving(true);
    await sendCommand("change_station", { genre: selectedStation });
    if (client) {
      await sb(`clients?id=eq.${client.id}`, {
        method: "PATCH",
        body: JSON.stringify({ station_key: selectedStation }),
      });
    }
    setSaving(false);
    showSuccess("Станция изменена!");
  };

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  if (!device) return (
    <main style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#EF4444" }}>Устройство не найдено</div>
    </main>
  );

  const status = getDeviceStatus(device.updated_at);

  return (
    <main style={{ minHeight: "100vh", background: "#0A1628", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <header style={{ padding: "18px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/admin")} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            ← Назад
          </button>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{deviceId}</span>
          <span style={{ fontSize: 12, color: status.color, padding: "3px 10px", background: status.bg, borderRadius: 100 }}>
            {status.dot} {status.label}
          </span>
        </div>
        <button onClick={loadData} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          🔄 Обновить
        </button>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>
        {success && (
          <div style={{ padding: "12px 20px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontSize: 14, color: "#22C55E", marginBottom: 20 }}>
            ✓ {success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* СТАТУС УСТРОЙСТВА */}
          <div style={{ background: "#0D1B2A", border: `1px solid ${status.color}33`, borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📡 Статус устройства</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 16px", background: status.bg, borderRadius: 10 }}>
              <span style={{ fontSize: 24 }}>{status.dot}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: status.color }}>{status.label}</div>
                <div style={{ fontSize: 12, color: "#8BA7BE" }}>Последний сигнал: {status.timeAgo}</div>
              </div>
            </div>
            {[
              { label: "Device ID", value: device.device_id },
              { label: "Кэш", value: `${device.cache_size_mb || 0}MB` },
              { label: "Свободно", value: device.free_storage_mb ? `${Math.round(device.free_storage_mb / 1024)}GB` : "—" },
              { label: "Версия", value: device.app_version || "—" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#8BA7BE" }}>{item.label}</span>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* СЕЙЧАС ИГРАЕТ */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>🎵 Сейчас играет</h2>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C", marginBottom: 6 }}>
                {STATION_NAMES[device.current_station] || device.current_station || "—"}
              </div>
              <div style={{ fontSize: 13, color: "#8BA7BE", fontStyle: "italic" }}>
                {device.current_track ? getTrackName(device.current_track) : "—"}
              </div>
            </div>
            <button onClick={() => sendCommand("next_track")} disabled={saving} style={{ width: "100%", padding: "10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              ⏭ Следующий трек
            </button>
          </div>

          {/* КОМАНДЫ */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>⚡ Управление</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <button onClick={() => sendCommand("next_track")} disabled={saving} style={{ padding: "8px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                ⏭ Следующий
              </button>
              <button onClick={() => sendCommand("refresh_schedule")} disabled={saving} style={{ padding: "8px 14px", background: "rgba(26,107,154,0.2)", border: "1px solid rgba(26,107,154,0.4)", borderRadius: 8, color: "#1A6B9A", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                📅 Обновить расписание
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={selectedStation} onChange={e => setSelectedStation(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }}>
                {STATIONS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
              </select>
              <button onClick={changeStation} disabled={saving} style={{ padding: "8px 16px", background: "#C9A84C", border: "none", borderRadius: 8, color: "#0A1628", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Переключить
              </button>
            </div>
          </div>

          {/* СВЯЗАННЫЙ КЛИЕНТ */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>👤 Связанное заведение</h2>
            {client ? (
              <>
                {[
                  { label: "Заведение", value: client.name },
                  { label: "Телефон", value: client.phone },
                  { label: "Тариф", value: client.tariff },
                  { label: "Статус", value: client.subscription_status },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 12, color: "#8BA7BE" }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.value || "—"}</span>
                  </div>
                ))}
                <button onClick={() => router.push(`/admin/clients/${client.id}`)} style={{ marginTop: 12, width: "100%", padding: "8px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  Открыть клиента →
                </button>
              </>
            ) : (
              <div style={{ color: "#8BA7BE", fontSize: 13 }}>⚪ Клиент не найден</div>
            )}
          </div>

          {/* ИСТОРИЯ КОМАНД */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px", gridColumn: "1 / -1" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📋 История команд</h2>
            {commands.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {commands.map((cmd, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#162435", borderRadius: 8, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{cmd.command}</span>
                      {cmd.genre && <span style={{ fontSize: 11, color: "#8BA7BE" }}>→ {STATION_NAMES[cmd.genre] || cmd.genre}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: cmd.executed ? "#22C55E" : "#F59E0B" }}>
                        {cmd.executed ? "✓ Выполнено" : "⏳ Ожидает"}
                      </span>
                      <span style={{ fontSize: 11, color: "#4a5a6a" }}>
                        {new Date(cmd.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#8BA7BE", fontSize: 13 }}>Команд пока нет</div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
