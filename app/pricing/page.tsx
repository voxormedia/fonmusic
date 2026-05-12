"use client";
import { useEffect, useState } from "react";

const BOX_IMAGE = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev/images/fonmusic-box-small.png";
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

const T = {
  ru: {
    nav_login: "Войти", nav_free: "Попробовать бесплатно",
    badge: "🔥 СТАРТОВЫЕ ТАРИФЫ FONMUSIC — ОТ 399 000 СУМ В МЕСЯЦ",
    hero_h: "Тарифы FonMusic",
    hero_p: "Выберите подходящий тариф — от одной точки до сети филиалов",
    hero_sub: "Лицензированная музыка для бизнеса · Без рекламы · Официальный сертификат",
    note: "1 точка = 1 устройство воспроизведения: веб-плеер или FonMusic Box",
    per_month: "сум / месяц · за 1 точку",
    cta: "Попробовать бесплатно",
    cta_sub: "7 дней бесплатно · без обязательств",
    recommended: "⭐ Самый популярный",
    box_label: "📦 FonMusic Box (по желанию)",
    box_price_text: "750 000 сум · или",
    box_free: "бесплатно",
    box_free_cond: "при оплате любого тарифа за 3 месяца",
    extra_label: "Дополнительные заведения",
    extra_price: "599 000 сум / мес за каждое",
    extra_calc: ["2 точки — 1 498 000 сум", "3 точки — 2 097 000 сум", "5 точек — 3 295 000 сум"],
    compare_h: "Сравнение тарифов",
    compare_feature: "Функция",
    which_h: "Какой тариф подойдёт вашему бизнесу?",
    which: [
      { icon: "☕", plan: "Базовый", color: "#8BA7BE", desc: "Если у вас одно небольшое заведение и музыка включается вручную" },
      { icon: "🎵", plan: "Стандарт", color: "#C9A84C", desc: "Если хотите, чтобы музыка автоматически менялась в течение дня" },
      { icon: "🏢", plan: "Премиум", color: "#A78BFA", desc: "Если у вас несколько точек и нужен единый контроль из одного кабинета" },
    ],
    box_h2: "Музыка 24/7 без компьютера и браузера",
    box_desc: "FonMusic Box — маленькое устройство, которое подключается к аудиосистеме заведения и автоматически запускает музыку.",
    box_features: ["Работает круглосуточно без перерывов", "Автоматически запускает музыку после включения", "Управляется через кабинет FonMusic"],
    box_price: "750 000 сум",
    box_free2: "или бесплатно при оплате любого тарифа за 3 месяца",
    box_note: "FonMusic Box является опцией. Можно использовать сервис через веб-плеер без покупки устройства.",
    box_btn: "Подключить FonMusic Box →",
    demo_h: "Попробуйте FonMusic", demo_accent: "бесплатно 7 дней",
    demo_p: "Во время демо-периода все функции доступны бесплатно 7 дней. После демо вы можете выбрать подходящий тариф.",
    demo_sub: "Без карты, без обязательств.",
    demo_btn: "Начать 7 дней бесплатно →",
    faq_h: "Частые вопросы",
    faqs: [
      { q: "Можно ли использовать без FonMusic Box?", a: "Да, музыка работает через веб-плеер на любом устройстве — компьютере, планшете или телефоне." },
      { q: "Нужно ли покупать устройство сразу?", a: "Нет, FonMusic Box подключается по желанию в любой момент. Начните с веб-плеера." },
      { q: "Можно ли сначала попробовать?", a: "Да, демо-период — 7 дней. Все функции доступны без ограничений." },
      { q: "Один аккаунт для нескольких филиалов?", a: "Да, в тарифе Премиум можно добавлять дополнительные заведения по 599 000 сум/мес." },
    ],
    footer_offer: "Оферта", footer_privacy: "Конфиденциальность",
    plans: [
      { key: "basic", name: "Базовый", price: "399 000", desc: "Для одного небольшого заведения", popular: false, features: ["1 точка", "Все музыкальные атмосферы", "Веб-плеер", "Ручное переключение музыки"], missing: ["Автоматическое расписание"], ctaHref: "/signup", accent: "#8BA7BE", box: true },
      { key: "standard", name: "Стандарт", price: "599 000", desc: "Оптимальный тариф для кафе, магазинов, салонов и фитнес-клубов", popular: true, features: ["1 точка", "Все музыкальные атмосферы", "Веб-плеер", "Автоматическое расписание музыки", "Удалённое управление"], missing: [], ctaHref: "/signup?plan=standard", accent: "#C9A84C", box: true },
      { key: "premium", name: "Премиум", price: "899 000", desc: "Для сетей кафе, ресторанов, магазинов, фитнес-клубов и салонов красоты", popular: false, features: ["1 точка включена", "Все функции тарифа Стандарт", "Централизованное управление сетью", "Приоритетная поддержка"], missing: [], ctaHref: "/signup?plan=premium", accent: "#A78BFA", box: true },
    ],
    compare: [
      { label: "Количество точек", basic: "1", standard: "1", premium: "∞" },
      { label: "Все атмосферы", basic: true, standard: true, premium: true },
      { label: "Веб-плеер", basic: true, standard: true, premium: true },
      { label: "Автоматическое расписание", basic: false, standard: true, premium: true },
      { label: "Удалённое управление", basic: false, standard: true, premium: true },
      { label: "Управление сетью", basic: false, standard: false, premium: true },
      { label: "Приоритетная поддержка", basic: false, standard: false, premium: true },
    ],
    compare_cols: ["Базовый", "Стандарт", "Премиум"],
  },
  uz: {
    nav_login: "Kirish", nav_free: "Bepul sinab ko'ring",
    badge: "🔥 FONMUSIC START TARIFLARI — OYIGA 399 000 SO'MDAN",
    hero_h: "FonMusic Tariflari",
    hero_p: "Mos tarifni tanlang — bir nuqtadan filiallar tarmog'igacha",
    hero_sub: "Biznes uchun litsenziyalangan musiqa · Reklamasiz · Rasmiy sertifikat",
    note: "1 nuqta = 1 ijro qurilmasi: veb-pleer yoki FonMusic Box",
    per_month: "so'm / oy · 1 nuqta uchun",
    cta: "Bepul sinab ko'ring",
    cta_sub: "7 kun bepul · majburiyatsiz",
    recommended: "⭐ Eng mashhur",
    box_label: "📦 FonMusic Box (ixtiyoriy)",
    box_price_text: "750 000 so'm · yoki",
    box_free: "bepul",
    box_free_cond: "istalgan tarif uchun 3 oylik to'lovda",
    extra_label: "Qo'shimcha muassasalar",
    extra_price: "599 000 so'm / oy har biri uchun",
    extra_calc: ["2 nuqta — 1 498 000 so'm", "3 nuqta — 2 097 000 so'm", "5 nuqta — 3 295 000 so'm"],
    compare_h: "Tariflarni solishtirish",
    compare_feature: "Xususiyat",
    which_h: "Biznesingizga qaysi tarif mos keladi?",
    which: [
      { icon: "☕", plan: "Asosiy", color: "#8BA7BE", desc: "Bitta kichik muassasangiz bo'lsa va musiqa qo'lda yoqilsa" },
      { icon: "🎵", plan: "Standart", color: "#C9A84C", desc: "Musiqa kun davomida avtomatik o'zgarishini istasangiz" },
      { icon: "🏢", plan: "Premium", color: "#A78BFA", desc: "Bir necha nuqtangiz bo'lsa va bitta kabinetdan boshqarmoqchi bo'lsangiz" },
    ],
    box_h2: "Kompyuter va brauzersiz 24/7 musiqa",
    box_desc: "FonMusic Box — muassasaning audio tizimiga ulanadigan va musiqani avtomatik ishga tushuradigan kichik qurilma.",
    box_features: ["Uzluksiz sutka bo'yi ishlaydi", "Yoqilgandan so'ng musiqani avtomatik ishga tushiradi", "FonMusic kabineti orqali boshqariladi"],
    box_price: "750 000 so'm",
    box_free2: "yoki istalgan tarif uchun 3 oylik to'lovda bepul",
    box_note: "FonMusic Box ixtiyoriy. Qurilma sotib olmay veb-pleer orqali foydalanish mumkin.",
    box_btn: "FonMusic Box ulash →",
    demo_h: "FonMusic'ni sinab ko'ring", demo_accent: "7 kun bepul",
    demo_p: "Demo davrida barcha funksiyalar 7 kun bepul. Demo tugagach mos tarifni tanlashingiz mumkin.",
    demo_sub: "Karta va majburiyatsiz.",
    demo_btn: "7 kun bepul boshlash →",
    faq_h: "Ko'p so'raladigan savollar",
    faqs: [
      { q: "FonMusic Box siz ishlatish mumkinmi?", a: "Ha, musiqa istalgan qurilmada veb-pleer orqali ishlaydi — kompyuter, planshet yoki telefon." },
      { q: "Qurilmani darhol sotib olish kerakmi?", a: "Yo'q, FonMusic Box istalgan vaqtda ixtiyoriy ravishda ulanadi. Veb-pleerdan boshlang." },
      { q: "Avval sinab ko'rsa bo'ladimi?", a: "Ha, demo davri — 7 kun. Barcha funksiyalar cheklovsiz mavjud." },
      { q: "Bir necha filial uchun bitta akkaunt?", a: "Ha, Premium tarifda har biri uchun oyiga 599 000 so'mdan qo'shimcha muassasalar qo'shish mumkin." },
    ],
    footer_offer: "Oferta", footer_privacy: "Maxfiylik",
    plans: [
      { key: "basic", name: "Asosiy", price: "399 000", desc: "Bitta kichik muassasa uchun", popular: false, features: ["1 nuqta", "Barcha musiqa atmosferalari", "Veb-pleer", "Musiqani qo'lda almashtirish"], missing: ["Avtomatik jadval"], ctaHref: "/signup", accent: "#8BA7BE", box: true },
      { key: "standard", name: "Standart", price: "599 000", desc: "Kafe, do'kon, salon va fitnes-klublar uchun optimal tarif", popular: true, features: ["1 nuqta", "Barcha musiqa atmosferalari", "Veb-pleer", "Avtomatik musiqa jadvali", "Masofaviy boshqaruv"], missing: [], ctaHref: "/signup?plan=standard", accent: "#C9A84C", box: true },
      { key: "premium", name: "Premium", price: "899 000", desc: "Kafe, restoran, do'kon, fitnes-klub va salonlar tarmog'i uchun", popular: false, features: ["1 nuqta kiritilgan", "Standart tarifning barcha funksiyalari", "Tarmoqni markazlashgan boshqaruv", "Ustuvor yordam"], missing: [], ctaHref: "/signup?plan=premium", accent: "#A78BFA", box: true },
    ],
    compare: [
      { label: "Nuqtalar soni", basic: "1", standard: "1", premium: "∞" },
      { label: "Barcha atmosferalar", basic: true, standard: true, premium: true },
      { label: "Veb-pleer", basic: true, standard: true, premium: true },
      { label: "Avtomatik jadval", basic: false, standard: true, premium: true },
      { label: "Masofaviy boshqaruv", basic: false, standard: true, premium: true },
      { label: "Tarmoq boshqaruvi", basic: false, standard: false, premium: true },
      { label: "Ustuvor yordam", basic: false, standard: false, premium: true },
    ],
    compare_cols: ["Asosiy", "Standart", "Premium"],
  },
};

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLang] = useState<"ru" | "uz">("ru");
  const [hasSession, setHasSession] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestLocation, setRequestLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("monthly");
  const [requestComment, setRequestComment] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState("");
  const t = T[lang];

  useEffect(() => {
    const clientId = localStorage.getItem("fonmusic_client_id");
    const sessionExpiry = localStorage.getItem("fonmusic_session_expiry");
    const activeSession = Boolean(clientId && sessionExpiry && new Date(sessionExpiry) > new Date());
    setHasSession(activeSession);
    if (!activeSession || !clientId) return;

    sb(`clients?id=eq.${clientId}&select=*`).then(data => {
      const c = data?.[0];
      if (!c) return;
      setClient(c);
      setRequestName(c.name || "");
      setRequestPhone(c.phone || "");
      setRequestLocation(c.name || "");
    });
  }, []);

  const planCta = hasSession
    ? (lang === "ru" ? "Подключить тариф" : "Tarifni ulash")
    : t.cta;
  const planCtaSub = hasSession
    ? (lang === "ru" ? "После выбора мы свяжемся для подключения" : "Tanlovdan so'ng ulash uchun bog'lanamiz")
    : t.cta_sub;
  const openTariffRequest = (plan: any) => {
    setSelectedPlan(plan);
    setRequestSent(false);
    setRequestError("");
  };

  const sendTariffRequest = async () => {
    if (!selectedPlan) return;
    setRequestLoading(true);
    setRequestError("");
    const res = await fetch("/api/telegram/tariff-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: selectedPlan.key,
        clientId: client?.id || localStorage.getItem("fonmusic_client_id"),
        name: requestName,
        phone: requestPhone,
        locationName: requestLocation,
        paymentMethod,
        comment: requestComment,
      }),
    });
    setRequestLoading(false);
    if (!res.ok) {
      setRequestError(lang === "ru" ? "Не удалось отправить заявку. Напишите нам в Telegram." : "Arizani yuborib bo'lmadi. Telegram orqali yozing.");
      return;
    }
    setRequestSent(true);
  };

  const LangSwitcher = () => (
    <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden" }}>
      <button onClick={() => setLang("ru")} style={{ padding: "6px 12px", background: lang === "ru" ? "#C9A84C" : "transparent", color: lang === "ru" ? "#0A1628" : "#8BA7BE", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Georgia, serif" }}>RU</button>
      <button onClick={() => setLang("uz")} style={{ padding: "6px 12px", background: lang === "uz" ? "#C9A84C" : "transparent", color: lang === "uz" ? "#0A1628" : "#8BA7BE", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Georgia, serif" }}>UZ</button>
    </div>
  );

  return (
    <main style={{ fontFamily: "Georgia, serif", background: "#0A1628", color: "#E8EFF5", minHeight: "100vh", overflowX: "hidden" }}>

      <nav style={{ padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <a href="/" style={{ fontSize: 18, fontWeight: 700, color: "#fff", textDecoration: "none" }}>FonMusic</a>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <LangSwitcher />
          <a href={hasSession ? "/dashboard" : "/login"} style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>{hasSession ? (lang === "ru" ? "В кабинет" : "Kabinet") : t.nav_login}</a>
          {!hasSession && <a href="/signup" style={{ fontSize: 13, color: "#0A1628", background: "#C9A84C", textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700 }}>{t.nav_free}</a>}
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "80px 20px 40px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 24 }}>{t.badge}</div>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.15 }}>{t.hero_h}</h1>
        <p style={{ fontSize: 18, color: "#8BA7BE", maxWidth: 520, margin: "0 auto 8px" }}>{t.hero_p}</p>
        <p style={{ fontSize: 13, color: "#4a5a6a", marginTop: 8 }}>{t.hero_sub}</p>
      </section>

      <div style={{ textAlign: "center", padding: "16px 20px 32px", fontSize: 13, color: "#8BA7BE" }}>{t.note}</div>

      <section style={{ padding: "0 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
          {t.plans.map((plan) => (
            <div key={plan.key} style={{ position: "relative", borderRadius: 20, padding: plan.popular ? "32px 24px" : "28px 24px", background: plan.popular ? "linear-gradient(135deg, #0D1B2A, #162435)" : "#0D1B2A", border: `2px solid ${plan.popular ? plan.accent : "rgba(255,255,255,0.06)"}`, boxShadow: plan.popular ? `0 0 40px ${plan.accent}20` : "none" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: plan.accent, color: "#0A1628", padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{t.recommended}</div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: plan.accent, fontWeight: 700, marginBottom: 6 }}>{plan.name.toUpperCase()}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: "#4a5a6a", marginBottom: 10 }}>{t.per_month}</div>
                <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.5 }}>{plan.desc}</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginBottom: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: plan.accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#E8EFF5", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: "#4a5a6a", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✗</span>
                    <span style={{ fontSize: 13, color: "#4a5a6a", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              {plan.box && (
                <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>{t.box_label}</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.5 }}>{t.box_price_text} <span style={{ color: "#22C55E", fontWeight: 700 }}>{t.box_free}</span> {t.box_free_cond}</div>
                </div>
              )}
              {plan.key === "premium" && (
                <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, marginBottom: 6 }}>{t.extra_label}</div>
                  <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{t.extra_price}</div>
                  <div style={{ fontSize: 11, color: "#4a5a6a", lineHeight: 1.6 }}>{t.extra_calc.map((line, i) => <div key={i}>{line}</div>)}</div>
                </div>
              )}
              {hasSession ? (
                <button onClick={() => openTariffRequest(plan)} style={{ width: "100%", textAlign: "center", padding: "14px", borderRadius: 12, background: plan.popular ? plan.accent : "rgba(255,255,255,0.06)", border: plan.popular ? "none" : `1px solid ${plan.accent}40`, color: plan.popular ? "#0A1628" : plan.accent, fontSize: 14, fontWeight: 700, marginBottom: 8, cursor: "pointer", fontFamily: "Georgia, serif" }}>{planCta}</button>
              ) : (
                <a href={plan.ctaHref} style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 12, background: plan.popular ? plan.accent : "rgba(255,255,255,0.06)", border: plan.popular ? "none" : `1px solid ${plan.accent}40`, color: plan.popular ? "#0A1628" : plan.accent, fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 8 }}>{planCta}</a>
              )}
              <div style={{ textAlign: "center", fontSize: 11, color: "#4a5a6a" }}>{planCtaSub}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 32 }}>{t.compare_h}</h2>
        <div style={{ background: "#0D1B2A", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>{t.compare_feature}</div>
            {t.compare_cols.map((p, i) => <div key={p} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: i === 1 ? "#C9A84C" : "#8BA7BE" }}>{p}</div>)}
          </div>
          {t.compare.map((row, i) => (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < t.compare.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <div style={{ fontSize: 13, color: "#8BA7BE" }}>{row.label}</div>
              {[row.basic, row.standard, row.premium].map((val, j) => (
                <div key={j} style={{ textAlign: "center" }}>
                  {typeof val === "boolean"
                    ? <span style={{ color: val ? "#22C55E" : "#4a5a6a", fontSize: 16 }}>{val ? "✓" : "✗"}</span>
                    : <span style={{ fontSize: 13, color: j === 1 ? "#C9A84C" : "#8BA7BE", fontWeight: 700 }}>{val}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 32 }}>{t.which_h}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {t.which.map(item => (
            <div key={item.plan} style={{ display: "flex", gap: 16, alignItems: "center", padding: "18px 20px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div><span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.plan}</span><span style={{ fontSize: 13, color: "#8BA7BE" }}> — {item.desc}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 20, padding: "40px 32px", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 10 }}>FONMUSIC BOX</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.box_h2}</h2>
            <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 16 }}>{t.box_desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {["📡", "⚡", "🎛️"].map((icon, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: "#8BA7BE" }}>{t.box_features[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: "#C9A84C", fontWeight: 700, marginBottom: 4 }}>{t.box_price}</div>
            <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 4 }}>{t.box_free2}</div>
            <div style={{ fontSize: 11, color: "#4a5a6a", marginBottom: 20 }}>{t.box_note}</div>
            <a href="https://t.me/fonmusic2026" target="_blank" style={{ display: "inline-block", padding: "13px 24px", background: "#C9A84C", color: "#0A1628", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t.box_btn}</a>
          </div>
          <div style={{ flexShrink: 0, width: 180 }}>
            <img src={BOX_IMAGE} alt="FonMusic Box" style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(201,168,76,0.2)" }} />
          </div>
        </div>
      </section>

      <section style={{ padding: "0 20px 60px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)", padding: "48px 32px", borderRadius: 20, border: "1px solid rgba(201,168,76,0.15)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            {hasSession ? (lang === "ru" ? "Готовы подключить тариф?" : "Tarif ulashga tayyormisiz?") : t.demo_h} {!hasSession && <span style={{ color: "#C9A84C" }}>{t.demo_accent}</span>}
          </h2>
          <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 8 }}>
            {hasSession ? (lang === "ru" ? "Выберите подходящий тариф выше или напишите нам — поможем подключить оплату." : "Yuqoridan mos tarifni tanlang yoki bizga yozing — to'lovni ulashga yordam beramiz.") : t.demo_p}
          </p>
          <p style={{ fontSize: 13, color: "#4a5a6a", marginBottom: 28 }}>{hasSession ? (lang === "ru" ? "Подключение занимает несколько минут." : "Ulash bir necha daqiqa oladi.") : t.demo_sub}</p>
          <a href={hasSession ? "https://t.me/fonmusic2026" : "/signup"} target={hasSession ? "_blank" : undefined} style={{ display: "inline-block", padding: "18px 40px", background: "#C9A84C", color: "#0A1628", borderRadius: 12, fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.3)" }}>
            {hasSession ? (lang === "ru" ? "Написать для подключения →" : "Ulash uchun yozish →") : t.demo_btn}
          </a>
        </div>
      </section>

      <section style={{ padding: "0 20px 80px", maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 28 }}>{t.faq_h}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {t.faqs.map((faq, i) => (
            <div key={i} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "left" }}>{faq.q}</span>
                <span style={{ color: "#C9A84C", fontSize: 16, flexShrink: 0 }}>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && <div style={{ padding: "0 20px 18px", fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        <div style={{ fontSize: 12, color: "#4a5a6a" }}>© 2026 FonMusic.uz · Voxor Media Group</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="/offer" style={{ fontSize: 12, color: "#4a5a6a", textDecoration: "none" }}>{t.footer_offer}</a>
          <a href="/privacy" style={{ fontSize: 12, color: "#4a5a6a", textDecoration: "none" }}>{t.footer_privacy}</a>
          <LangSwitcher />
        </div>
      </footer>

      {selectedPlan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 460, background: "#0D1B2A", border: `1px solid ${selectedPlan.accent}55`, borderRadius: 18, padding: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}>
            {!requestSent ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 12, color: selectedPlan.accent, fontWeight: 800, marginBottom: 6 }}>{lang === "ru" ? "Заявка на тариф" : "Tarif arizasi"}</div>
                    <div style={{ fontSize: 24, color: "#fff", fontWeight: 800 }}>{selectedPlan.name}</div>
                    <div style={{ fontSize: 13, color: "#8BA7BE", marginTop: 4 }}>{selectedPlan.price} {lang === "ru" ? "сум / месяц" : "so'm / oy"}</div>
                  </div>
                  <button onClick={() => setSelectedPlan(null)} style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#8BA7BE", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>

                {[
                  { label: lang === "ru" ? "Имя / бизнес" : "Ism / biznes", value: requestName, set: setRequestName },
                  { label: lang === "ru" ? "Телефон" : "Telefon", value: requestPhone, set: setRequestPhone },
                  { label: lang === "ru" ? "Заведение" : "Muassasa", value: requestLocation, set: setRequestLocation },
                ].map(field => (
                  <label key={field.label} style={{ display: "block", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{field.label}</div>
                    <input value={field.value} onChange={e => field.set(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#101A28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }} />
                  </label>
                ))}

                <label style={{ display: "block", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{lang === "ru" ? "Вариант подключения" : "Ulash varianti"}</div>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#101A28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }}>
                    <option value="monthly">{lang === "ru" ? "Оплата за месяц" : "Bir oy uchun to'lov"}</option>
                    <option value="three_months_box">{lang === "ru" ? "Оплата за 3 месяца + FonMusic Box" : "3 oy + FonMusic Box"}</option>
                  </select>
                </label>

                <label style={{ display: "block", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#8BA7BE", marginBottom: 6 }}>{lang === "ru" ? "Комментарий" : "Izoh"}</div>
                  <textarea value={requestComment} onChange={e => setRequestComment(e.target.value)} rows={3} placeholder={lang === "ru" ? "Например: хочу оплатить сегодня" : "Masalan: bugun to'lamoqchiman"} style={{ width: "100%", padding: "12px 14px", background: "#101A28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "Georgia, serif" }} />
                </label>

                {requestError && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{requestError}</div>}
                <button onClick={sendTariffRequest} disabled={requestLoading || !requestPhone || !requestName} style={{ width: "100%", padding: "15px", borderRadius: 12, background: selectedPlan.accent, border: "none", color: "#0A1628", fontSize: 15, fontWeight: 800, cursor: requestLoading ? "wait" : "pointer", fontFamily: "Georgia, serif", opacity: requestLoading || !requestPhone || !requestName ? 0.7 : 1 }}>
                  {requestLoading ? (lang === "ru" ? "Отправляем..." : "Yuborilmoqda...") : (lang === "ru" ? "Отправить заявку" : "Ariza yuborish")}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "18px 4px" }}>
                <div style={{ fontSize: 42, marginBottom: 14 }}>✓</div>
                <div style={{ fontSize: 24, color: "#fff", fontWeight: 800, marginBottom: 8 }}>{lang === "ru" ? "Заявка принята" : "Ariza qabul qilindi"}</div>
                <div style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 22 }}>
                  {lang === "ru" ? "Мы получили запрос и свяжемся для оплаты и подключения тарифа." : "So'rovni oldik. To'lov va ulash uchun bog'lanamiz."}
                </div>
                <button onClick={() => setSelectedPlan(null)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "#C9A84C", border: "none", color: "#0A1628", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  {lang === "ru" ? "Понятно" : "Tushunarli"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } html, body { overflow-x: hidden; }`}</style>
    </main>
  );
}
