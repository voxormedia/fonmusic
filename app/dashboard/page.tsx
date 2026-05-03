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

const STATION_LABELS: Record<string, { ru: string, uz: string, icon: string }> = {
  cozy_coffee:     { ru: "Для кофеен",    uz: "Qahvaxonalar uchun", icon: "☕" },
  cocktail_dinner: { ru: "Для ужина",     uz: "Kechki ovqat uchun", icon: "🍽️" },
  cool_calm:       { ru: "Спокойная",     uz: "Tinch",              icon: "🎵" },
  lounge:          { ru: "Лаунж",         uz: "Lounj",              icon: "🏨" },
  luxury:          { ru: "Премиальная",   uz: "Premium",            icon: "✨" },
  shopping_vibes:  { ru: "Для магазинов", uz: "Do'konlar uchun",    icon: "🛍️" },
  spa_garden:      { ru: "Для SPA",       uz: "SPA uchun",          icon: "💆" },
  workout:         { ru: "Для фитнеса",   uz: "Fitnes uchun",       icon: "💪" },
  on_the_rocks:    { ru: "Для баров",     uz: "Barlar uchun",       icon: "🎸" },
  best_of_radio:   { ru: "Универсальная", uz: "Universal",          icon: "⭐" },
};

const BUSINESS_TYPES_RU = [
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

const BUSINESS_TYPES_UZ = [
  { label: "Kafe / qahvaxona", template: "cafe_standard", station: "cozy_coffee" },
  { label: "Restoran", template: "restaurant_standard", station: "cocktail_dinner" },
  { label: "Bar / lounge bar", template: "bar_evening", station: "on_the_rocks" },
  { label: "Do'kon / butik", template: "retail_standard", station: "shopping_vibes" },
  { label: "Supermarket", template: "market_standard", station: "best_of_radio" },
  { label: "SPA / salon", template: "spa_standard", station: "spa_garden" },
  { label: "Go'zallik saloni", template: "beauty_standard", station: "cool_calm" },
  { label: "Fitnes / sport zal", template: "fitness_standard", station: "workout" },
  { label: "Mehmonxona / lobbi", template: "hotel_standard", station: "lounge" },
];

const T = {
  ru: {
    loading: "⏳ Загрузка...",
    paywall_h: "Тестовый период завершён",
    paywall_p: "Подключите подписку чтобы продолжить",
    paywall_btn: "Выбрать тариф →",
    add_modal_h: "➕ Добавить заведение",
    add_name: "Название *",
    add_name_ph: "Кафе Уют — Чиланзар",
    add_address: "Адрес",
    add_address_ph: "ул. Навои, 12",
    add_biz_type: "Тип заведения",
    add_device: "Устройство",
    add_web: "🎧 Веб-плеер",
    add_box: "📦 FonMusic Box",
    add_btn: "Добавить",
    add_btn_loading: "Добавляем...",
    add_cancel: "Отмена",
    demo_badge: "Демо",
    demo_days: "дн.",
    logout: "Выйти",
    plan_premium: "Премиум", plan_standard: "Стандарт", plan_basic: "Базовый", plan_trial: "Демо период",
    plan_active: "Активная подписка",
    plan_until: "Доступ до",
    plan_change: "Изменить тариф →", plan_choose: "Выбрать тариф →",
    demo_banner: "🕐 Тестовый период: осталось",
    demo_days_left: "дней",
    demo_connect: "Подключить →",
    locations_h: "🏢 Мои заведения",
    locations_count: "из",
    locations_points: "точек",
    add_location_btn: "➕ Добавить заведение",
    add_location_premium: "✨ Добавить точки (Премиум)",
    web_player: "🎧 Веб-плеер",
    box_device: "📦 FonMusic Box",
    auto_mode: "🔄 Авто",
    manual_mode: "✋ Вручную",
    open_player: "▶ Открыть плеер",
    preview: "👁 Посмотреть без влияния",
    manage: "🎛️ Управлять",
    no_locations: "Нет заведений",
    no_locations_sub: "Добавьте первое заведение",
    support_h: "💬 Поддержка",
    password_h: "🔑 Пароль",
    password_change: "Изменить",
    password_cancel: "Отмена",
    password_old: "Текущий пароль",
    password_new: "Новый пароль",
    password_save: "Сохранить",
    password_error_wrong: "Неверный текущий пароль",
    password_error_short: "Пароль не менее 4 символов",
    password_success: "Пароль изменён!",
  },
  uz: {
    loading: "⏳ Yuklanmoqda...",
    paywall_h: "Sinov davri tugadi",
    paywall_p: "Davom etish uchun obunani ulang",
    paywall_btn: "Tarifni tanlash →",
    add_modal_h: "➕ Muassasa qo'shish",
    add_name: "Nomi *",
    add_name_ph: "Kafe Uyut — Chilonzor",
    add_address: "Manzil",
    add_address_ph: "Navoiy ko'chasi, 12",
    add_biz_type: "Muassasa turi",
    add_device: "Qurilma",
    add_web: "🎧 Veb-pleer",
    add_box: "📦 FonMusic Box",
    add_btn: "Qo'shish",
    add_btn_loading: "Qo'shilmoqda...",
    add_cancel: "Bekor qilish",
    demo_badge: "Demo",
    demo_days: "kun",
    logout: "Chiqish",
    plan_premium: "Premium", plan_standard: "Standart", plan_basic: "Asosiy", plan_trial: "Demo davr",
    plan_active: "Faol obuna",
    plan_until: "Kirish muddati",
    plan_change: "Tarifni o'zgartirish →", plan_choose: "Tarifni tanlash →",
    demo_banner: "🕐 Sinov davri: qoldi",
    demo_days_left: "kun",
    demo_connect: "Ulash →",
    locations_h: "🏢 Mening muassasalarim",
    locations_count: "dan",
    locations_points: "nuqta",
    add_location_btn: "➕ Muassasa qo'shish",
    add_location_premium: "✨ Nuqtalar qo'shish (Premium)",
    web_player: "🎧 Veb-pleer",
    box_device: "📦 FonMusic Box",
    auto_mode: "🔄 Avto",
    manual_mode: "✋ Qo'lda",
    open_player: "▶ Pleerni ochish",
    preview: "👁 Ta'sir qilmasdan ko'rish",
    manage: "🎛️ Boshqarish",
    no_locations: "Muassasalar yo'q",
    no_locations_sub: "Birinchi muassasani qo'shing",
    support_h: "💬 Yordam",
    password_h: "🔑 Parol",
    password_change: "O'zgartirish",
    password_cancel: "Bekor qilish",
    password_old: "Joriy parol",
    password_new: "Yangi parol",
    password_save: "Saqlash",
    password_error_wrong: "Joriy parol noto'g'ri",
    password_error_short: "Parol kamida 4 ta belgi",
    password_success: "Parol o'zgartirildi!",
  },
};

function getDaysLeft(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

const PLAN_MAX_LOCATIONS: Record<string, number> = {
  trial: 1, basic: 1, standard: 1, premium: 10,
};

function hasDemoAccess(client: any) {
  if (!client) return false;
  if (client.subscription_status === "demo" || client.plan === "trial") return true;
  const demoUntil = client.demo_expires_at || client.trial_until;
  return Boolean(demoUntil && new Date(demoUntil) > new Date());
}

function getEffectiveMaxLocations(client: any) {
  if (hasDemoAccess(client)) return PLAN_MAX_LOCATIONS.premium;
  return PLAN_MAX_LOCATIONS[client?.plan || "trial"] || 1;
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<"loading" | "locations" | "paywall">("loading");
  const [client, setClient] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<"ru" | "uz">("ru");

  // Modal state
  const [modalName, setModalName] = useState("");
  const [modalAddress, setModalAddress] = useState("");
  const [modalBusinessType, setModalBusinessType] = useState(0);
  const [modalDeviceType, setModalDeviceType] = useState("web");
  const [modalSaving, setModalSaving] = useState(false);

  const t = T[lang];
  const BUSINESS_TYPES = lang === "ru" ? BUSINESS_TYPES_RU : BUSINESS_TYPES_UZ;

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    const sessionExpiry = localStorage.getItem("fonmusic_session_expiry");
    if (!clientId || !sessionExpiry || new Date(sessionExpiry) < new Date()) {
      localStorage.removeItem("fonmusic_client_id");
      localStorage.removeItem("fonmusic_session_expiry");
      window.location.href = "/login";
      return;
    }
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
    if (!localStorage.getItem("fonmusic_dashboard_welcome_done")) {
      setShowWelcome(true);
    }
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

  const openPreview = (loc: any) => {
    window.location.href = `/preview?location_id=${loc.id}`;
  };

  const addLocation = async () => {
    if (!modalName) return;
    setModalSaving(true);
    const bt = BUSINESS_TYPES[modalBusinessType];
    const loc = await sb("locations", {
      method: "POST",
      body: JSON.stringify({
        client_id: client.id,
        name: modalName,
        address: modalAddress,
        device_type: modalDeviceType,
        station_key: bt.station,
        template_key: bt.template,
        default_template_key: bt.template,
        music_mode: "automatic",
        is_active: true,
      }),
    });
    setModalSaving(false);
    if (loc && loc.length > 0) {
      setLocations(prev => [...prev, loc[0]]);
      setShowAddModal(false);
      setModalName(""); setModalAddress(""); setModalBusinessType(0); setModalDeviceType("web");
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) return;
    setPasswordError("");
    if (oldPassword !== client.password) { setPasswordError(t.password_error_wrong); return; }
    if (newPassword.length < 4) { setPasswordError(t.password_error_short); return; }
    setSaving(true);
    await sb(`clients?id=eq.${client.id}`, { method: "PATCH", body: JSON.stringify({ password: newPassword }) });
    setClient({ ...client, password: newPassword });
    setSaving(false);
    setPasswordSuccess(t.password_success);
    setOldPassword(""); setNewPassword("");
    setTimeout(() => { setPasswordSuccess(""); setShowChangePassword(false); }, 2000);
  };

  const logout = () => {
    localStorage.removeItem("fonmusic_client_id");
    localStorage.removeItem("fonmusic_session_expiry");
    window.location.href = "/login";
  };

  const demoAccess = hasDemoAccess(client);
  const maxLocations = getEffectiveMaxLocations(client);
  const canAddLocation = locations.length < maxLocations;
  const primaryLocation = locations[0] || null;
  const primaryStationInfo = primaryLocation
    ? STATION_LABELS[primaryLocation.station_key] || { ru: primaryLocation.station_key, uz: primaryLocation.station_key, icon: "🎵" }
    : null;
  const primaryStationName = primaryStationInfo ? primaryStationInfo[lang] : "";
  const primaryIsWeb = primaryLocation?.device_type !== "box";
  const launchText = lang === "ru" ? "Запустить музыку" : "Musiqani boshlash";
  const openText = lang === "ru" ? "Открыть плеер" : "Pleerni ochish";
  const readyTitle = lang === "ru" ? "Музыка для вашего заведения готова" : "Muassasangiz uchun musiqa tayyor";
  const readySub = lang === "ru" ? "Работает сразу · без настроек" : "Darhol ishlaydi · sozlamalarsiz";
  const hasTariffRequest = /Заявка на тариф/.test(client?.notes || "");

  const LangSwitcher = () => (
    <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden" }}>
      <button onClick={() => setLang("ru")} style={{ padding: "5px 10px", background: lang === "ru" ? "#C9A84C" : "transparent", color: lang === "ru" ? "#080C12" : "#8BA7BE", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif" }}>RU</button>
      <button onClick={() => setLang("uz")} style={{ padding: "5px 10px", background: lang === "uz" ? "#C9A84C" : "transparent", color: lang === "uz" ? "#080C12" : "#8BA7BE", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif" }}>UZ</button>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", background: "#162435",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  if (screen === "loading") return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ color: "#8BA7BE" }}>{t.loading}</div>
    </main>
  );

  if (screen === "paywall") return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⏰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.paywall_h}</h1>
        <p style={{ fontSize: 15, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 32 }}>{t.paywall_p}</p>
        <a href="/pricing" style={{ display: "block", padding: "18px", background: "#C9A84C", color: "#080C12", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none", marginBottom: 16 }}>{t.paywall_btn}</a>
        <a href="tel:+998994100910" style={{ display: "block", padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8BA7BE", borderRadius: 12, fontSize: 14, textDecoration: "none" }}>+998 99 410 09 10</a>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", fontFamily: "Georgia, serif", color: "#E8EFF5" }}>

      {/* ADD MODAL */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 460 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{t.add_modal_h}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{t.add_name}</div>
                <input value={modalName} onChange={e => setModalName(e.target.value)} placeholder={t.add_name_ph} style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{t.add_address}</div>
                <input value={modalAddress} onChange={e => setModalAddress(e.target.value)} placeholder={t.add_address_ph} style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{t.add_biz_type}</div>
                <select value={modalBusinessType} onChange={e => setModalBusinessType(Number(e.target.value))} style={{ ...inputStyle, background: "#162435" }}>
                  {BUSINESS_TYPES.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 8 }}>{t.add_device}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ val: "web", label: t.add_web, color: "#3B82F6" }, { val: "box", label: t.add_box, color: "#C9A84C" }].map(d => (
                    <button key={d.val} onClick={() => setModalDeviceType(d.val)} style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", fontFamily: "Georgia, serif", background: modalDeviceType === d.val ? `${d.color}20` : "rgba(255,255,255,0.03)", border: `1px solid ${modalDeviceType === d.val ? `${d.color}60` : "rgba(255,255,255,0.1)"}`, color: modalDeviceType === d.val ? d.color : "#8BA7BE", fontSize: 13, fontWeight: modalDeviceType === d.val ? 700 : 400 }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addLocation} disabled={modalSaving || !modalName} style={{ flex: 1, padding: "13px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                {modalSaving ? t.add_btn_loading : t.add_btn}
              </button>
              <button onClick={() => setShowAddModal(false)} style={{ padding: "13px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8BA7BE", fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                {t.add_cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWelcome && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 18, padding: "28px 24px", boxShadow: "0 28px 70px rgba(0,0,0,0.55)" }}>
            <div style={{ fontSize: 38, marginBottom: 12, textAlign: "center" }}>🎵</div>
            <h2 style={{ fontSize: 24, color: "#fff", fontWeight: 800, textAlign: "center", marginBottom: 10 }}>
              {lang === "ru" ? "Добро пожаловать в FonMusic" : "FonMusic'ga xush kelibsiz"}
            </h2>
            <p style={{ fontSize: 13, color: "#8BA7BE", textAlign: "center", lineHeight: 1.6, marginBottom: 22 }}>
              {lang === "ru" ? "Музыка уже подобрана для вашего заведения." : "Musiqa muassasangiz uchun tayyor."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                lang === "ru" ? "Нажмите «Запустить музыку»" : "«Musiqani boshlash» tugmasini bosing",
                lang === "ru" ? "Музыка начнёт играть сразу" : "Musiqa darhol ijro etiladi",
                lang === "ru" ? "Атмосферу можно сменить в плеере" : "Atmosferani pleerda almashtirish mumkin",
              ].map((line, i) => (
                <div key={line} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(201,168,76,0.14)", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "#E8EFF5" }}>{line}</span>
                </div>
              ))}
            </div>
            <button onClick={() => {
              localStorage.setItem("fonmusic_dashboard_welcome_done", "1");
              setShowWelcome(false);
              if (primaryLocation) openLocation(primaryLocation);
            }} style={{ width: "100%", padding: "16px", background: "#C9A84C", color: "#080C12", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              ▶ {launchText}
            </button>
            <button onClick={() => {
              localStorage.setItem("fonmusic_dashboard_welcome_done", "1");
              setShowWelcome(false);
            }} style={{ width: "100%", padding: "11px", background: "transparent", color: "#8BA7BE", border: "none", fontSize: 12, cursor: "pointer", marginTop: 8, fontFamily: "Georgia, serif" }}>
              {lang === "ru" ? "Посмотреть кабинет" : "Kabinetni ko'rish"}
            </button>
          </div>
        </div>
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
              {t.demo_badge}: {daysLeft} {t.demo_days}
            </div>
          )}
          <LangSwitcher />
          <div style={{ fontSize: 13, color: "#8BA7BE" }}>👤 {client?.name}</div>
          <button onClick={logout} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            {t.logout}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>

        {/* ГЛАВНЫЙ ЗАПУСК */}
        <section style={{ background: "linear-gradient(135deg, #101C2A 0%, #0D1B2A 100%)", border: "1px solid rgba(201,168,76,0.22)", borderRadius: 18, padding: "30px 28px", marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>🎵</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{readyTitle}</h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 22 }}>{readySub}</p>
          <button
            onClick={() => primaryLocation ? openLocation(primaryLocation) : setShowAddModal(true)}
            style={{ width: "100%", maxWidth: 340, padding: "17px 22px", background: "#C9A84C", border: "none", borderRadius: 12, color: "#080C12", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif", boxShadow: "0 12px 34px rgba(201,168,76,0.28)" }}
          >
            ▶ {primaryLocation ? launchText : t.add_location_btn}
          </button>
          {primaryLocation && (
            <button
              onClick={() => openPreview(primaryLocation)}
              style={{ display: "block", width: "100%", maxWidth: 340, margin: "10px auto 0", padding: "13px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#8BA7BE", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              {t.preview}
            </button>
          )}
        </section>

        {/* МОЁ ЗАВЕДЕНИЕ */}
        <section style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 24px", marginBottom: 14 }}>
          {primaryLocation ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 12, color: "#4a5a6a", marginBottom: 6 }}>{lang === "ru" ? "Моё заведение" : "Mening muassasam"}</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{primaryLocation.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#22C55E", fontWeight: 700 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.55)" }} />
                    {lang === "ru" ? "Готово к запуску" : "Boshlashga tayyor"}
                  </span>
                  <span style={{ fontSize: 12, color: "#4a5a6a" }}>·</span>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}>{primaryStationInfo?.icon} {primaryStationName}</span>
                  <span style={{ fontSize: 12, color: "#4a5a6a" }}>·</span>
                  <span style={{ fontSize: 13, color: primaryIsWeb ? "#3B82F6" : "#C9A84C" }}>{primaryIsWeb ? t.web_player : t.box_device}</span>
                </div>
              </div>
              <div style={{ width: "100%", maxWidth: 240, display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => openLocation(primaryLocation)} style={{ width: "100%", padding: "14px 18px", background: primaryIsWeb ? "#3B82F6" : "#C9A84C", border: "none", borderRadius: 12, color: primaryIsWeb ? "#fff" : "#080C12", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  ▶ {primaryIsWeb ? openText : t.manage}
                </button>
                <button onClick={() => openPreview(primaryLocation)} style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#8BA7BE", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  {t.preview}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
              <div style={{ fontSize: 17, color: "#fff", fontWeight: 800, marginBottom: 6 }}>{t.no_locations}</div>
              <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 18 }}>{t.no_locations_sub}</div>
              <button onClick={() => setShowAddModal(true)} style={{ padding: "13px 22px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                {t.add_location_btn}
              </button>
            </div>
          )}
        </section>

        {/* ДЕМО */}
        <section style={{ padding: "15px 18px", background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 14, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: "#C9A84C", fontWeight: 800 }}>
              {hasTariffRequest ? "💳" : "⏳"} {hasTariffRequest ? (lang === "ru" ? "Заявка на тариф отправлена" : "Tarif arizasi yuborildi") : `${lang === "ru" ? "Бесплатный период" : "Bepul davr"}: ${daysLeft ?? 0} ${t.demo_days}`}
            </div>
            <div style={{ fontSize: 12, color: "#8BA7BE", marginTop: 3 }}>
              {hasTariffRequest ? (lang === "ru" ? "Мы свяжемся для оплаты и подключения" : "To'lov va ulash uchun bog'lanamiz") : (lang === "ru" ? "Все функции доступны бесплатно" : "Barcha funksiyalar bepul")}
            </div>
          </div>
          <a href="/pricing" style={{ fontSize: 13, color: "#080C12", background: "#C9A84C", padding: "9px 16px", borderRadius: 9, textDecoration: "none", fontWeight: 800 }}>
            {hasTariffRequest ? (lang === "ru" ? "Изменить заявку" : "Arizani o'zgartirish") : (lang === "ru" ? "Подключить тариф" : "Tarifni ulash")}
          </a>
        </section>

        <button onClick={() => setShowMore(!showMore)} style={{ width: "100%", padding: "13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#8BA7BE", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: showMore ? 16 : 0 }}>
          {showMore ? "Скрыть дополнительные настройки" : "⚙ Дополнительно: поддержка и пароль"}
        </button>

        {showMore && (
          <>
            {locations.length > 1 && (
              <section style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 10 }}>{t.locations_h}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {locations.slice(1).map(loc => {
                    const stationInfo = STATION_LABELS[loc.station_key] || { ru: loc.station_key, uz: loc.station_key, icon: "🎵" };
                    const isWeb = loc.device_type !== "box";
                    return (
                      <div key={loc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>{loc.name}</div>
                          <div style={{ color: "#8BA7BE", fontSize: 12 }}>{stationInfo.icon} {stationInfo[lang]} · {isWeb ? t.web_player : t.box_device}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={() => openLocation(loc)} style={{ padding: "9px 12px", background: isWeb ? "#3B82F6" : "#C9A84C", border: "none", borderRadius: 9, color: isWeb ? "#fff" : "#080C12", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                            {isWeb ? t.open_player : t.manage}
                          </button>
                          <button onClick={() => openPreview(loc)} style={{ padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#8BA7BE", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                            {t.preview}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {(demoAccess || client?.plan === "premium") && canAddLocation && (
              <button onClick={() => setShowAddModal(true)} style={{ width: "100%", padding: "13px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 12, color: "#C9A84C", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 16 }}>
                {t.add_location_btn}
              </button>
            )}

        {/* ПОДДЕРЖКА */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.support_h}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="https://t.me/fonmusic2026" target="_blank" style={{ padding: "10px 16px", background: "rgba(0,136,204,0.1)", border: "1px solid rgba(0,136,204,0.3)", borderRadius: 10, color: "#0088CC", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>✈ Telegram</a>
            <a href="https://wa.me/998994100910" target="_blank" style={{ padding: "10px 16px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, color: "#25D166", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>💬 WhatsApp</a>
            <a href="tel:+998994100910" style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#8BA7BE", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>📞 +998 99 410 09 10</a>
          </div>
        </div>

        {/* ПАРОЛЬ */}
        <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showChangePassword ? 16 : 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{t.password_h}</h2>
            <button onClick={() => { setShowChangePassword(!showChangePassword); setPasswordError(""); }} style={{ padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8BA7BE", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              {showChangePassword ? t.password_cancel : t.password_change}
            </button>
          </div>
          {showChangePassword && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder={t.password_old} style={{ padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t.password_new} style={{ padding: "12px 14px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              {passwordError && <div style={{ fontSize: 13, color: "#EF4444" }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ fontSize: 13, color: "#22C55E" }}>{passwordSuccess}</div>}
              <button onClick={changePassword} disabled={saving} style={{ padding: "12px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                {t.password_save}
              </button>
            </div>
          )}
        </div>

          </>
        )}

      </div>
    </main>
  );
}
