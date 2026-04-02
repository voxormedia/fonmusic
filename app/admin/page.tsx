"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SUPABASE_URL = "https://ovafknvfckdmatrnlecr.supabase.co";
const SUPABASE_KEY = "sb_publishable_sMrkdTU705Zgw9-Sc12-Ww_XDrl1ASP";
const ADMIN_PASSWORD = "1234";

async function sb(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
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
  if (diffMin < 2) return { label: "Онлайн", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", dot: "🟢", timeAgo };
  if (diffMin < 10) return { label: "Нет связи", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", dot: "🟡", timeAgo };
  return { label: "Недоступно", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", dot: "🔴", timeAgo };
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

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "devices">("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const a = sessionStorage.getItem("fonmusic_admin");
      if (a === "true") { setAuthed(true); loadData(); }
    }
  }, []);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("fonmusic_admin", "true");
      setAuthed(true);
      loadData();
    } else {
      setError("Неверный пароль");
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [c, d] = await Promise.all([
      sb("clients?select=*&order=created_at.desc"),
      sb("device_status?select=*&order=updated_at.desc"),
    ]);
    if (c) setClients(c);
    if (d) setDevices(d);
    setLoading(false);
  };

  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ width: "100%", maxWidth: 380, padding: 40, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, margin: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic Admin</span>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Пароль администратора"
            style={{ width: "100%", padding: "14px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
          {error && <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 12 }}>{error}</div>}
          <button onClick={login} style={{ width: "100%", padding: "14px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Войти
          </button>
        </div>
      </main>
    );
  }

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.subscription_status === "active").length;
  const demoClients = clients.filter(c => c.subscription_status === "demo").length;
  const expiredClients = clients.filter(c => c.subscription_status === "expired").length;
  const onlineDevices = devices.filter(d => getDeviceStatus(d.updated_at).label === "Онлайн").length;
  const offlineDevices = devices.length - onlineDevices;
  const problemDevices = devices.filter(d => getDeviceStatus(d.updated_at).label !== "Онлайн");

  const filteredClients = clients.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.device_id?.includes(search)
  );

  const filteredDevices = devices.filter(d =>
    !search || d.device_id?.includes(search)
  );

  const stats = [
    { label: "Всего клиентов", value: totalClients, color: "#C9A84C" },
    { label: "Активных", value: activeClients, color: "#22C55E" },
    { label: "Демо", value: demoClients, color: "#F59E0B" },
    { label: "Истёкших", value: expiredClients, color: "#EF4444" },
    { label: "Онлайн", value: onlineDevices, color: "#22C55E" },
    { label: "Офлайн", value: offlineDevices, color: "#EF4444" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <header style={{ padding: "18px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic Admin</span>
          <span style={{ fontSize: 11, color: "#8BA7BE", padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 100 }}>Backoffice</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadData} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            🔄 Обновить
          </button>
          <button onClick={() => { sessionStorage.removeItem("fonmusic_admin"); setAuthed(false); }} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Выйти
          </button>
        </div>
      </header>

      <div style={{ padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 4 }}>
        {[
          { key: "overview", label: "Обзор" },
          { key: "clients", label: `Клиенты (${totalClients})` },
          { key: "devices", label: `Устройства (${devices.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            padding: "14px 20px", background: "transparent", border: "none",
            borderBottom: `2px solid ${activeTab === tab.key ? "#C9A84C" : "transparent"}`,
            color: activeTab === tab.key ? "#C9A84C" : "#8BA7BE",
            fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 400,
            cursor: "pointer", fontFamily: "Georgia, serif",
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Поиск по названию, телефону, device ID..."
          style={{ width: "100%", padding: "12px 16px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 24 }} />

        {loading && <div style={{ textAlign: "center", color: "#8BA7BE", padding: 40 }}>⏳ Загрузка...</div>}

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {problemDevices.length > 0 && (
              <div style={{ background: "#0D1B2A", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: "20px", marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", marginBottom: 16 }}>⚠️ Проблемные устройства ({problemDevices.length})</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {problemDevices.map(d => {
                    const status = getDeviceStatus(d.updated_at);
                    const client = clients.find(c => c.device_id === d.device_id);
                    return (
                      <div key={d.device_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#162435", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{d.device_id}</span>
                          {client && <span style={{ fontSize: 12, color: "#8BA7BE" }}>{client.name}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: status.color }}>{status.dot} {status.label} · {status.timeAgo}</span>
                          <button onClick={() => router.push(`/admin/devices/${d.device_id}`)} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8BA7BE", fontSize: 11, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                            Открыть
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>👥 Последние клиенты</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {clients.slice(0, 10).map(c => {
                  const st = STATUS_COLORS[c.subscription_status] || STATUS_COLORS.expired;
                  const dev = devices.find(d => d.device_id === c.device_id);
                  const devStatus = dev ? getDeviceStatus(dev.updated_at) : null;
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#162435", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "#8BA7BE" }}>{c.phone} · {STATION_NAMES[c.station_key] || c.station_key || "—"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", background: st.bg, color: st.color, borderRadius: 100 }}>{st.label}</span>
                        {devStatus && <span style={{ fontSize: 11, color: devStatus.color }}>{devStatus.dot} {devStatus.label}</span>}
                        <button onClick={() => router.push(`/admin/clients/${c.id}`)} style={{ padding: "5px 12px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, color: "#C9A84C", fontSize: 11, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                          Открыть →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "clients" && (
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>👥 Все клиенты ({filteredClients.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredClients.map(c => {
                const st = STATUS_COLORS[c.subscription_status] || STATUS_COLORS.expired;
                const dev = devices.find(d => d.device_id === c.device_id);
                const devStatus = dev ? getDeviceStatus(dev.updated_at) : null;
                return (
                  <div key={c.id} style={{ padding: "16px", background: "#162435", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 2 }}>{c.phone}</div>
                      <div style={{ fontSize: 11, color: "#4a5a6a" }}>{c.device_id || "Нет устройства"} · {STATION_NAMES[c.station_key] || "—"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", background: st.bg, color: st.color, borderRadius: 100 }}>{st.label}</span>
                      {devStatus && <span style={{ fontSize: 11, color: devStatus.color }}>{devStatus.dot} {devStatus.label}</span>}
                      {!devStatus && <span style={{ fontSize: 11, color: "#4a5a6a" }}>⚪ Нет устройства</span>}
                      <button onClick={() => router.push(`/admin/clients/${c.id}`)} style={{ padding: "6px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, color: "#C9A84C", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                        Открыть →
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredClients.length === 0 && <div style={{ textAlign: "center", color: "#8BA7BE", padding: 20 }}>Клиентов не найдено</div>}
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>📱 Все устройства ({filteredDevices.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredDevices.map(d => {
                const status = getDeviceStatus(d.updated_at);
                const client = clients.find(c => c.device_id === d.device_id);
                return (
                  <div key={d.device_id} style={{ padding: "16px", background: "#162435", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{d.device_id}</div>
                      <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 2 }}>{client?.name || "Клиент не найден"}</div>
                      <div style={{ fontSize: 11, color: "#4a5a6a" }}>{STATION_NAMES[d.current_station] || d.current_station || "—"} · {status.timeAgo} · {d.cache_size_mb || 0}MB кэш</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: status.color, padding: "3px 10px", background: status.bg, borderRadius: 100 }}>{status.dot} {status.label}</span>
                      <button onClick={() => router.push(`/admin/devices/${d.device_id}`)} style={{ padding: "6px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, color: "#C9A84C", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                        Открыть →
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredDevices.length === 0 && <div style={{ textAlign: "center", color: "#8BA7BE", padding: 20 }}>Устройств не найдено</div>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
