"use client";
import { useState } from "react";

const mockLocations = [
  { id: 1, name: "Lacoste", address: "Tashkent City Mall", status: "online", device: "P7-001", genre: "Лаунж", tariff: "Премиум", since: "01.02.2026" },
  { id: 2, name: "Zara", address: "Tashkent City Mall", status: "online", device: "P7-002", genre: "Поп", tariff: "Премиум", since: "15.02.2026" },
  { id: 3, name: "Кафе Plov", address: "Чиланзар, ул. Буюк Ипак Йули", status: "offline", device: "P7-003", genre: "Джаз", tariff: "Стандарт", since: "10.01.2026" },
  { id: 4, name: "H&M", address: "Tashkent City Mall", status: "online", device: "P7-004", genre: "Поп", tariff: "Премиум", since: "20.02.2026" },
  { id: 5, name: "Фитнес Pro", address: "Мирзо-Улугбек", status: "online", device: "P7-005", genre: "Энергичный", tariff: "Стандарт", since: "01.03.2026" },
  { id: 6, name: "Ресторан Navat", address: "Юнусабад", status: "offline", device: "P7-006", genre: "Эмбиент", tariff: "Стандарт", since: "05.02.2026" },
];

const genres = ["Джаз", "Лаунж", "Поп", "Классика", "Эмбиент", "Босса-нова", "Инди", "Фанк", "Энергичный"];
const tariffs = ["Базовый", "Стандарт", "Премиум"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [locations, setLocations] = useState(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", genre: "Джаз", tariff: "Стандарт" });

  const online = locations.filter(l => l.status === "online").length;
  const offline = locations.filter(l => l.status === "offline").length;

  const stats = [
    { label: "Всего локаций", value: locations.length, color: "#C9A84C" },
    { label: "Онлайн", value: online, color: "#22C55E" },
    { label: "Офлайн", value: offline, color: "#EF4444" },
    { label: "Выручка/мес", value: "4.2M", color: "#1A6B9A" },
  ];

  const tabs = [
    { id: "dashboard", label: "Дашборд", icon: "📊" },
    { id: "locations", label: "Локации", icon: "📍" },
    { id: "devices", label: "Устройства", icon: "📱" },
    { id: "clients", label: "Клиенты", icon: "👥" },
  ];

  const handleRestart = (id: number) => {
    alert(`Устройство на локации #${id} перезагружается...`);
  };

  const handleGenreChange = (id: number, genre: string) => {
    setLocations(locations.map(l => l.id === id ? { ...l, genre } : l));
  };

  const handleAddLocation = () => {
    const newId = locations.length + 1;
    setLocations([...locations, {
      id: newId,
      name: newLocation.name,
      address: newLocation.address,
      status: "offline",
      device: `P7-00${newId}`,
      genre: newLocation.genre,
      tariff: newLocation.tariff,
      since: new Date().toLocaleDateString("ru-RU"),
    }]);
    setShowAddModal(false);
    setNewLocation({ name: "", address: "", genre: "Джаз", tariff: "Стандарт" });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080C12", color: "#E8EFF5", fontFamily: "Georgia, serif" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 240, background: "#0D1B2A",
        borderRight: "1px solid rgba(201,168,76,0.15)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "fixed", top: 0, left: 0, bottom: 0,
      }}>
        <div style={{ padding: "0 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 24, background: "#C9A84C", borderRadius: 2 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic</span>
          </div>
          <div style={{ fontSize: 11, color: "#8BA7BE", marginTop: 4, marginLeft: 14 }}>Админ панель</div>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: "12px 16px",
              background: activeTab === tab.id ? "rgba(201,168,76,0.1)" : "transparent",
              border: activeTab === tab.id ? "1px solid rgba(201,168,76,0.3)" : "1px solid transparent",
              borderRadius: 8, cursor: "pointer",
              color: activeTab === tab.id ? "#C9A84C" : "#8BA7BE",
              fontSize: 14, marginBottom: 4, textAlign: "left",
            }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === "locations" && (
                <span style={{
                  marginLeft: "auto", background: "#EF4444",
                  color: "#fff", fontSize: 10, padding: "2px 6px",
                  borderRadius: 100, display: offline > 0 ? "block" : "none",
                }}>{offline}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 12, color: "#8BA7BE" }}>Версия 1.0.0</div>
          <a href="/" style={{ fontSize: 12, color: "#C9A84C", textDecoration: "none" }}>← На сайт</a>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: 240, flex: 1, padding: 32 }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Дашборд</h1>
            <p style={{ color: "#8BA7BE", marginBottom: 32 }}>Обзор всех локаций и устройств</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
              {stats.map(stat => (
                <div key={stat.label} style={{
                  background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: 24,
                }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Статус локаций</h2>
            <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
              {locations.map((loc, i) => (
                <div key={loc.id} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 24px",
                  borderBottom: i < locations.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: loc.status === "online" ? "#22C55E" : "#EF4444",
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{loc.name}</div>
                    <div style={{ fontSize: 12, color: "#8BA7BE" }}>{loc.address}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#8BA7BE" }}>{loc.device}</div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 100, fontSize: 11,
                    background: loc.status === "online" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: loc.status === "online" ? "#22C55E" : "#EF4444",
                    border: `1px solid ${loc.status === "online" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}>
                    {loc.status === "online" ? "Онлайн" : "Офлайн"}
                  </div>
                  <div style={{ fontSize: 12, color: "#C9A84C" }}>{loc.genre}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOCATIONS */}
        {activeTab === "locations" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Локации</h1>
                <p style={{ color: "#8BA7BE" }}>Управление всеми точками</p>
              </div>
              <button onClick={() => setShowAddModal(true)} style={{
                padding: "12px 24px", background: "#C9A84C", color: "#080C12",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>+ Добавить локацию</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {locations.map(loc => (
                <div key={loc.id} style={{
                  background: "#0D1B2A", border: `1px solid ${loc.status === "offline" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, padding: 24,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{loc.name}</div>
                      <div style={{ fontSize: 12, color: "#8BA7BE", marginTop: 2 }}>{loc.address}</div>
                    </div>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", marginTop: 4,
                      background: loc.status === "online" ? "#22C55E" : "#EF4444",
                    }} />
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: 100, fontSize: 11,
                      background: "rgba(201,168,76,0.1)", color: "#C9A84C",
                      border: "1px solid rgba(201,168,76,0.3)",
                    }}>{loc.tariff}</span>
                    <span style={{
                      padding: "3px 8px", borderRadius: 100, fontSize: 11,
                      background: "rgba(26,107,154,0.1)", color: "#8BA7BE",
                      border: "1px solid rgba(26,107,154,0.3)",
                    }}>{loc.device}</span>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#8BA7BE", marginBottom: 6 }}>Жанр музыки</div>
                    <select value={loc.genre} onChange={e => handleGenreChange(loc.id, e.target.value)} style={{
                      width: "100%", padding: "8px 12px",
                      background: "#162435", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6, color: "#fff", fontSize: 13, cursor: "pointer",
                    }}>
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleRestart(loc.id)} style={{
                      flex: 1, padding: "8px", background: "rgba(26,107,154,0.2)",
                      border: "1px solid rgba(26,107,154,0.3)", borderRadius: 6,
                      color: "#8BA7BE", fontSize: 12, cursor: "pointer",
                    }}>🔄 Перезагрузить</button>
                    <button onClick={() => setSelectedLocation(loc)} style={{
                      flex: 1, padding: "8px", background: "rgba(201,168,76,0.1)",
                      border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6,
                      color: "#C9A84C", fontSize: 12, cursor: "pointer",
                    }}>📄 Сертификат</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEVICES */}
        {activeTab === "devices" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Устройства</h1>
            <p style={{ color: "#8BA7BE", marginBottom: 32 }}>Мониторинг всех Android TV боксов</p>

            <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr 100px 120px",
                padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 11, color: "#8BA7BE", letterSpacing: "0.05em",
              }}>
                <div>СТАТУС</div><div>УСТРОЙСТВО</div><div>ЛОКАЦИЯ</div>
                <div>ЖАНР</div><div>ТАРИФ</div><div>ДЕЙСТВИЯ</div>
              </div>
              {locations.map((loc, i) => (
                <div key={loc.id} style={{
                  display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr 100px 120px",
                  padding: "16px 24px", alignItems: "center",
                  borderBottom: i < locations.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 12,
                    color: loc.status === "online" ? "#22C55E" : "#EF4444",
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: loc.status === "online" ? "#22C55E" : "#EF4444" }} />
                    {loc.status === "online" ? "Online" : "Offline"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{loc.device}</div>
                    <div style={{ fontSize: 11, color: "#8BA7BE" }}>Android TV P7</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#E8EFF5" }}>{loc.name}</div>
                    <div style={{ fontSize: 11, color: "#8BA7BE" }}>{loc.address}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#C9A84C" }}>{loc.genre}</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE" }}>{loc.tariff}</div>
                  <button onClick={() => handleRestart(loc.id)} style={{
                    padding: "6px 12px", background: "rgba(26,107,154,0.2)",
                    border: "1px solid rgba(26,107,154,0.3)", borderRadius: 6,
                    color: "#8BA7BE", fontSize: 11, cursor: "pointer",
                  }}>🔄 Рестарт</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === "clients" && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Клиенты</h1>
            <p style={{ color: "#8BA7BE", marginBottom: 32 }}>Управление клиентами и тарифами</p>

            <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px 100px",
                padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 11, color: "#8BA7BE", letterSpacing: "0.05em",
              }}>
                <div>КЛИЕНТ</div><div>АДРЕС</div><div>ТАРИФ</div><div>С ДАТЫ</div><div>СТАТУС</div>
              </div>
              {locations.map((loc, i) => (
                <div key={loc.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px 100px",
                  padding: "16px 24px", alignItems: "center",
                  borderBottom: i < locations.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{loc.name}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE" }}>{loc.address}</div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 100, fontSize: 11, textAlign: "center",
                    background: "rgba(201,168,76,0.1)", color: "#C9A84C",
                    border: "1px solid rgba(201,168,76,0.3)",
                  }}>{loc.tariff}</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE" }}>{loc.since}</div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 100, fontSize: 11, textAlign: "center",
                    background: loc.status === "online" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: loc.status === "online" ? "#22C55E" : "#EF4444",
                    border: `1px solid ${loc.status === "online" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}>{loc.status === "online" ? "Активен" : "Проблема"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 16, padding: 40, width: 480,
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Новая локация</h2>
            {[
              { label: "Название заведения", key: "name", placeholder: "Например: Кафе Навруз" },
              { label: "Адрес", key: "address", placeholder: "Район, улица" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{field.label}</div>
                <input
                  value={(newLocation as any)[field.key]}
                  onChange={e => setNewLocation({ ...newLocation, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "#162435", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, color: "#fff", fontSize: 14,
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Жанр</div>
              <select value={newLocation.genre} onChange={e => setNewLocation({ ...newLocation, genre: e.target.value })} style={{
                width: "100%", padding: "10px 14px",
                background: "#162435", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#fff", fontSize: 14,
              }}>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Тариф</div>
              <select value={newLocation.tariff} onChange={e => setNewLocation({ ...newLocation, tariff: e.target.value })} style={{
                width: "100%", padding: "10px 14px",
                background: "#162435", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#fff", fontSize: 14,
              }}>
                {tariffs.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{
                flex: 1, padding: "12px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                color: "#8BA7BE", cursor: "pointer", fontSize: 14,
              }}>Отмена</button>
              <button onClick={handleAddLocation} style={{
                flex: 1, padding: "12px", background: "#C9A84C",
                border: "none", borderRadius: 8,
                color: "#080C12", cursor: "pointer", fontSize: 14, fontWeight: 700,
              }}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedLocation && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", color: "#000",
            borderRadius: 16, padding: 48, width: 520,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>JAMENDO LICENSING</div>
            <div style={{ fontSize: 16, color: "#666", marginBottom: 32 }}>Certificate</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{selectedLocation.name}</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>{selectedLocation.address}</div>
            <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8, marginBottom: 32, textAlign: "left" }}>
              JAMENDO SA guarantees that the above-mentioned store has a valid license of use that includes the right to reproduce, to play and broadcast a selection of musical works being part of its "JAMENDO LICENSING" Catalog in public places for background music.
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 32 }}>
              Valid: {new Date().toLocaleDateString("en-GB")} — {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("en-GB")}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setSelectedLocation(null)} style={{
                flex: 1, padding: "12px", background: "#f5f5f5",
                border: "1px solid #ddd", borderRadius: 8,
                color: "#333", cursor: "pointer", fontSize: 14,
              }}>Закрыть</button>
              <button onClick={() => window.print()} style={{
                flex: 1, padding: "12px", background: "#C9A84C",
                border: "none", borderRadius: 8,
                color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
              }}>🖨️ Распечатать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
