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

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getTrackName(track: string): string {
  return track.replace(".mp3", "").replace(/_/g, " ").split("-").slice(1).join(" ").trim() || track.replace(".mp3", "");
}

function getDeviceStatus(updatedAt: string): { level: "online" | "noconn" | "unavailable", label: string, color: string, bg: string, border: string, timeAgo: string } {
  const updated = new Date(updatedAt + "Z");
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - updated.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const timeAgo = diffSec < 60 ? `${diffSec} сек назад` : `${diffMin} мин назад`;
  if (diffMin < 2) return { level: "online", label: "Онлайн", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", timeAgo };
  if (diffMin < 10) return { level: "noconn", label: "Нет связи", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", timeAgo };
  return { level: "unavailable", label: "Недоступно", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", timeAgo };
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
          <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Что входит в подписку:</div>
          {["10 музыкальных станций Jamendo", "Автоматическое расписание", "Android TV приставка", "Официальный сертификат", "Личный кабинет"].map(f => (
            <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "#C9A84C" }}>✓</span>
              <span style={{ fontSize: 14, color: "#E8EFF5" }}>{f}</span>
            </div>
          ))}
        </div>
        <a href="/#trial" style={{ display: "block", padding: "18px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", marginBottom: 16, boxShadow: "0 8px 32px rgba(201,168,76,0.3)" }}>
          Оформить подписку →
        </a>
        <a href="tel:+998994100910" style={{ display: "block", padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8BA7BE", borderRadius: 12, fontSize: 14, textDecoration: "none" }}>
          Позвонить нам: +998 99 410 09 10
        </a>
      </div>
    </main>
  );
}

function LoginScreen({ onLogin }: { onLogin: (client: any) => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const login = async () => {
    if (!phone || !password) return;
    setLoading(true);
    setError("");
    const data = await sb(`clients?phone=eq.${encodeURIComponent(phone)}&password=eq.${password}&select=*`);
    setLoading(false);
    if (data && data.length > 0) {
      onLogin(data[0]);
    } else {
      setError("Неверный телефон или пароль");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 40, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, margin: 20, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Личный кабинет</h1>
        <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 32 }}>Войдите чтобы управлять музыкой</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <input value={phone} onChange={e => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.startsWith("998")) val = val.slice(3);
  if (val.length > 9) val = val.slice(0, 9);
  setPhone(val ? "+998" + val : "");
}} placeholder="99 410 09 10" type="tel"
            style={{ padding: "14px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", width: "100%" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••"
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ padding: "14px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", width: "100%" }} />
        </div>
        {error && (
          <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
            {error}
          </div>
        )}
        <button onClick={login} disabled={loading} style={{ width: "100%", padding: "15px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Входим..." : "Войти"}
        </button>
        <div style={{ marginTop: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          {!showForgot ? (
            <>
              <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: "#C9A84C", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Забыли пароль?
              </button>
              <a href="/" style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>← На главную</a>
            </>
          ) : (
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, color: "#fff", marginBottom: 12, fontWeight: 700 }}>Восстановление пароля</div>
              {!forgotSent ? (
                <>
                  <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 12 }}>Введите ваш номер телефона — администратор свяжется с вами</p>
                  <input value={forgotPhone} onChange={e => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.startsWith("998")) val = val.slice(3);
  if (val.length > 9) val = val.slice(0, 9);
  setForgotPhone(val ? "+998" + val : "");
}} placeholder="99 410 09 10"
                    style={{ width: "100%", padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
                  <button onClick={async () => {
                    if (!forgotPhone) return;
                    const data = await sb(`clients?phone=eq.${encodeURIComponent(forgotPhone)}&select=name,phone,password`);
                    const text = data && data.length > 0
                      ? `🔑 Запрос на восстановление пароля!\n\n🏢 ${data[0].name}\n📞 ${data[0].phone}\n🔑 Пароль: ${data[0].password}`
                      : `🔑 Запрос пароля от неизвестного номера: ${forgotPhone}`;
                    await fetch(`https://api.telegram.org/bot8572453029:AAGacP96un1FuPOcj6hmc708pOBv7nYPIiI/sendMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ chat_id: "500210645", text }),
                    });
                    setForgotSent(true);
                  }} style={{ width: "100%", padding: "12px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 8 }}>
                    Отправить запрос
                  </button>
                  <button onClick={() => setShowForgot(false)} style={{ background: "none", border: "none", color: "#8BA7BE", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                    ← Назад
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 14, color: "#fff", marginBottom: 6 }}>Запрос отправлен!</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 12 }}>Администратор свяжется с вами в ближайшее время</div>
                  <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotPhone(""); }} style={{ background: "none", border: "none", color: "#C9A84C", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                    ← Назад к входу
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<"login" | "dashboard" | "paywall">("login");
  const [client, setClient] = useState<any>(null);
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stationCategories, setStationCategories] = useState<any[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [success, setSuccess] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (screen === "dashboard") {
      loadData();
      const interval = setInterval(() => loadDeviceStatus(), 30000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  useEffect(() => {
    if (client?.device_id && screen === "dashboard") loadDeviceStatus();
  }, [client]);

  const loadData = async () => {
    const [s, c, sc, tmpl] = await Promise.all([
      sb("stations?is_active=eq.true&select=*&order=display_name"),
      sb("business_categories?select=*&order=name"),
      sb("station_categories?select=station_id,category_id"),
      sb("schedule_templates?select=*&order=template_name"),
    ]);
    if (s) setStations(s);
    if (c) setCategories(c);
    if (sc) setStationCategories(sc);
    if (tmpl) setScheduleTemplates(tmpl);
  };

  const loadDeviceStatus = async () => {
  if (!client?.device_id) return;
  const [data, clientData] = await Promise.all([
    sb(`device_status?device_id=eq.${client.device_id}&select=*`),
    sb(`clients?id=eq.${client.id}&select=station_key,music_mode,template_key`),
  ]);
  if (data && data.length > 0) setDeviceStatus(data[0]);
  if (clientData && clientData.length > 0) {
    setClient((prev: any) => ({ ...prev, ...clientData[0] }));
  }
};

  const handleLogin = (clientData: any) => {
    localStorage.setItem("fonmusic_client_id", clientData.id);
    setClient(clientData);
    const status = clientData.subscription_status;
    const expiresAt = clientData.demo_expires_at;
    if (status === "active") { setScreen("dashboard"); return; }
    if (status === "expired") { setScreen("paywall"); return; }
    if (status === "demo" && expiresAt) {
      const days = getDaysLeft(expiresAt);
      setDaysLeft(days);
      if (days <= 0) {
        sb(`clients?id=eq.${clientData.id}`, { method: "PATCH", body: JSON.stringify({ subscription_status: "expired" }) });
        setScreen("paywall");
      } else {
        setScreen("dashboard");
      }
      return;
    }
    setScreen("dashboard");
  };

  const sendCommand = async (command: string, extra?: object) => {
    await sb("commands", {
      method: "POST",
      body: JSON.stringify({
        device_id: client.device_id,
        command,
        genre: client.station_key,
        mode: client.mode || "normal",
        executed: false,
        ...extra,
      }),
    });
  };

  const changeStation = async (stationKey: string) => {
    if (!client || saving) return;
    setSaving(true);
    setSuccess("");
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ station_key: stationKey }) });
    await sendCommand("change_station", { genre: stationKey });
    setClient({ ...client, station_key: stationKey });
    setSaving(false);
    setSuccess("Станция изменена!");
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

  const changeSchedule = async (templateKey: string) => {
  if (!client || savingSchedule) return;
  setSavingSchedule(true);
  await sb(`clients?id=eq.${client.id}`, {
    method: "PATCH",
    body: JSON.stringify({ template_key: templateKey, music_mode: "automatic" }),
  });
  await sendCommand("refresh_schedule");
  setClient({ ...client, template_key: templateKey, music_mode: "automatic" });
  setSavingSchedule(false);
  setSuccess("Расписание обновлено!");
  setTimeout(() => setSuccess(""), 3000);
};

  const changePassword = async () => {
    if (!oldPassword || !newPassword) return;
    setPasswordError("");
    if (oldPassword !== client.password) {
      setPasswordError("Неверный текущий пароль");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("Пароль должен быть не менее 4 символов");
      return;
    }
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword }),
    });
    setClient({ ...client, password: newPassword });
    setSaving(false);
    setPasswordSuccess("Пароль успешно изменён!");
    setOldPassword("");
    setNewPassword("");
    setTimeout(() => { setPasswordSuccess(""); setShowChangePassword(false); }, 2000);
  };

  const getStationsForCategory = (categoryKey: string) => {
    const category = categories.find(c => c.category_key === categoryKey);
    if (!category) return stations;
    const stationIds = stationCategories.filter(sc => sc.category_id === category.id).map(sc => sc.station_id);
    return stations.filter(s => stationIds.includes(s.id));
  };

  if (screen === "login") return <LoginScreen onLogin={handleLogin} />;
  if (screen === "paywall") return <PaywallScreen />;

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>

      {/* NAV */}
      <nav style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {daysLeft !== null && daysLeft > 0 && (
            <div style={{ fontSize: 12, color: "#C9A84C", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", padding: "4px 10px", borderRadius: 100 }}>
              Демо: {daysLeft} дн.
            </div>
          )}
          <div style={{ fontSize: 13, color: "#8BA7BE" }}>👤 {client?.name}</div>
          <button onClick={() => { setScreen("login"); setClient(null); setDeviceStatus(null); }} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Выйти
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>

        {/* SUCCESS */}
        {success && (
          <div style={{ padding: "12px 20px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontSize: 14, color: "#22C55E", marginBottom: 20 }}>
            ✓ {success}
          </div>
        )}

        {/* DEMO BANNER */}
        {daysLeft !== null && daysLeft > 0 && (
          <div style={{ padding: "16px 20px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 14, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#C9A84C" }}>🕐 Тестовый период: осталось <strong>{daysLeft} дней</strong></div>
            <a href="/#trial" style={{ fontSize: 13, color: "#080C12", background: "#C9A84C", padding: "7px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Подключить →</a>
          </div>
        )}

        {/* 1. СТАТУС УСТРОЙСТВА */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {deviceStatus ? (() => {
            const status = getDeviceStatus(deviceStatus.updated_at);
            return (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: status.color }}>{status.label}</span>
                    <span style={{ fontSize: 12, color: "#8BA7BE" }}>· {status.timeAgo}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#8BA7BE", flexWrap: "wrap" }}>
                    <span>📱 {client?.device_id}</span>
                    {deviceStatus.current_station && <span>🎵 {STATION_NAMES[deviceStatus.current_station] || deviceStatus.current_station}</span>}
                    {deviceStatus.cache_size_mb > 0 && <span>💾 {deviceStatus.cache_size_mb}MB кэш</span>}
                  </div>
                </div>
                <div style={{ padding: "4px 12px", background: status.bg, border: `1px solid ${status.border}`, borderRadius: 100 }}>
                  <span style={{ fontSize: 12, color: status.color }}>{status.level === "online" ? "🟢" : status.level === "noconn" ? "🟡" : "🔴"} {status.label}</span>
                </div>
              </div>
            );
          })() : (
            <div style={{ fontSize: 13, color: "#8BA7BE" }}>⏳ Загрузка статуса устройства...</div>
          )}
        </div>

        {/* 2. ВЫБОР СТАНЦИИ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🎵 Выбор станции</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Выберите музыку для вашего заведения</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <button onClick={() => setSelectedCategory(null)} style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif",
              background: !selectedCategory ? "#C9A84C" : "rgba(255,255,255,0.05)",
              border: !selectedCategory ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: !selectedCategory ? "#080C12" : "#E8EFF5", fontWeight: !selectedCategory ? 700 : 400,
            }}>Все</button>
            {categories.map(c => (
              <button key={c.category_key} onClick={() => setSelectedCategory(c.category_key)} style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif",
                background: selectedCategory === c.category_key ? "#C9A84C" : "rgba(255,255,255,0.05)",
                border: selectedCategory === c.category_key ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: selectedCategory === c.category_key ? "#080C12" : "#E8EFF5",
                fontWeight: selectedCategory === c.category_key ? 700 : 400,
              }}>{c.icon} {c.name}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(selectedCategory ? getStationsForCategory(selectedCategory) : stations).map(s => {
              const isActive = client?.station_key === s.station_key;
              return (
                <button key={s.station_key} onClick={() => changeStation(s.station_key)} disabled={saving} style={{
                  padding: "18px", borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif",
                  background: isActive ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                  border: `${isActive ? "2px" : "1px"} solid ${isActive ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isActive ? "0 0 16px rgba(201,168,76,0.15)" : "none",
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#C9A84C" : "#fff" }}>{s.display_name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#8BA7BE", lineHeight: 1.4 }}>{s.description}</div>
                  {isActive && (
                    <div style={{ marginTop: 8, fontSize: 10, color: "#C9A84C", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", display: "inline-block" }} />
                      СЕЙЧАС ИГРАЕТ
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. СЕЙЧАС ИГРАЕТ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: 2, marginBottom: 12 }}>▶ СЕЙЧАС ИГРАЕТ</div>
          {deviceStatus ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {STATION_NAMES[deviceStatus.current_station] || deviceStatus.current_station || "—"}
              </div>
              <div style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 16, fontStyle: "italic" }}>
                🎵 {deviceStatus.current_track ? getTrackName(deviceStatus.current_track) : "—"}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 16 }}>⏳ Загрузка данных устройства...</div>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={nextTrack} disabled={saving} style={{
              padding: "12px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif",
            }}>
              ⏭ Следующий трек
            </button>
            <a href="/player" style={{
              padding: "12px 24px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 10, color: "#C9A84C", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block",
            }}>
              🎵 Открыть плеер
            </a>
          </div>
        </div>

        {/* 4. РАСПИСАНИЕ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>📅 Расписание</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Музыка автоматически меняется по времени дня</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scheduleTemplates.map(t => (
              <button key={t.template_key} onClick={() => changeSchedule(t.template_key)} disabled={savingSchedule} style={{
                padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif",
                background: client?.template_key === t.template_key ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                border: `${client?.template_key === t.template_key ? "2px" : "1px"} solid ${client?.template_key === t.template_key ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.08)"}`,
                width: "100%",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: client?.template_key === t.template_key ? "#C9A84C" : "#fff" }}>
                  {t.template_name}
                </div>
                {client?.template_key === t.template_key && (
                  <div style={{ fontSize: 10, color: "#C9A84C", marginTop: 4 }}>✓ АКТИВНО</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 5. СМЕНА ПАРОЛЯ */}
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

        {/* 6. СЕРТИФИКАТ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>📄 Сертификат</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 16 }}>Официальный сертификат JAMENDO Licensing</p>
          <button onClick={() => window.print()} style={{ padding: "12px 20px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            🖨️ Распечатать сертификат
          </button>
        </div>

      </div>
    </main>
  );
}
