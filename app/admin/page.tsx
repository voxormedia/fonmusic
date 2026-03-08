"use client";
import { useState, useEffect } from "react";

const clients = [
  { id: 1, name: "Ресторан Silk Road", phone: "+998 90 123 45 67", type: "Ресторан", tariff: "Стандарт", genre: "mix", device: "device_001", status: "active", from: "2026-02-01", to: "2026-04-01" },
  { id: 2, name: "Кафе Central", phone: "+998 91 234 56 78", type: "Кафе", tariff: "Базовый", genre: "slow", device: null, status: "active", from: "2026-02-15", to: "2026-03-15" },
  { id: 3, name: "Бутик Milano", phone: "+998 93 345 67 89", type: "Магазин", tariff: "Премиум", genre: "fast", device: "device_002", status: "active", from: "2026-01-01", to: "2026-07-01" },
  { id: 4, name: "Салон Beauty Pro", phone: "+998 94 456 78 90", type: "Салон красоты", tariff: "Базовый", genre: "medium", device: null, status: "expired", from: "2026-01-01", to: "2026-02-01" },
  { id: 5, name: "Фитнес ClubX", phone: "+998 95 567 89 01", type: "Фитнес", tariff: "Стандарт", genre: "fast", device: "device_003", status: "active", from: "2026-03-01", to: "2026-06-01" },
  { id: 6, name: "Отель Grand Plaza", phone: "+998 97 678 90 12", type: "Отель", tariff: "Премиум", genre: "night", device: "device_004", status: "trial", from: "2026-03-05", to: "2026-03-15" },
];

const genreNames: Record<string, string> = { fast: "Энергичный", medium: "Средний", slow: "Медленный", night: "Ночной", mix: "Микс" };
const tariffColors: Record<string, string> = { "Базовый": "#8BA7BE", "Стандарт": "#C9A84C", "Премиум": "#22C55E" };
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Активен", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  expired: { label: "Истёк", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  trial: { label: "Пробный", color: "#C9A84C", bg: "rgba(201,168,76,0.1)" },
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "clients" | "devices">("dashboard");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pwError, setPwError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) return null;

  const m = isMobile;
  const px = m ? 16 : 32;

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    trial: clients.filter(c => c.status === "trial").length,
    expired: clients.filter(c => c.status === "expired").length,
    devices: clients.filter(c => c.device).length,
    revenue: clients.filter(c => c.status === "active").reduce((acc, c) => {
      if (c.tariff === "Базовый") return acc + 50;
      if (c.tariff === "Стандарт") return acc + 70;
      if (c.tariff === "Премиум") return acc + 100;
      return acc;
    }, 0),
  };

  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ width: "100%", maxWidth: 380, padding: 40, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic Admin</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 24 }}>🔐 Вход</h2>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwError(false); }}
            onKeyDown={e => { if (e.key === "Enter") { if (password === "fonmusic2026") setAuthed(true); else setPwError(true); }}}
            placeholder="Пароль"
            style={{ width: "100%", padding: "13px 16px", background: "#162435", border: `1px solid ${pwError ? "#EF4444" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
          />
          {pwError && <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 12 }}>Неверный пароль</div>}
          <button onClick={() => { if (password === "fonmusic2026") setAuthed(true); else setPwError(true); }}
            style={{ width: "100%", padding: 14, background: "#C9A84C", border: "none", borderRadius: 8, color: "#080C12", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Войти
          </button>
        </div>
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } html, body { max-width: 100vw; overflow-x: hidden; }`}</style>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", color: "#E8EFF5", fontFamily: "Georgia, serif" }}>

      {/* NAV */}
      <nav style={{ padding: `16px ${px}px`, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)", background: "#080C12", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: m ? 16 : 18, fontWeight: 700, color: "#fff" }}>FonMusic Admin</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["dashboard", "clients", "devices"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: m ? "6px 12px" : "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: m ? 11 : 13, fontWeight: 600,
              background: tab === t ? "#C9A84C" : "rgba(255,255,255,0.05)",
              color: tab === t ? "#080C12" : "#8BA7BE",
            }}>
              {t === "dashboard" ? (m ? "📊" : "📊 Дашборд") : t === "clients" ? (m ? "👥" : "👥 Клиенты") : (m ? "📱" : "📱 Устройства")}
            </button>
          ))}
        </div>
        <button onClick={() => setAuthed(false)} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8BA7BE", fontSize: 12, cursor: "pointer" }}>
          Выйти
        </button>
      </nav>

      <div style={{ padding: `24px ${px}px`, maxWidth: 1200, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: m ? 22 : 28, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Обзор</h1>
            <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
              {[
                { label: "Всего клиентов", value: stats.total, icon: "👥", color: "#8BA7BE" },
                { label: "Активных", value: stats.active, icon: "✅", color: "#22C55E" },
                { label: "Пробных", value: stats.trial, icon: "⏳", color: "#C9A84C" },
                { label: "Истекло", value: stats.expired, icon: "❌", color: "#EF4444" },
                { label: "Устройств", value: stats.devices, icon: "📱", color: "#1A6B9A" },
                { label: "Доход/мес", value: `$${stats.revenue}`, icon: "💰", color: "#C9A84C" },
              ].map(s => (
                <div key={s.label} style={{ padding: m ? 16 : 20, background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: m ? 22 : 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#8BA7BE", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>⚠️ Истекают скоро</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clients.filter(c => c.status === "trial" || c.status === "expired").map(c => (
                <div key={c.id} style={{ padding: "16px 20px", background: "#0D1B2A", border: `1px solid ${statusConfig[c.status].color}33`, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#8BA7BE" }}>{c.phone} · {c.tariff}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 12, color: "#8BA7BE" }}>до {c.to}</div>
                    <span style={{ padding: "4px 12px", background: statusConfig[c.status].bg, borderRadius: 100, fontSize: 12, color: statusConfig[c.status].color, fontWeight: 600 }}>
                      {statusConfig[c.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {tab === "clients" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: m ? 22 : 28, fontWeight: 700, color: "#fff" }}>Клиенты</h1>
              <button onClick={() => setShowAdd(true)} style={{ padding: "10px 20px", background: "#C9A84C", border: "none", borderRadius: 8, color: "#080C12", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Добавить
              </button>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Поиск по имени или телефону..."
              style={{ width: "100%", padding: "12px 16px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(c => (
                <div key={c.id} onClick={() => setSelectedClient(c)} style={{ padding: m ? 16 : "20px 24px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: m ? 14 : 16, fontWeight: 700, color: "#fff" }}>{c.name}</span>
                        <span style={{ padding: "3px 10px", background: statusConfig[c.status].bg, borderRadius: 100, fontSize: 11, color: statusConfig[c.status].color, fontWeight: 600 }}>
                          {statusConfig[c.status].label}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 6 }}>{c.phone} · {c.type}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: tariffColors[c.tariff], fontWeight: 600 }}>{c.tariff}</span>
                        <span style={{ fontSize: 12, color: "#8BA7BE" }}>🎵 {genreNames[c.genre]}</span>
                        {c.device && <span style={{ fontSize: 12, color: "#1A6B9A" }}>📱 {c.device}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#8BA7BE" }}>Действует до</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.status === "expired" ? "#EF4444" : "#fff" }}>{c.to}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEVICES */}
        {tab === "devices" && (
          <div>
            <h1 style={{ fontSize: m ? 22 : 28, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Устройства</h1>
            <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 14 }}>
              {clients.filter(c => c.device).map(c => (
                <div key={c.id} style={{ padding: 24, background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{c.device}</div>
                      <div style={{ fontSize: 13, color: "#8BA7BE" }}>{c.name}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(34,197,94,0.1)", borderRadius: 100 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                      <span style={{ fontSize: 12, color: "#22C55E" }}>Онлайн</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Тариф", value: c.tariff },
                      { label: "Жанр", value: genreNames[c.genre] },
                      { label: "С", value: c.from },
                      { label: "До", value: c.to },
                    ].map(item => (
                      <div key={item.label} style={{ background: "#162435", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CLIENT MODAL */}
      {selectedClient && (
        <div onClick={() => setSelectedClient(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{selectedClient.name}</h2>
              <button onClick={() => setSelectedClient(null)} style={{ background: "none", border: "none", color: "#8BA7BE", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "Телефон", value: selectedClient.phone },
                { label: "Тип", value: selectedClient.type },
                { label: "Тариф", value: selectedClient.tariff },
                { label: "Жанр", value: genreNames[selectedClient.genre] },
                { label: "Устройство", value: selectedClient.device || "Нет (веб-плеер)" },
                { label: "Статус", value: statusConfig[selectedClient.status].label },
                { label: "Подключён с", value: selectedClient.from },
                { label: "Действует до", value: selectedClient.to },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <a href={`tel:${selectedClient.phone}`} style={{ flex: 1, padding: 12, background: "#C9A84C", borderRadius: 8, color: "#080C12", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                📞 Позвонить
              </a>
              <a href="https://t.me/fonmusic2026" style={{ flex: 1, padding: 12, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                ✉️ Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>+ Новый клиент</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: "#8BA7BE", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Название заведения", "Телефон", "Тариф", "Жанр", "ID устройства (если есть)", "Дата начала", "Дата окончания"].map(placeholder => (
                <input key={placeholder} placeholder={placeholder}
                  style={{ padding: "12px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
              ))}
            </div>
            <button style={{ width: "100%", marginTop: 20, padding: 14, background: "#C9A84C", border: "none", borderRadius: 8, color: "#080C12", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Сохранить
            </button>
          </div>
        </div>
      )}

      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } html, body { max-width: 100vw; overflow-x: hidden; }`}</style>
    </main>
  );
}
