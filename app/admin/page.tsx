"use client";
import { useState, useEffect } from "react";

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

function getDaysLeft(expiresAt: string): number {
  if (!expiresAt) return 0;
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU");
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

const PLAN_LABELS: Record<string, { label: string, color: string }> = {
  trial:    { label: "Демо",     color: "#C9A84C" },
  basic:    { label: "Базовый",  color: "#8BA7BE" },
  standard: { label: "Стандарт", color: "#22C55E" },
  premium:  { label: "Премиум",  color: "#A78BFA" },
};

function getRequestedPlan(notes?: string) {
  const match = notes?.match(/Тариф:\s*(basic|standard|premium)/);
  return match?.[1] || null;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (authed) loadClients();
  }, [authed]);

  const loadClients = async () => {
    setLoading(true);
    const data = await sb("clients?select=*&order=created_at.desc");
    if (data) setClients(data);
    setLoading(false);
  };

  const updatePlan = async (clientId: string, plan: string) => {
    setSaving(clientId);
    const extra: any = { plan };
    if (plan === "trial") {
      const trialUntil = new Date();
      trialUntil.setDate(trialUntil.getDate() + 7);
      extra.trial_until = trialUntil.toISOString();
      extra.demo_expires_at = trialUntil.toISOString();
      extra.subscription_status = "demo";
    } else {
      extra.subscription_status = "active";
      extra.demo_expires_at = null;
      extra.trial_until = null;
    }
    await sb(`clients?id=eq.${clientId}`, { method: "PATCH", body: JSON.stringify(extra) });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...extra } : c));
    setSaving(null);
    setSuccess("Тариф обновлён");
    setTimeout(() => setSuccess(""), 2000);
  };

  const activateSubscription = async (client: any, plan: string, months: number) => {
    setSaving(client.id);
    const currentExpiry = client.demo_expires_at ? new Date(client.demo_expires_at) : null;
    const baseDate = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
    const paidUntil = addMonths(baseDate, months);
    const extra = {
      plan,
      subscription_status: "active",
      demo_expires_at: paidUntil.toISOString(),
      trial_until: null,
    };
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify(extra) });
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, ...extra } : c));
    setSaving(null);
    setSuccess(`Подписка активна на ${months} мес. до ${formatDate(paidUntil.toISOString())}`);
    setTimeout(() => setSuccess(""), 2500);
  };

  const extendDemo = async (clientId: string, days: number) => {
    setSaving(clientId);
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    const extra = {
      demo_expires_at: newExpiry.toISOString(),
      trial_until: newExpiry.toISOString(),
      subscription_status: "demo",
      plan: "trial",
    };
    await sb(`clients?id=eq.${clientId}`, { method: "PATCH", body: JSON.stringify(extra) });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...extra } : c));
    setSaving(null);
    setSuccess(`Демо продлён на ${days} дней`);
    setTimeout(() => setSuccess(""), 2000);
  };

  const toggleStatus = async (clientId: string, currentStatus: string) => {
    setSaving(clientId);
    const newStatus = currentStatus === "expired" ? "demo" : "expired";
    await sb(`clients?id=eq.${clientId}`, { method: "PATCH", body: JSON.stringify({ subscription_status: newStatus }) });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, subscription_status: newStatus } : c));
    setSaving(null);
    setSuccess("Статус изменён");
    setTimeout(() => setSuccess(""), 2000);
  };

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search);
    const matchPlan = filterPlan === "all" || c.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const getClientGroup = (client: any) => {
    const requestedPlan = getRequestedPlan(client.notes);
    if (requestedPlan && client.plan !== requestedPlan) return "requests";
    if (client.subscription_status === "expired") return "expired";
    if (client.plan === "trial" || client.subscription_status === "demo") return "trial";
    if (client.subscription_status === "active" && ["basic", "standard", "premium"].includes(client.plan)) return "paid";
    return "other";
  };

  const clientGroups = [
    { key: "requests", title: "Заявки на подключение", hint: "Клиенты, которые выбрали тариф и ждут активации", color: "#C9A84C" },
    { key: "expired", title: "Истёкшие / заблокированные", hint: "Нужно продлить или восстановить доступ", color: "#EF4444" },
    { key: "trial", title: "Демо-период", hint: "Новые клиенты на тестовом доступе", color: "#C9A84C" },
    { key: "paid", title: "Платные клиенты", hint: "Активные подписки", color: "#22C55E" },
    { key: "other", title: "Прочие", hint: "Клиенты без явного статуса", color: "#8BA7BE" },
  ].map(group => ({
    ...group,
    clients: filtered.filter(client => getClientGroup(client) === group.key),
  }));

  const adminLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setAuthError("Неверный пароль");
      return;
    }
    sessionStorage.setItem("fonmusic_admin", "1");
    setAuthed(true);
  };

  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ width: "100%", maxWidth: 360, padding: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, background: "#C9A84C", borderRadius: 2 }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic Admin</span>
            </div>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && adminLogin()}
            placeholder="Пароль администратора"
            style={{ width: "100%", padding: "14px 16px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", marginBottom: 12, boxSizing: "border-box" }}
          />
          <button
            onClick={() => {
  adminLogin();
}}
            style={{ width: "100%", padding: "14px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#0A1628", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
          >
            Войти
          </button>
          {authError && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#EF4444", textAlign: "center" }}>{authError}</div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0A1628", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>
      <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 18, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>FonMusic Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#4a5a6a" }}>Клиентов: {clients.length}</span>
          <button onClick={loadClients} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            🔄 Обновить
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {success && (
          <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontSize: 13, color: "#22C55E", marginBottom: 16 }}>
            ✓ {success}
          </div>
        )}

        {/* СТАТИСТИКА */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Всего клиентов", value: clients.length, color: "#8BA7BE" },
            { label: "На демо", value: clients.filter(c => c.plan === "trial").length, color: "#C9A84C" },
            { label: "Платные", value: clients.filter(c => ["basic","standard","premium"].includes(c.plan)).length, color: "#22C55E" },
            { label: "Истёкшие", value: clients.filter(c => c.subscription_status === "expired").length, color: "#EF4444" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#8BA7BE" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ФИЛЬТРЫ */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none" }}
          />
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            style={{ padding: "10px 14px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none" }}
          >
            <option value="all">Все тарифы</option>
            <option value="trial">Демо</option>
            <option value="basic">Базовый</option>
            <option value="standard">Стандарт</option>
            <option value="premium">Премиум</option>
          </select>
        </div>

        {/* СПИСОК */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#8BA7BE" }}>⏳ Загрузка...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {clientGroups.filter(group => group.clients.length > 0).map(group => (
              <section key={group.key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "4px 0 10px", padding: "0 2px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: group.color, boxShadow: `0 0 14px ${group.color}55` }} />
                      <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>{group.title}</h2>
                      <span style={{ fontSize: 11, color: group.color, background: `${group.color}18`, border: `1px solid ${group.color}30`, borderRadius: 100, padding: "2px 8px", fontWeight: 800 }}>
                        {group.clients.length}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#4a5a6a", marginTop: 3 }}>{group.hint}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.clients.map(c => {
              const plan = PLAN_LABELS[c.plan] || { label: c.plan || "—", color: "#8BA7BE" };
              const daysLeft = c.demo_expires_at ? getDaysLeft(c.demo_expires_at) : null;
              const isExpired = c.subscription_status === "expired";
              const isPaid = c.subscription_status === "active" && ["basic", "standard", "premium"].includes(c.plan);
              const requestedPlan = getRequestedPlan(c.notes);
              const requestedPlanInfo = requestedPlan ? PLAN_LABELS[requestedPlan] : null;

              return (
                <div key={c.id} style={{ background: "#0D1B2A", border: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

                    {/* Инфо */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 2 }}>📞 {c.phone} · 🔑 {c.password}</div>
                      <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 2 }}>🏢 {c.business_type}</div>
                      <div style={{ fontSize: 11, color: "#4a5a6a" }}>Зарегистрирован: {formatDate(c.created_at)}</div>
                    </div>

                    {/* Статус */}
                    <div style={{ minWidth: 160 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: `${plan.color}20`, border: `1px solid ${plan.color}40`, borderRadius: 100, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: plan.color }}>{plan.label}</span>
                      </div>
                      {isExpired && (
                        <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 4 }}>❌ Доступ заблокирован</div>
                      )}
                      {c.plan === "trial" && daysLeft !== null && (
                        <div style={{ fontSize: 11, color: daysLeft <= 2 ? "#EF4444" : "#C9A84C" }}>
                          ⏱ Осталось: {daysLeft} дн. (до {formatDate(c.demo_expires_at)})
                        </div>
                      )}
                      {isPaid && c.demo_expires_at && (
                        <div style={{ fontSize: 11, color: daysLeft !== null && daysLeft <= 7 ? "#F59E0B" : "#22C55E" }}>
                          ✅ Активен до: {formatDate(c.demo_expires_at)}{daysLeft !== null ? ` · ${daysLeft} дн.` : ""}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "#4a5a6a", marginTop: 4 }}>
                        {c.playback_target === "box" ? "📦 Box" : "🌐 Веб-плеер"}
                      </div>
                      {requestedPlanInfo && c.plan !== requestedPlan && (
                        <div style={{ fontSize: 11, color: requestedPlanInfo.color, marginTop: 6, fontWeight: 700 }}>
                          💳 Заявка: {requestedPlanInfo.label}
                        </div>
                      )}
                    </div>

                    {/* Действия */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
                      <div style={{ fontSize: 11, color: "#4a5a6a", marginBottom: 2 }}>Изменить тариф:</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {["trial", "basic", "standard", "premium"].map(p => (
                          <button
                            key={p}
                            onClick={() => updatePlan(c.id, p)}
                            disabled={saving === c.id || c.plan === p}
                            style={{
                              padding: "4px 8px", borderRadius: 6, cursor: c.plan === p ? "default" : "pointer",
                              fontFamily: "Georgia, serif", fontSize: 10, fontWeight: 700,
                              background: c.plan === p ? `${PLAN_LABELS[p]?.color}30` : "rgba(255,255,255,0.05)",
                              border: `1px solid ${c.plan === p ? `${PLAN_LABELS[p]?.color}60` : "rgba(255,255,255,0.1)"}`,
                              color: c.plan === p ? PLAN_LABELS[p]?.color : "#8BA7BE",
                            }}
                          >
                            {PLAN_LABELS[p]?.label}
                          </button>
                        ))}
                      </div>

                      {requestedPlanInfo && c.plan !== requestedPlan && (
                        <>
                          <div style={{ fontSize: 11, color: requestedPlanInfo.color, marginTop: 4, fontWeight: 700 }}>
                            Активировать заявку:
                          </div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {[1, 3, 6, 9, 12].map(months => (
                              <button
                                key={months}
                                onClick={() => requestedPlan && activateSubscription(c, requestedPlan, months)}
                                disabled={saving === c.id}
                                style={{ padding: "5px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10, fontWeight: 800, background: `${requestedPlanInfo.color}22`, border: `1px solid ${requestedPlanInfo.color}55`, color: requestedPlanInfo.color }}
                              >
                                {months} мес.
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {["basic", "standard", "premium"].includes(c.plan) && (
                        <>
                          <div style={{ fontSize: 11, color: "#4a5a6a", marginTop: 4 }}>Оплаченная подписка:</div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {[3, 6, 9, 12].map(months => (
                              <button
                                key={months}
                                onClick={() => activateSubscription(c, c.plan, months)}
                                disabled={saving === c.id}
                                style={{ padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" }}
                              >
                                +{months} мес.
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {(c.plan === "trial" || isExpired) && (
                        <>
                          <div style={{ fontSize: 11, color: "#4a5a6a", marginTop: 4 }}>Продлить демо:</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[7, 14, 30].map(days => (
                              <button
                                key={days}
                                onClick={() => extendDemo(c.id, days)}
                                disabled={saving === c.id}
                                style={{ padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 10, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
                              >
                                +{days} дней
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      <button
                        onClick={() => toggleStatus(c.id, c.subscription_status)}
                        disabled={saving === c.id}
                        style={{
                          padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 11, marginTop: 2,
                          background: isExpired ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                          border: `1px solid ${isExpired ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                          color: isExpired ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {isExpired ? "✓ Восстановить доступ" : "✗ Заблокировать"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
                </div>
              </section>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#8BA7BE" }}>Клиентов не найдено</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
