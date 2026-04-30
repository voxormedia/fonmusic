"use client";
import { useState } from "react";

const SUPABASE_URL = "https://ovafknvfckdmatrnlecr.supabase.co";
const SUPABASE_KEY = "sb_publishable_sMrkdTU705Zgw9-Sc12-Ww_XDrl1ASP";

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

function generatePassword(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    if (!name || !phone) { setError("Заполните все поля"); return; }
    if (!agreed) { setError("Примите условия оферты"); return; }
    if (phone.length < 12) { setError("Введите корректный номер телефона"); return; }

    setLoading(true);
    setError("");

    // Проверяем существующего клиента
    const existing = await sb(`clients?phone=eq.${encodeURIComponent(phone)}&select=id`);
    if (existing && existing.length > 0) {
      setError("Аккаунт с таким телефоном уже существует. Войдите в кабинет.");
      setLoading(false);
      return;
    }

    // Генерируем 4-значный пароль
    const password = generatePassword();

    // Создаём клиента
    const demoExpires = new Date();
    demoExpires.setDate(demoExpires.getDate() + 7);

    const client = await sb("clients", {
      method: "POST",
      body: JSON.stringify({
        name,
        phone,
        password,
        business_type: businessType.label,
        subscription_status: "demo",
        demo_expires_at: demoExpires.toISOString(),
        plan: "trial",
        trial_until: demoExpires.toISOString(),
        station_key: businessType.station,
        template_key: businessType.template,
        default_template_key: businessType.template,
        music_mode: "automatic",
        playback_target: "web",
      }),
    });

    if (!client || client.length === 0) {
      setError("Ошибка создания аккаунта. Попробуйте ещё раз.");
      setLoading(false);
      return;
    }

    // Создаём первую точку
    await sb("locations", {
      method: "POST",
      body: JSON.stringify({
        client_id: client[0].id,
        name: name,
        device_type: "web",
        station_key: businessType.station,
        template_key: businessType.template,
        default_template_key: businessType.template,
        music_mode: "automatic",
      }),
    });

    // Отправляем SMS с паролем
    try {
      await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, name }),
      });
    } catch {
      // SMS не критично — продолжаем
    }

    // Уведомление в Telegram
    await fetch(`https://api.telegram.org/bot8572453029:AAGacP96un1FuPOcj6hmc708pOBv7nYPIiI/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "500210645",
        text: `🎉 Новая регистрация FonMusic!\n\n🏢 ${name}\n📞 ${phone}\n🍽 ${businessType.label}\n🔑 Пароль: ${password}\n📱 SMS отправлен\n\n✅ Аккаунт создан автоматически`,
      }),
    });

    localStorage.setItem("fonmusic_client_id", client[0].id);
    window.location.href = "/dashboard";
  };

  const inputStyle = { padding: "14px 16px", background: "#162435", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" as const, width: "100%" };

  return (
    <main style={{ minHeight: "100vh", background: "#080C12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <a href="/" style={{ fontSize: 20, fontWeight: 700, color: "#fff", textDecoration: "none" }}>FonMusic</a>
        </div>

        <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, padding: 40, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>7 дней бесплатно</h1>
          <p style={{ fontSize: 14, color: "#8BA7BE", marginBottom: 32 }}>Создайте аккаунт и начните слушать музыку прямо сейчас</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>

            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Название заведения *</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Например: Кафе Уют" style={inputStyle} />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Тип бизнеса *</div>
              <select value={businessType.label} onChange={e => {
                const bt = BUSINESS_TYPES.find(b => b.label === e.target.value);
                if (bt) setBusinessType(bt);
              }} style={{ ...inputStyle, background: "#162435" }}>
                {BUSINESS_TYPES.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>Телефон *</div>
              <input value={phone} onChange={e => {
                let val = e.target.value.replace(/\D/g, "");
                if (val.startsWith("998")) val = val.slice(3);
                if (val.length > 9) val = val.slice(0, 9);
                setPhone(val ? "+998" + val : "");
              }} placeholder="99 410 09 10" type="tel" style={inputStyle} />
            </div>

            {/* Инфо о пароле */}
            <div style={{ padding: "12px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 700, marginBottom: 2 }}>📱 Пароль придёт в SMS</div>
              <div style={{ fontSize: 11, color: "#8BA7BE" }}>После регистрации на ваш номер придёт 4-значный пароль для входа в кабинет.</div>
            </div>

          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 2, cursor: "pointer", width: 16, height: 16, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6 }}>
              Я принимаю условия{" "}
              <a href="/offer" target="_blank" style={{ color: "#C9A84C", textDecoration: "none" }}>публичной оферты</a>
              {" "}и{" "}
              <a href="/license" target="_blank" style={{ color: "#C9A84C", textDecoration: "none" }}>лицензионного соглашения</a>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={register} disabled={loading} style={{ width: "100%", padding: "16px", background: "#C9A84C", border: "none", borderRadius: 10, color: "#080C12", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 16, boxShadow: "0 8px 24px rgba(201,168,76,0.3)", fontFamily: "Georgia, serif" }}>
            {loading ? "Создаём аккаунт..." : "Начать 7 дней бесплатно →"}
          </button>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              <span style={{ fontSize: 13, color: "#8BA7BE" }}>Уже есть аккаунт? </span>
              <a href="/login" style={{ fontSize: 13, color: "#C9A84C", textDecoration: "none", fontWeight: 700 }}>Войти →</a>
            </div>
            <a href="/" style={{ fontSize: 13, color: "#4a5a6a", textDecoration: "none" }}>← На главную</a>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
          <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 10 }}>После регистрации вы получите:</div>
          {["🎵 Готовую музыкальную программу для вашего бизнеса", "📅 Автоматическое расписание по времени дня", "📄 Официальный сертификат лицензии"].map(f => (
            <div key={f} style={{ fontSize: 12, color: "#E8EFF5", marginBottom: 6 }}>{f}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
