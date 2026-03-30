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

const MODES = [
  { key: "calm", label: "Calm", icon: "🌿", desc: "Спокойно" },
  { key: "normal", label: "Normal", icon: "🎵", desc: "Стандарт" },
  { key: "busy", label: "Busy", icon: "⚡", desc: "Энергично" },
];

export default function CabinetPage() {
  const [screen, setScreen] = useState<"login" | "cabinet">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stationCategories, setStationCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (screen === "cabinet") {
      loadData();
    }
  }, [screen]);

  const loadData = async () => {
    const [s, c, sc] = await Promise.all([
      sb("stations?is_active=eq.true&select=*&order=display_name"),
      sb("business_categories?select=*&order=name"),
      sb("station_categories?select=station_id,category_id"),
    ]);
    if (s) setStations(s);
    if (c) setCategories(c);
    if (sc) setStationCategories(sc);
  };

  const login = async () => {
    if (!phone || !password) return;
    setLoading(true);
    setError("");
    const data = await sb(`clients?phone=eq.${encodeURIComponent(phone)}&password=eq.${password}&select=*`);
    setLoading(false);
    if (data && data.length > 0) {
      setClient(data[0]);
      setScreen("cabinet");
      setSelectedCategory(data[0].business_type || null);
    } else {
      setError("Неверный телефон или пароль");
    }
  };

  const changeStation = async (stationKey: string) => {
    if (!client || saving) return;
    console.log("DEBUG client:", client); // ← сюда
    setSaving(true);
    setSuccess("");

    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ station_key: stationKey }),
    });

    await sb("commands", {
      method: "POST",
      body: JSON.stringify({
        device_id: client.device_id,
        command: "change_station",
        genre: stationKey,
        mode: client.mode || "normal",
        executed: false,
      }),
    });

    setClient({ ...client, station_key: stationKey });
    setSaving(false);
    setSuccess("Станция изменена!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const changeMode = async (mode: string) => {
    if (!client || saving) return;
    setSaving(true);

    await sb(`clients?id=eq.${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({ mode }),
    });

    await sb("commands", {
      method: "POST",
      body: JSON.stringify({
        device_id: client.device_id,
        command: "change_mode",
        genre: client.station_key,
        mode,
        executed: false,
      }),
    });

    setClient({ ...client, mode });
    setSaving(false);
    setSuccess("Атмосфера изменена!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const getStationsForCategory = (categoryKey: string) => {
    const category = categories.find(c => c.category_key === categoryKey);
    if (!category) return stations;
    const stationIds = stationCategories
      .filter(sc => sc.category_id === category.id)
      .map(sc => sc.station_id);
    return stations.filter(s => stationIds.includes(s.id));
  };

  const currentStation = stations.find(s => s.station_key === client?.station_key);

  // LOGIN SCREEN
  if (screen === "login") {
    return (
      <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ width: "100%", maxWidth: 420, padding: 48, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Личный кабинет</h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 32 }}>Войдите чтобы управлять музыкой</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Телефон</div>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 99 410 09 10"
                style={{ width: "100%", padding: "12px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Пароль</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••"
                onKeyDown={e => e.key === "Enter" && login()}
                style={{ width: "100%", padding: "12px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          {error && (
            <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
              {error}
            </div>
          )}
          <button onClick={login} disabled={loading} style={{ width: "100%", padding: "14px", background: "#C9A84C", border: "none", borderRadius: 8, color: "#080C12", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Входим..." : "Войти"}
          </button>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/" style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>← На главную</a>
          </div>
        </div>
      </main>
    );
  }

  // CABINET SCREEN
  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>

      {/* NAV */}
      <nav style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div style={{ fontSize: 14, color: "#8BA7BE" }}>👤 {client?.name}</div>
        <button onClick={() => { setScreen("login"); setClient(null); }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8BA7BE", fontSize: 13, cursor: "pointer" }}>
          Выйти
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 32px" }}>

        {/* SUCCESS */}
        {success && (
          <div style={{ padding: "12px 20px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontSize: 14, color: "#22C55E", marginBottom: 24 }}>
            ✓ {success}
          </div>
        )}

        {/* STATUS */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>Статус устройства</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 100 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 13, color: "#22C55E" }}>Онлайн</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Заведение", value: client?.name },
              { label: "Тариф", value: client?.tariff },
              { label: "Устройство", value: client?.device_id },
            ].map(item => (
              <div key={item.label} style={{ background: "#162435", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{item.value || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CURRENT PLAYING */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#C9A84C", letterSpacing: 2, marginBottom: 8 }}>▶ СЕЙЧАС ИГРАЕТ</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {currentStation ? `${currentStation.icon} ${currentStation.display_name}` : "—"}
          </div>
          <div style={{ fontSize: 14, color: "#8BA7BE" }}>
            {currentStation?.description}
          </div>
        </div>

        {/* ATMOSPHERE MODE */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6, margin: "0 0 6px 0" }}>🌡️ Атмосфера</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20, margin: "0 0 20px 0" }}>Подстройте энергетику музыки под загруженность заведения</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {MODES.map(m => (
              <button key={m.key} onClick={() => changeMode(m.key)} disabled={saving} style={{
                padding: "16px 12px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                background: client?.mode === m.key ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
                border: client?.mode === m.key ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: client?.mode === m.key ? "#C9A84C" : "#fff" }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "#8BA7BE", marginTop: 2 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* STATION SELECTOR */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6, margin: "0 0 6px 0" }}>🎵 Выбор станции</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20, margin: "0 0 20px 0" }}>Выберите тип заведения и подберите подходящую музыку</p>

          {/* Category filter */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            <button onClick={() => setSelectedCategory(null)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif",
              background: !selectedCategory ? "#C9A84C" : "rgba(255,255,255,0.05)",
              border: !selectedCategory ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: !selectedCategory ? "#080C12" : "#E8EFF5",
              fontWeight: !selectedCategory ? 700 : 400,
            }}>
              Все
            </button>
            {categories.map(c => (
              <button key={c.category_key} onClick={() => setSelectedCategory(c.category_key)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif",
                background: selectedCategory === c.category_key ? "#C9A84C" : "rgba(255,255,255,0.05)",
                border: selectedCategory === c.category_key ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: selectedCategory === c.category_key ? "#080C12" : "#E8EFF5",
                fontWeight: selectedCategory === c.category_key ? 700 : 400,
              }}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Stations grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(selectedCategory ? getStationsForCategory(selectedCategory) : stations).map(s => (
              <button key={s.station_key} onClick={() => changeStation(s.station_key)} disabled={saving} style={{
                padding: "20px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: client?.station_key === s.station_key ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                border: client?.station_key === s.station_key ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: client?.station_key === s.station_key ? "#C9A84C" : "#fff" }}>
                    {s.display_name}
                  </span>
                  {client?.station_key === s.station_key && (
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#C9A84C", background: "rgba(201,168,76,0.15)", padding: "2px 8px", borderRadius: 10 }}>
                      ИГРАЕТ
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.4 }}>{s.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CERTIFICATE */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8, margin: "0 0 8px 0" }}>📄 Сертификат</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20, margin: "0 0 20px 0" }}>Официальный сертификат JAMENDO Licensing для вашего заведения</p>
          <button onClick={() => window.print()} style={{ padding: "12px 24px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            🖨️ Распечатать сертификат
          </button>
        </div>

      </div>
    </main>
  );
}
