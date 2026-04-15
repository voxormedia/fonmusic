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

const STATION_LABELS: Record<string, { name: string, icon: string }> = {
  cozy_coffee:     { name: "Для кофеен",    icon: "☕" },
  cocktail_dinner: { name: "Для ужина",     icon: "🍽️" },
  cool_calm:       { name: "Спокойная",     icon: "🎵" },
  lounge:          { name: "Лаунж",         icon: "🏨" },
  luxury:          { name: "Премиальная",   icon: "✨" },
  shopping_vibes:  { name: "Для магазинов", icon: "🛍️" },
  spa_garden:      { name: "Для SPA",       icon: "💆" },
  workout:         { name: "Для фитнеса",   icon: "💪" },
  on_the_rocks:    { name: "Для баров",     icon: "🎸" },
  best_of_radio:   { name: "Универсальная", icon: "⭐" },
};

const BUSINESS_TYPES = [
  { label: "Кафе / кофейня", template: "cafe_standard", station: "cozy_coffee" },
  { label: "Ресторан", template: "restaurant_standard", station: "cocktail_dinner" },
  { label: "Бар / lounge bar", template: "bar_evening", station: "on_the_rocks" },
  { label: "Магазин / бутик", template: "retail_standard", station: "shopping_vibes" },
  { label: "Супермаркет", template: "market_standard", station: "best_of_radio" },
  { label: "SPA / салон", template: "spa_standard", station: "spa_garden" },
  { label: "Салон красоты", template: "beauty_standard", station: "cool_calm" },
  { label: "Фитнес / спортзал", template: "fitness_standard", station: "workout" },
  { label: "Отель / лобби", template: "hotel_standard", station: "lounge" },
];

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getStationLabel(key: string) {
  return STATION_LABELS[key] || { name: key, icon: "🎵" };
}

const PLAN_MAX_LOCATIONS: Record<string, number> = {
  trial: 1, basic: 1, standard: 1, premium: 10,
};

function PaywallScreen() {
  return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⏰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Тестовый период завершён</h1>
        <p style={{ fontSize: 15, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 32 }}>Подключите подписку чтобы продолжить</p>
        <a href="/pricing" style={{ display: "block", padding: "18px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", marginBottom: 16 }}>
          Выбрать тариф →
        </a>
        <a href="tel:+998994100910" style={{ display: "block", padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8BA7BE", borderRadius: 12, fontSize: 14, textDecoration: "none" }}>
          +998 99 410 09 10
        </a>
      </div>
    </main>
  );
}

function AddLocationModal({ client, onAdd, onClose }: { client: any, onAdd: (loc: any) => void, onClose: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [deviceType, setDeviceType] = useState("web");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name) return;
    setSaving(true);
    const loc = await sb("locations", {
      method: "POST",
      body: JSON.stringify({
        client_id: client.id,
        name, address,
        device_type: deviceType,
        station_key: businessType.station,
        template_key: businessType.template,
        default_template_key: businessType.template,
        music_mode: "automatic",
        is_active: true,
      }),
    });
    setSaving(false);
    if (loc && loc.length > 0) onAdd(loc[0]);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", background: "#162435",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 460 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>➕ Добавить заведение</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Название *</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Кафе Уют — Чиланзар" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Адрес</div>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="ул. Навои, 12" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Тип заведения</div>
            <select value={businessType.label} onChange={e => {
              const bt = BUSINESS_TYPES.find(b => b.label === e.target.value);
              if (bt) setBusinessType(bt);
            }} style={{ ...inputStyle, background: "#162435" }}>
              {BUSINESS_TYPES.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 8 }}>Устройство</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { val: "web", label: "🎧 Веб-плеер", color: "#3B82F6" },
                { val: "box", label: "📦 FonMusic Box", color: "#C9A84C" },
              ].map(d => (
                <button key={d.val} onClick={() => setDeviceType(d.val)} style={{
                  flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif",
                  background: deviceType === d.val ? `${d.color}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${deviceType === d.val ? `${d.color}60` : "rgba(255,255,255,0.1)"}`,
                  color: deviceType === d.val ? d.color : "#8BA7BE", fontSize: 13, fontWeight: deviceType === d.val ? 700 : 400,
                }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} disabled={saving || !name} style={{
            flex: 1, padding: "13px", background: "#C9A84C", border: "none", borderRadius: 10,
            color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
          }}>
            {saving ? "Добавляем..." : "Добавить"}
          </button>
          <button onClick={onClose} style={{
            padding: "13px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, color: "#8BA7BE", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif",
          }}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<"loading" | "locations" | "paywall">("loading");
  const [client, setClient] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    if (!clientId) { window.location.href = "/login"; return; }
    initClient(clientId);
  }, []);

  const initClient = async (clientId: string) => {
    const data = await sb(`clients?id=eq.${clientId}&select=*`);
    if (!data || data.length === 0) { window.location.href = "/login"; return; }
    const c = data[0];
    setClient(c);

    if (c.subscription_status === "expired") { setScreen("paywall"); return; }
    if (c.demo_expires_at) {
      const days = getDaysLeft(c.demo_expires_at);
      setDaysLeft(days);
      if (days <= 0 && c.subscription_status === "demo") {
        await sb(`clients?id=eq.${c.id}`, { method: "PATCH", body: JSON.stringify({ subscription_status: "expired" }) });
        setScreen("paywall"); return;
      }
    }

    await loadLocations(c.id);
    setScreen("locations");
  };

  const loadLocations = async (clientId: string) => {
    const data = await sb(`locations?client_id=eq.${clientId}&is_active=eq.true&select=*&order=created_at`);
    if (data) setLocations(data);
  };

  const openLocation = (loc: any) => {
    if (loc.device_type === "box") {
      window.location.href = `/dashboard/location?id=${loc.id}`;
    } else {
      window.location.href = `/player?location_id=${loc.id}`;
    }
  };

  const changeDeviceType = async (locId: string, newType: string) => {
    await sb(`locations?id=eq.${locId}`, { method: "PATCH", body: JSON.stringify({ device_type: newType }) });
    setLocations(prev => prev.map(l => l.id === locId ? { ...l, device_type: newType } : l));
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) return;
    setPasswordError("");
    if (oldPassword !== client.password) { setPasswordError("Неверный текущий пароль"); return; }
    if (newPassword.length < 4) { setPasswordError("Пароль не менее 4 символов"); return; }
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ password: newPassword }) });
    setClient({ ...client, password: newPassword });
    setSaving(false);
    setPasswordSuccess("Пароль изменён!");
    setOldPassword(""); setNewPassword("");
    setTimeout(() => { setPasswordSuccess(""); setShowChangePassword(false); }, 2000);
  };

  const logout = () => { localStorage.removeItem("fonmusic_client_id"); window.location.href = "/login"; };

  const maxLocations = PLAN_MAX_LOCATIONS[client?.plan || "trial"] || 1;
  const canAddLocation = locations.length < maxLocations;

  if (screen === "loading") return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>⏳ Загрузка...</div>
    </main>
  );

  if (screen === "paywall") return <PaywallScreen />;

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      {showAddModal && (
        <AddLocationModal
          client={client}
          onAdd={loc => { setLocations(prev => [...prev, loc]); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)}
        />
      )}

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

        {/* ТАРИФ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>
              {client?.plan === "premium" ? "✨" : client?.plan === "standard" ? "⭐" : client?.plan === "basic" ? "☕" : "🎵"}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {client?.plan === "premium" ? "Премиум" : client?.plan === "standard" ? "Стандарт" : client?.plan === "basic" ? "Базовый" : "Демо период"}
              </div>
              <div style={{ fontSize: 11, color: "#8BA7BE" }}>
                {client?.plan === "trial" ? `Доступ до ${new Date(client?.trial_until || "").toLocaleDateString("ru-RU")}` : "Активная подписка"}
              </div>
            </div>
          </div>
          <a href="/pricing" style={{ fontSize: 12, color: "#C9A84C", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8 }}>
            {client?.plan === "trial" ? "Выбрать тариф →" : "Изменить тариф →"}
          </a>
        </div>

        {/* ДЕМО БАННЕР */}
        {daysLeft !== null && daysLeft > 0 && client?.plan === "trial" && (
          <div style={{ padding: "16px 20px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 14, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#C9A84C" }}>🕐 Тестовый период: осталось <strong>{daysLeft} дней</strong></div>
            <a href="/pricing" style={{ fontSize: 13, color: "#080C12", background: "#C9A84C", padding: "7px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Подключить →</a>
          </div>
        )}

        {/* МОИ ЗАВЕДЕНИЯ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>🏢 Мои заведения</h1>
              <div style={{ fontSize: 12, color: "#4a5a6a" }}>{locations.length} из {maxLocations} точек</div>
            </div>
            {canAddLocation ? (
              <button onClick={() => setShowAddModal(true)} style={{
                padding: "10px 18px", background: "#C9A84C", border: "none", borderRadius: 10,
                color: "#080C12", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
              }}>
                ➕ Добавить заведение
              </button>
            ) : (
              <a href="/pricing" style={{
                padding: "10px 18px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 10, color: "#C9A84C", fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                ✨ Добавить точки (Премиум)
              </a>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {locations.map(loc => {
              const station = getStationLabel(loc.station_key);
              const isWeb = loc.device_type !== "box";
              return (
                <div key={loc.id} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{loc.name}</div>
                      {loc.address && <div style={{ fontSize: 12, color: "#4a5a6a", marginBottom: 8 }}>📍 {loc.address}</div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "#8BA7BE" }}>{station.icon} {station.name}</span>
                        <span style={{ fontSize: 11, color: "#4a5a6a" }}>·</span>
                        <span style={{ fontSize: 12, color: isWeb ? "#3B82F6" : "#C9A84C" }}>
                          {isWeb ? "🎧 Веб-плеер" : "📦 FonMusic Box"}
                        </span>
                        <span style={{ fontSize: 11, color: "#4a5a6a" }}>·</span>
                        <span style={{ fontSize: 12, color: loc.music_mode === "automatic" ? "#22C55E" : "#F59E0B" }}>
                          {loc.music_mode === "automatic" ? "🔄 Авто" : "✋ Вручную"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <button onClick={() => openLocation(loc)} style={{
                        padding: "10px 20px",
                        background: isWeb ? "#3B82F6" : "#C9A84C",
                        border: "none", borderRadius: 10,
                        color: isWeb ? "#fff" : "#080C12",
                        fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
                        whiteSpace: "nowrap",
                      }}>
                        {isWeb ? "▶ Открыть плеер" : "🎛️ Управлять"}
                      </button>

                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => changeDeviceType(loc.id, "web")} style={{
                          padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10,
                          background: isWeb ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isWeb ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: isWeb ? "#3B82F6" : "#4a5a6a",
                        }}>
                          🎧 Плеер
                        </button>
                        <button onClick={() => changeDeviceType(loc.id, "box")} style={{
                          padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10,
                          background: !isWeb ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${!isWeb ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: !isWeb ? "#C9A84C" : "#4a5a6a",
                        }}>
                          📦 Box
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {locations.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
                <div style={{ fontSize: 15, color: "#fff", marginBottom: 8 }}>Нет заведений</div>
                <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>Добавьте первое заведение</div>
                <button onClick={() => setShowAddModal(true)} style={{ padding: "12px 24px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  ➕ Добавить заведение
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ПОДДЕРЖКА */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>💬 Поддержка</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="https://t.me/fonmusic2026" target="_blank" style={{ padding: "10px 16px", background: "rgba(0,136,204,0.1)", border: "1px solid rgba(0,136,204,0.3)", borderRadius: 10, color: "#0088CC", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>✈ Telegram</a>
            <a href="https://wa.me/998994100910" target="_blank" style={{ padding: "10px 16px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, color: "#25D166", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>💬 WhatsApp</a>
            <a href="tel:+998994100910" style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8BA7BE", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>📞 +998 99 410 09 10</a>
          </div>
        </div>

        {/* ПАРОЛЬ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showChangePassword ? 16 : 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🔑 Пароль</h2>
            <button onClick={() => { setShowChangePassword(!showChangePassword); setPasswordError(""); }} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              {showChangePassword ? "Отмена" : "Изменить"}
            </button>
          </div>
          {showChangePassword && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Текущий пароль" style={{ padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Новый пароль" style={{ padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              {passwordError && <div style={{ fontSize: 13, color: "#EF4444" }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ fontSize: 13, color: "#22C55E" }}>{passwordSuccess}</div>}
              <button onClick={changePassword} disabled={saving} style={{ padding: "12px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Сохранить
              </button>
            </div>
          )}
        </div>

        {/* СЕРТИФИКАТ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>📄 Сертификат лицензии</h2>
          <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 14 }}>Официальный документ для проверяющих органов</p>
          <button onClick={() => window.print()} style={{ padding: "10px 18px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            🖨️ Распечатать сертификат
          </button>
        </div>

      </div>
    </main>
  );
}
