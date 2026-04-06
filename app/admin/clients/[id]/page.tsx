"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
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

const STATUS_COLORS: Record<string, { color: string, bg: string, label: string }> = {
  active: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", label: "Активный" },
  demo: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Демо" },
  expired: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Истёк" },
};

const STATIONS = [
  { key: "best_of_radio", name: "⭐ All Day Mix" },
  { key: "cozy_coffee", name: "☕ Coffee Mood" },
  { key: "cocktail_dinner", name: "🍽️ Dinner & Lounge" },
  { key: "cool_calm", name: "🎵 Calm Atmosphere" },
  { key: "lounge", name: "🏨 Lounge Flow" },
  { key: "luxury", name: "✨ Premium Mood" },
  { key: "shopping_vibes", name: "🛍️ Retail Energy" },
  { key: "spa_garden", name: "💆 Spa Relax" },
  { key: "workout", name: "💪 Active Energy" },
  { key: "on_the_rocks", name: "🎸 Bar Mood" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#162435",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  flex: 1, padding: "8px 12px", background: "#162435",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
  color: "#fff", fontSize: 12, outline: "none",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [commands, setCommands] = useState<any[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "", password: "", device_id: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const authed = sessionStorage.getItem("fonmusic_admin");
    if (!authed) { router.push("/admin"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [c, tmpl] = await Promise.all([
      sb(`clients?id=eq.${params.id}&select=*`),
      sb("schedule_templates?select=*&order=template_name"),
    ]);
    if (tmpl) setScheduleTemplates(tmpl);
    if (c && c.length > 0) {
      const cl = c[0];
      setClient(cl);
      setNotes(cl.notes || "");
      setSelectedStation(cl.station_key || "best_of_radio");
      setSelectedTemplate(cl.template_key || "");
      setEditData({
        name: cl.name || "",
        phone: cl.phone || "",
        password: cl.password || "",
        device_id: cl.device_id || "",
      });
      if (cl.device_id) {
        const [dev, cmds] = await Promise.all([
          sb(`device_status?device_id=eq.${cl.device_id}&select=*`),
          sb(`commands?device_id=eq.${cl.device_id}&select=*&order=created_at.desc&limit=10`),
        ]);
        if (dev && dev.length > 0) setDeviceStatus(dev[0]);
        if (cmds) setCommands(cmds);
      }
    }
    setLoading(false);
  };

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const saveEdit = async () => {
    if (!client || !editData.name) return;
    setSavingEdit(true);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: editData.name,
        phone: editData.phone || null,
        password: editData.password || client.password,
        device_id: editData.device_id || null,
      }),
    });
    await loadData();
    setSavingEdit(false);
    setShowEdit(false);
    showSuccessMsg("Данные клиента обновлены!");
  };

  const extendDemo = async (days: number) => {
    if (!client) return;
    setSaving(true);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ demo_expires_at: newDate.toISOString(), subscription_status: "demo" }),
    });
    await loadData();
    setSaving(false);
    showSuccessMsg(`Демо продлено на ${days} дней!`);
  };

  const setStatus = async (status: string) => {
    if (!client) return;
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ subscription_status: status }),
    });
    await loadData();
    setSaving(false);
    showSuccessMsg("Статус обновлён!");
  };

  const changeStation = async () => {
    if (!client || !selectedStation) return;
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ station_key: selectedStation, music_mode: "manual" }),
    });
    if (client.device_id) {
      await sb("commands", {
        method: "POST",
        body: JSON.stringify({ device_id: client.device_id, command: "change_station", genre: selectedStation, executed: false }),
      });
    }
    await loadData();
    setSaving(false);
    showSuccessMsg("Станция изменена!");
  };

  const changeSchedule = async () => {
    if (!client || !selectedTemplate) return;
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ template_key: selectedTemplate, music_mode: "automatic" }),
    });
    if (client.device_id) {
      await sb("commands", {
        method: "POST",
        body: JSON.stringify({ device_id: client.device_id, command: "refresh_schedule", executed: false }),
      });
    }
    await loadData();
    setSaving(false);
    showSuccessMsg("Расписание изменено!");
  };

  const sendCommand = async (command: string) => {
    if (!client?.device_id) return;
    setSaving(true);
    await sb("commands", {
      method: "POST",
      body: JSON.stringify({ device_id: client.device_id, command, executed: false }),
    });
    setSaving(false);
    showSuccessMsg(`Команда ${command} отправлена!`);
    setTimeout(() => loadData(), 3000);
  };

  const saveNotes = async () => {
    if (!client) return;
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ notes }) });
    setSaving(false);
    showSuccessMsg("Заметки сохранены!");
  };

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  if (!client) return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#EF4444" }}>Клиент не найден</div>
    </main>
  );

  const st = STATUS_COLORS[client.subscription_status] || STATUS_COLORS.expired;
  const devStatus = deviceStatus ? getDeviceStatus(deviceStatus.updated_at) : null;
  const daysLeft = client.demo_expires_at ? getDaysLeft(client.demo_expires_at) : null;

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <header style={{ padding: "18px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/admin")} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            ← Назад
          </button>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{client.name}</span>
          <span style={{ fontSize: 11, padding: "2px 10px", background: st.bg, color: st.color, borderRadius: 100 }}>{st.label}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {devStatus && <span style={{ fontSize: 12, color: devStatus.color }}>{devStatus.dot} {devStatus.label}</span>}
          <button onClick={() => setShowEdit(!showEdit)} style={{ padding: "7px 14px", background: showEdit ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showEdit ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: showEdit ? "#C9A84C" : "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            ✏️ Редактировать
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>
        {success && (
          <div style={{ padding: "12px 20px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontSize: 14, color: "#22C55E", marginBottom: 20 }}>
            ✓ {success}
          </div>
        )}

        {/* ФОРМА РЕДАКТИРОВАНИЯ */}
        {showEdit && (
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "20px", marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#C9A84C", marginBottom: 16 }}>✏️ Редактирование данных</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>Название заведения *</div>
                <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                  placeholder="Название заведения" style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>Телефон</div>
                <input value={editData.phone} onChange={e => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.startsWith("998")) val = val.slice(3);
                  if (val.length > 9) val = val.slice(0, 9);
                  setEditData({...editData, phone: val ? "+998" + val : ""});
                }} placeholder="99 410 09 10" style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>Пароль</div>
                <input value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})}
                  placeholder="Новый пароль" style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>Device ID</div>
                <input value={editData.device_id} onChange={e => setEditData({...editData, device_id: e.target.value})}
                  placeholder="TOX3_XXXXXX" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={saveEdit} disabled={savingEdit} style={{ padding: "10px 24px", background: "#C9A84C", border: "none", borderRadius: 8, color: "#080C12", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                {savingEdit ? "Сохраняем..." : "Сохранить изменения"}
              </button>
              <button onClick={() => setShowEdit(false)} style={{ padding: "10px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Отмена
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* ИНФОРМАЦИЯ */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>👤 Информация</h2>
            {[
              { label: "Заведение", value: client.name },
              { label: "Телефон", value: client.phone },
              { label: "Пароль", value: client.password },
              { label: "Device ID", value: client.device_id || "Не назначено" },
              { label: "Client ID", value: client.id?.slice(0, 8) + "..." },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#8BA7BE" }}>{item.label}</span>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.value || "—"}</span>
              </div>
            ))}
          </div>

          {/* ПОДПИСКА */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>💳 Подписка</h2>
            <div style={{ marginBottom: 16 }}>
              {[
                { label: "Статус", value: st.label, color: st.color },
                { label: "Осталось дней", value: daysLeft !== null ? `${daysLeft} дней` : "—" },
                { label: "Истекает", value: client.demo_expires_at ? new Date(client.demo_expires_at).toLocaleDateString("ru-RU") : "—" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 12, color: "#8BA7BE" }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: (item as any).color || "#fff", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button onClick={() => extendDemo(7)} disabled={saving} style={{ padding: "8px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, color: "#F59E0B", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>+7 дней</button>
              <button onClick={() => extendDemo(30)} disabled={saving} style={{ padding: "8px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, color: "#F59E0B", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>+30 дней</button>
              <button onClick={() => setStatus("active")} disabled={saving} style={{ padding: "8px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#22C55E", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>Активировать</button>
              <button onClick={() => setStatus("expired")} disabled={saving} style={{ padding: "8px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#EF4444", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>Отключить</button>
            </div>
          </div>

          {/* МУЗЫКА */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>🎵 Музыкальные настройки</h2>
            <div style={{ marginBottom: 16 }}>
              {[
                { label: "Текущая станция", value: STATION_NAMES[client.station_key] || client.station_key || "—" },
                { label: "Расписание", value: scheduleTemplates.find(t => t.template_key === client.template_key)?.template_name || client.template_key || "—" },
                { label: "Режим", value: client.music_mode === "automatic" ? "🟢 Авто" : client.music_mode === "manual" ? "🔵 Ручной" : "—" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 12, color: "#8BA7BE" }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Смена станции */}
            <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 6 }}>Сменить станцию (ручной режим)</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <select value={selectedStation} onChange={e => setSelectedStation(e.target.value)} style={selectStyle}>
                {STATIONS.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
              </select>
              <button onClick={changeStation} disabled={saving} style={{ padding: "8px 16px", background: "#C9A84C", border: "none", borderRadius: 8, color: "#080C12", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Применить
              </button>
            </div>

            {/* Смена расписания */}
            <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 6 }}>Сменить расписание (авто режим)</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} style={selectStyle}>
                <option value="">— Выбрать расписание —</option>
                {scheduleTemplates.map(t => (
                  <option key={t.template_key} value={t.template_key}>{t.template_name}</option>
                ))}
              </select>
              <button onClick={changeSchedule} disabled={saving || !selectedTemplate} style={{ padding: "8px 16px", background: "#3B82F6", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Расписание
              </button>
            </div>
          </div>

          {/* УСТРОЙСТВО */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📱 Устройство</h2>
            {deviceStatus ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  {[
                    { label: "Device ID", value: deviceStatus.device_id },
                    { label: "Статус", value: devStatus ? `${devStatus.dot} ${devStatus.label} · ${devStatus.timeAgo}` : "—" },
                    { label: "Станция", value: STATION_NAMES[deviceStatus.current_station] || deviceStatus.current_station || "—" },
                    { label: "Трек", value: deviceStatus.current_track ? getTrackName(deviceStatus.current_track) : "—" },
                    { label: "Кэш", value: `${deviceStatus.cache_size_mb || 0}MB` },
                    { label: "Версия", value: deviceStatus.app_version || "—" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: 12, color: "#8BA7BE" }}>{item.label}</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button onClick={() => sendCommand("next_track")} disabled={saving} style={{ padding: "8px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                    ⏭ Следующий трек
                  </button>
                  <button onClick={() => router.push(`/admin/devices/${deviceStatus.device_id}`)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                    Детали устройства →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: "#8BA7BE", fontSize: 13 }}>⚪ Устройство не подключено</div>
            )}
          </div>

          {/* ЗАМЕТКИ */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📝 Заметки</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Например: ждёт оплату, проблемы с интернетом..."
              style={{ width: "100%", height: 100, padding: "10px 12px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
            <button onClick={saveNotes} disabled={saving} style={{ marginTop: 8, padding: "8px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              Сохранить заметку
            </button>
          </div>

          {/* ИСТОРИЯ КОМАНД */}
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📋 История команд</h2>
            {commands.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {commands.map((cmd, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#162435", borderRadius: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{cmd.command}</span>
                      {cmd.genre && <span style={{ fontSize: 11, color: "#8BA7BE", marginLeft: 8 }}>{cmd.genre}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: cmd.executed ? "#22C55E" : "#F59E0B" }}>{cmd.executed ? "✓" : "⏳"}</span>
                      <span style={{ fontSize: 11, color: "#4a5a6a" }}>{new Date(cmd.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
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
