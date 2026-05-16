"use client";
import { useState, useEffect, useRef } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const BASE_URL = "https://pub-b2c1411547b247808cb42732bb122560.r2.dev";

const BUSINESS_TYPES = [
  { key: "cafe", icon: "☕", name: { ru: "Кафе", uz: "Kafe" }, desc: { ru: "Уютная атмосфера", uz: "Qulay atmosfera" }, station: "Cozy Coffee", folder: "Cozy Coffee", color: "#C9A84C" },
  { key: "restaurant", icon: "🍽️", name: { ru: "Ресторан", uz: "Restoran" }, desc: { ru: "Элегантный вечер", uz: "Elegant kech" }, station: "Dinner & Lounge", folder: "Cocktail and Dinner Groove", color: "#3B82F6" },
  { key: "boutique", icon: "🛍️", name: { ru: "Бутик", uz: "Butik" }, desc: { ru: "Стиль и энергия", uz: "Stil va energiya" }, station: "Retail Energy", folder: "Shopping Vibes", color: "#A855F7" },
  { key: "fitness", icon: "💪", name: { ru: "Фитнес", uz: "Fitnes" }, desc: { ru: "Максимальная энергия", uz: "Maksimal energiya" }, station: "Active Energy", folder: "Workout", color: "#EF4444" },
  { key: "spa", icon: "💆", name: { ru: "SPA", uz: "SPA" }, desc: { ru: "Расслабление", uz: "Dam olish" }, station: "Spa Relax", folder: "Spa Garden", color: "#22C55E" },
  { key: "bar", icon: "🎸", name: { ru: "Бар", uz: "Bar" }, desc: { ru: "Вечерняя атмосфера", uz: "Kechki atmosfera" }, station: "Bar Mood", folder: "The Rocks", color: "#F59E0B" },
  { key: "hotel", icon: "🏨", name: { ru: "Отель", uz: "Mehmonxona" }, desc: { ru: "Премиальный лобби", uz: "Premium lobbi" }, station: "Lounge Flow", folder: "Lounge", color: "#8BA7BE" },
  { key: "market", icon: "🛒", name: { ru: "Супермаркет", uz: "Supermarket" }, desc: { ru: "Нейтральный фон", uz: "Neytral fon" }, station: "All Day Mix", folder: "Best Of Radio", color: "#06B6D4" },
];

const T = {
  ru: {
    nav_login: "Войти в кабинет", nav_login_short: "Кабинет",
    nav_free: "Начать бесплатно", nav_free_short: "7 дней бесплатно",
    nav_how: "Как работает", nav_demo: "Демо", nav_pricing: "Тарифы", nav_license: "Лицензия",
    badge: "♪ ЛИЦЕНЗИРОВАННАЯ МУЗЫКА · ОФИЦИАЛЬНО",
    hero_h1: "Музыка для бизнеса", hero_h1_accent: "без рекламы и рисков",
    hero_p: "Лицензированная фоновая музыка для кафе, ресторанов, магазинов, фитнес-клубов и салонов. Официальный сертификат.",
    hero_btn1: "Попробовать 7 дней бесплатно", hero_btn2: "▶ Послушать демо",
    stat1: "треков", stat2: "7 дней", stat3: "бесплатно", stat4: "легально", stat5: "Сертификат",
    risks_label: "⚠ ВАЖНО ЗНАТЬ", risks_h: "Обычная музыка — риск для бизнеса",
    risks: [
      { icon: "🚫", title: "Spotify и YouTube запрещены", desc: "Использование в коммерческих заведениях нарушает лицензионное соглашение" },
      { icon: "💸", title: "Штрафы при проверке", desc: "Инспекторы могут выписать серьёзные санкции за нелегальную музыку" },
      { icon: "📉", title: "Репутационный риск", desc: "Инцидент при проверке — удар по имиджу вашего заведения" },
    ],
    how_label: "КАК ЭТО РАБОТАЕТ", how_h: "Просто. Быстро. Легально.",
    steps: [
      { num: "01", icon: "☕", title: "Выберите тип бизнеса", desc: "Кафе, ресторан, магазин, фитнес — система подберёт идеальную музыку" },
      { num: "02", icon: "🎵", title: "Получите готовую программу", desc: "Станции и расписание настраиваются автоматически" },
      { num: "03", icon: "▶", title: "Запустите музыку", desc: "Через браузер или FonMusic Box — музыка играет 24/7" },
      { num: "04", icon: "📄", title: "Вы защищены", desc: "Официальный сертификат JAMENDO для проверяющих органов" },
    ],
    step: "Шаг",
    demo_label: "ДЕМО", demo_h: "Услышьте атмосферу вашего заведения", demo_p: "Реальная музыка из нашего каталога",
    demo_player_title: "Послушайте музыку для вашего бизнеса", demo_player_p: "Выберите тип заведения и нажмите Play",
    demo_loading: "Загрузка...", demo_play_hint: "Нажмите Play для воспроизведения", demo_next: "Следующий",
    demo_limit_h: "Демо-прослушивание завершено",
    demo_limit_p: "Чтобы слушать без ограничений и запустить музыку в заведении, начните 7 дней бесплатно.",
    demo_limit_btn: "Начать бесплатно →",
    biz_label: "ДЛЯ КАКИХ БИЗНЕСОВ", biz_h: "Музыка для каждого заведения",
    pricing_label: "СТАРТОВЫЕ ТАРИФЫ", pricing_h: "Специальные цены для первых подключений",
    plans: [
      { name: "Базовый", price: "399 000", desc: "Для небольших заведений", popular: "", features: ["Веб-плеер в браузере", "30 000+ треков", "Готовые станции", "Без рекламы", "Официальный сертификат"], highlight: false },
      { name: "Стандарт", price: "599 000", desc: "Для кафе, ресторанов и магазинов", popular: "Самый популярный", features: ["Всё из Базового", "Автоматическое расписание", "Удалённое управление", "FonMusic Box по желанию", "Музыка 24/7"], highlight: true },
      { name: "Премиум", price: "799 000", desc: "Для зон и сетей", popular: "", features: ["Всё из Стандарта", "1 точка / 1 музыкальная зона", "Расширенное расписание", "Дополнительные зоны от 399 000", "Приоритетная поддержка"], highlight: false },
    ],
    plan_btn: "Начать бесплатно →", plan_recommended: "РЕКОМЕНДУЕМ", per_month: "сум / месяц",
    box_label: "FONMUSIC BOX", box_h: "📦 Автоматическая музыка 24/7",
    box_p: "Небольшая приставка, которая подключается к интернету и вашей аудиосистеме. Музыка запускается автоматически и не зависит от браузера или компьютера.",
    box_features: ["Автозапуск", "Работает 24/7", "Без компьютера", "Стабильно"],
    box_price: "750 000 сум · бесплатно при долгосрочном подключении: Базовый 12 мес. · Стандарт 9 мес. · Премиум 6 мес.", box_btn: "Заказать Box →",
    license_h: "Лицензированная музыка для бизнеса",
    license_p: "FonMusic использует лицензированный каталог Jamendo, предназначенный для коммерческого воспроизведения. Каждый клиент получает официальный сертификат.",
    license_list: ["✓ Кафе и кофейни", "✓ Рестораны", "✓ Магазины", "✓ Фитнес-клубы", "✓ Салоны красоты", "✓ Отели"],
    license_btn: "Подробнее о лицензии →",
    faq_label: "FAQ", faq_h: "Частые вопросы",
    faqs: [
      { q: "Можно ли использовать Spotify или YouTube в заведении?", a: "Нет. Spotify, YouTube и обычное радио запрещены для коммерческого использования. Их лицензия рассчитана только на личное прослушивание. FonMusic — это легальный сервис специально для бизнеса." },
      { q: "Нужен ли отдельный договор?", a: "Нет. Вы принимаете публичную оферту при регистрации. Факт оплаты является акцептом договора согласно законодательству РУз. После оплаты вы получаете электронный сертификат." },
      { q: "Как работает FonMusic Box?", a: "Это небольшая Android-приставка которая подключается к интернету и вашей аудиосистеме. После подключения музыка запускается автоматически и работает 24/7 без участия человека." },
      { q: "Можно ли слушать только через браузер?", a: "Да! Веб-плеер работает на любом устройстве — компьютере, планшете или телефоне. Просто откройте личный кабинет и нажмите Play." },
      { q: "Что будет если закончится подписка?", a: "Музыка автоматически остановится. Вы получите уведомление за 3 дня до окончания. После оплаты доступ возобновляется мгновенно." },
      { q: "Можно ли менять музыку самостоятельно?", a: "Да! В личном кабинете вы можете выбрать станцию вручную или настроить автоматическое расписание — музыка будет меняться по времени дня." },
    ],
    trial_label: "НАЧНИТЕ СЕГОДНЯ", trial_h: "7 дней", trial_accent: "бесплатно",
    trial_p: "Подключите ваше заведение уже сегодня. Музыка начнёт играть через несколько минут.",
    trial_btn: "Начать 7 дней бесплатно →",
    footer_desc: "Лицензированная фоновая музыка для бизнеса в Узбекистане",
    footer_nav: "Навигация", footer_legal: "Юридическое",
    footer_nav_links: [
      { label: "Как работает", href: "#how" },
      { label: "Демо", href: "#demo" },
      { label: "Тарифы", href: "/pricing" },
      { label: "Войти в кабинет", href: "/dashboard" },
    ],
    footer_legal_links: [
      { label: "Публичная оферта", href: "/offer" },
      { label: "Лицензия на музыку", href: "/license" },
      { label: "Политика конфиденциальности", href: "/privacy" },
    ],
    footer_copy: "© 2026 FonMusic.uz · Voxor Media Group",
    footer_sub: "Лицензированная музыка для бизнеса",
  },
  uz: {
    nav_login: "Kabinetga kirish", nav_login_short: "Kabinet",
    nav_free: "Bepul boshlash", nav_free_short: "7 kun bepul",
    nav_how: "Qanday ishlaydi", nav_demo: "Demo", nav_pricing: "Tariflar", nav_license: "Litsenziya",
    badge: "♪ LITSENZIYALANGAN MUSIQA · RASMIY",
    hero_h1: "Biznes uchun musiqa", hero_h1_accent: "reklama va xatarsiz",
    hero_p: "Kafe, restoran, do'kon, fitnes-klub va salonlar uchun litsenziyalangan fon musiqasi. Rasmiy sertifikat.",
    hero_btn1: "7 kun bepul sinab ko'ring", hero_btn2: "▶ Demo tinglash",
    stat1: "trek", stat2: "7 kun", stat3: "bepul", stat4: "qonuniy", stat5: "Sertifikat",
    risks_label: "⚠ MUHIM", risks_h: "Oddiy musiqa — biznes uchun xavf",
    risks: [
      { icon: "🚫", title: "Spotify va YouTube taqiqlangan", desc: "Tijoriy muassasalarda foydalanish litsenziya shartnomasini buzadi" },
      { icon: "💸", title: "Tekshirishda jarima", desc: "Inspektorlar noqonuniy musiqa uchun jiddiy sanksiyalar qo'llashi mumkin" },
      { icon: "📉", title: "Obro' xavfi", desc: "Tekshirishda voqea — muassasangiz imidjiga zarba" },
    ],
    how_label: "QANDAY ISHLAYDI", how_h: "Oddiy. Tez. Qonuniy.",
    steps: [
      { num: "01", icon: "☕", title: "Biznes turini tanlang", desc: "Kafe, restoran, do'kon, fitnes — tizim ideal musiqani tanlaydi" },
      { num: "02", icon: "🎵", title: "Tayyor dastur oling", desc: "Stansiyalar va jadval avtomatik sozlanadi" },
      { num: "03", icon: "▶", title: "Musiqa ishga tushiring", desc: "Brauzer yoki FonMusic Box orqali — musiqa 24/7 ishlaydi" },
      { num: "04", icon: "📄", title: "Siz himoyalangansiz", desc: "Tekshiruvchi organlar uchun JAMENDO rasmiy sertifikati" },
    ],
    step: "Qadam",
    demo_label: "DEMO", demo_h: "Muassasangiz atmosferasini eshiting", demo_p: "Katalogimizdan haqiqiy musiqa",
    demo_player_title: "Biznesingiz uchun musiqa tinglang", demo_player_p: "Muassasa turini tanlang va Play bosing",
    demo_loading: "Yuklanmoqda...", demo_play_hint: "Ijro etish uchun Play bosing", demo_next: "Keyingisi",
    demo_limit_h: "Demo tinglash yakunlandi",
    demo_limit_p: "Cheklovsiz tinglash va muassasada musiqani ishga tushirish uchun 7 kun bepul boshlang.",
    demo_limit_btn: "Bepul boshlash →",
    biz_label: "QAYSI BIZNESLAR UCHUN", biz_h: "Har bir muassasa uchun musiqa",
    pricing_label: "START TARIFLAR", pricing_h: "Birinchi ulanishlar uchun maxsus narxlar",
    plans: [
      { name: "Asosiy", price: "399 000", desc: "Kichik muassasalar uchun", popular: "", features: ["Brauzerda veb-pleer", "30 000+ trek", "Tayyor stansiyalar", "Reklamasiz", "Rasmiy sertifikat"], highlight: false },
      { name: "Standart", price: "599 000", desc: "Kafe, restoran va do'konlar uchun", popular: "Eng mashhur", features: ["Asosiydan hammasi", "Avtomatik jadval", "Masofaviy boshqaruv", "FonMusic Box ixtiyoriy", "24/7 musiqa"], highlight: true },
      { name: "Premium", price: "799 000", desc: "Zonalar va filiallar uchun", popular: "", features: ["Standartdan hammasi", "1 nuqta / 1 musiqa zonasi", "Kengaytirilgan jadval", "Qo'shimcha zonalar 399 000 dan", "Ustuvor yordam"], highlight: false },
    ],
    plan_btn: "Bepul boshlash →", plan_recommended: "TAVSIYA ETAMIZ", per_month: "so'm / oy",
    box_label: "FONMUSIC BOX", box_h: "📦 Avtomatik musiqa 24/7",
    box_p: "Internet va audio tizimingizga ulangan kichik pristavka. Musiqa avtomatik ishga tushadi va brauzer yoki kompyuterga bog'liq emas.",
    box_features: ["Avtoyoqish", "24/7 ishlaydi", "Kompyutersiz", "Barqaror"],
    box_price: "750 000 so'm · uzoq muddatli ulanishda bepul: Asosiy 12 oy · Standart 9 oy · Premium 6 oy", box_btn: "Box buyurtma qilish →",
    license_h: "Biznes uchun litsenziyalangan musiqa",
    license_p: "FonMusic tijoriy ijro uchun mo'ljallangan Jamendo litsenziyalangan katalogidan foydalanadi. Har bir mijoz rasmiy sertifikat oladi.",
    license_list: ["✓ Kafe va qahvaxonalar", "✓ Restoranlar", "✓ Do'konlar", "✓ Fitnes-klublar", "✓ Go'zallik salonlari", "✓ Mehmonxonalar"],
    license_btn: "Litsenziya haqida batafsil →",
    faq_label: "FAQ", faq_h: "Ko'p so'raladigan savollar",
    faqs: [
      { q: "Muassasada Spotify yoki YouTube ishlatish mumkinmi?", a: "Yo'q. Spotify, YouTube va oddiy radio tijoriy foydalanish uchun taqiqlangan. Ularning litsenziyasi faqat shaxsiy tinglash uchun mo'ljallangan. FonMusic — biznes uchun maxsus qonuniy xizmat." },
      { q: "Alohida shartnoma kerakmi?", a: "Yo'q. Ro'yxatdan o'tishda ommaviy ofertani qabul qilasiz. To'lov fakti O'zR qonunchiligiga muvofiq shartnomani qabul qilish hisoblanadi. To'lovdan so'ng elektron sertifikat olasiz." },
      { q: "FonMusic Box qanday ishlaydi?", a: "Bu internet va audio tizimingizga ulangan kichik Android pristavka. Ulanganidan so'ng musiqa avtomatik ishga tushadi va inson ishtirokisiz 24/7 ishlaydi." },
      { q: "Faqat brauzer orqali tinglash mumkinmi?", a: "Ha! Veb-pleer istalgan qurilmada ishlaydi — kompyuter, planshet yoki telefon. Shaxsiy kabinetni oching va Play bosing." },
      { q: "Obuna tugasa nima bo'ladi?", a: "Musiqa avtomatik to'xtaydi. Tugashdan 3 kun oldin xabar olasiz. To'lovdan so'ng kirish darhol tiklanadi." },
      { q: "Musiqani o'zim o'zgartira olamanmi?", a: "Ha! Shaxsiy kabinetda stansiyani qo'lda tanlash yoki avtomatik jadvalni sozlash mumkin — musiqa kun davomida o'zgarib turadi." },
    ],
    trial_label: "BUGUN BOSHLANG", trial_h: "7 kun", trial_accent: "bepul",
    trial_p: "Muassasangizni bugun ulang. Musiqa bir necha daqiqada boshlaydi.",
    trial_btn: "7 kun bepul boshlash →",
    footer_desc: "O'zbekistonda biznes uchun litsenziyalangan fon musiqasi",
    footer_nav: "Navigatsiya", footer_legal: "Huquqiy",
    footer_nav_links: [
      { label: "Qanday ishlaydi", href: "#how" },
      { label: "Demo", href: "#demo" },
      { label: "Tariflar", href: "/pricing" },
      { label: "Kabinetga kirish", href: "/dashboard" },
    ],
    footer_legal_links: [
      { label: "Ommaviy oferta", href: "/offer" },
      { label: "Musiqa litsenziyasi", href: "/license" },
      { label: "Maxfiylik siyosati", href: "/privacy" },
    ],
    footer_copy: "© 2026 FonMusic.uz · Voxor Media Group",
    footer_sub: "Biznes uchun litsenziyalangan musiqa",
  },
};

function DemoPlayer({ lang }: { lang: "ru" | "uz" }) {
  const t = T[lang];
  const DEMO_TRACK_LIMIT = 7;
  const [selectedBusiness, setSelectedBusiness] = useState(BUSINESS_TYPES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");
  const [playedCount, setPlayedCount] = useState(0);
  const [isDemoLimited, setIsDemoLimited] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<string[]>([]);
  const recentTracksRef = useRef<string[]>([]);
  const selectedBusinessRef = useRef(selectedBusiness);
  const playedCountRef = useRef(0);

  const getTrackTitle = (track: string) => track.replace(".mp3", "").split("-").slice(1).join(" ").trim();
  const getTrackSignature = (track: string) => getTrackTitle(track).toLowerCase().split(/\s+/).slice(0, 2).join(" ");

  const pickSmartTrack = (tracks: string[]) => {
    if (!tracks.length) return "";
    const recent = recentTracksRef.current;
    const recentSet = new Set(recent);
    const recentSignatures = new Set(recent.map(getTrackSignature));
    const lastTrack = recent[recent.length - 1];
    const lastSection = lastTrack ? Math.floor((tracks.indexOf(lastTrack) / Math.max(1, tracks.length)) * 5) : -1;
    const candidates = tracks
      .map((track, index) => ({ track, index, section: Math.floor((index / Math.max(1, tracks.length)) * 5) }))
      .filter(item => !recentSet.has(item.track))
      .filter(item => item.section !== lastSection)
      .filter(item => !recentSignatures.has(getTrackSignature(item.track)));
    const pool = candidates.length ? candidates : tracks.map((track, index) => ({ track, index, section: index }));
    return pool[Math.floor(Math.random() * pool.length)].track;
  };

  const stopForDemoLimit = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    setIsPlaying(false);
    setIsLoading(false);
    setIsDemoLimited(true);
  };

  const playTrack = (business: typeof BUSINESS_TYPES[0], track: string) => {
    if (playedCountRef.current >= DEMO_TRACK_LIMIT) {
      stopForDemoLimit();
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    setSelectedBusiness(business); selectedBusinessRef.current = business; setIsPlaying(false); setIsLoading(true);
    const url = `${BASE_URL}/${business.folder.replace(/ /g, "%20")}/${encodeURIComponent(track)}`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = 0.7;
    audio.oncanplay = () => {
      audio.oncanplay = null;
      if (audioRef.current !== audio) return;
      const nextCount = playedCountRef.current + 1;
      playedCountRef.current = nextCount;
      setIsLoading(false);
      setCurrentTrack(getTrackTitle(track));
      recentTracksRef.current = [...recentTracksRef.current, track].slice(-8);
      setPlayedCount(nextCount);
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };
    audio.onerror = () => { setIsLoading(false); setIsPlaying(false); };
    audio.onended = () => playNext();
  };

  const playStation = async (business: typeof BUSINESS_TYPES[0]) => {
    if (isDemoLimited) return;
    setSelectedBusiness(business); selectedBusinessRef.current = business; setIsPlaying(false); setIsLoading(true); setCurrentTrack("");
    recentTracksRef.current = [];
    try {
      const res = await fetch(`${BASE_URL}/${business.folder.replace(/ /g, "%20")}/playlist.json`);
      const data = await res.json();
      const tracks = data.map((t: any) => typeof t === "string" ? t : t.f).filter(Boolean);
      playlistRef.current = tracks;
      const track = pickSmartTrack(tracks);
      if (track) playTrack(business, track);
    } catch { setIsLoading(false); }
  };

  const playNext = async () => {
    if (playedCountRef.current >= DEMO_TRACK_LIMIT) {
      stopForDemoLimit();
      return;
    }
    const business = selectedBusinessRef.current;
    let tracks = playlistRef.current;
    if (!tracks.length) {
      setIsLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/${business.folder.replace(/ /g, "%20")}/playlist.json`);
        const data = await res.json();
        tracks = data.map((t: any) => typeof t === "string" ? t : t.f).filter(Boolean);
        playlistRef.current = tracks;
      } catch { setIsLoading(false); return; }
    }
    const track = pickSmartTrack(tracks);
    if (track) playTrack(business, track);
  };

  const togglePlay = () => {
    if (isDemoLimited) return;
    if (!audioRef.current) { playStation(selectedBusiness); return; }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; } }; }, []);

  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: "28px" }}>
      <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 8 }}>{t.demo_label}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{t.demo_player_title}</h3>
      <p style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>{t.demo_player_p}</p>
      {isDemoLimited && (
        <div style={{ padding: "18px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.28)", borderRadius: 14, marginBottom: 18, textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, marginBottom: 6 }}>{t.demo_limit_h}</div>
          <div style={{ fontSize: 12, color: "#8BA7BE", lineHeight: 1.6, marginBottom: 14 }}>{t.demo_limit_p}</div>
          <a href="/signup" style={{ display: "inline-block", padding: "11px 18px", background: "#C9A84C", color: "#0A1628", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>{t.demo_limit_btn}</a>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {BUSINESS_TYPES.map(b => (
          <button key={b.key} onClick={() => playStation(b)} disabled={isDemoLimited} style={{ padding: "10px 6px", borderRadius: 10, cursor: isDemoLimited ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", textAlign: "center", background: selectedBusiness.key === b.key ? `${b.color}25` : "rgba(255,255,255,0.03)", border: `1px solid ${selectedBusiness.key === b.key ? b.color : "rgba(255,255,255,0.06)"}`, opacity: isDemoLimited ? 0.55 : 1 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon}</div>
            <div style={{ fontSize: 10, color: selectedBusiness.key === b.key ? "#fff" : "#8BA7BE", fontWeight: selectedBusiness.key === b.key ? 700 : 400 }}>{b.name[lang]}</div>
          </button>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={togglePlay} disabled={isDemoLimited} style={{ width: 52, height: 52, borderRadius: "50%", background: selectedBusiness.color, border: "none", cursor: isDemoLimited ? "not-allowed" : "pointer", fontSize: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: isDemoLimited ? 0.55 : 1 }}>
          {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{selectedBusiness.icon} {selectedBusiness.station}</div>
          <div style={{ fontSize: 11, color: "#8BA7BE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {isDemoLimited ? t.demo_limit_h : isLoading ? t.demo_loading : currentTrack || t.demo_play_hint}
          </div>
        </div>
        <button onClick={playNext} disabled={isLoading || isDemoLimited} style={{ padding: "9px 12px", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 10, color: "#C9A84C", fontSize: 12, fontWeight: 700, cursor: isLoading ? "wait" : isDemoLimited ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", flexShrink: 0, opacity: isDemoLimited ? 0.55 : 1 }}>
          {t.demo_next} →
        </button>
      </div>
      {!isDemoLimited && playedCount > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#4a5a6a", textAlign: "center" }}>
          {playedCount}/{DEMO_TRACK_LIMIT}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLang] = useState<"ru" | "uz">("ru");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (!mounted) return null;

  const t = T[lang];
  const m = isMobile;
  const px = m ? 20 : 48;

  const LangSwitcher = () => (
    <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
      <button onClick={() => setLang("ru")} style={{ padding: "6px 12px", background: lang === "ru" ? "#C9A84C" : "transparent", color: lang === "ru" ? "#0A1628" : "#8BA7BE", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Georgia, serif" }}>RU</button>
      <button onClick={() => setLang("uz")} style={{ padding: "6px 12px", background: lang === "uz" ? "#C9A84C" : "transparent", color: lang === "uz" ? "#0A1628" : "#8BA7BE", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Georgia, serif" }}>UZ</button>
    </div>
  );

  return (
    <main style={{ fontFamily: "'Georgia', serif", background: "#0A1628", color: "#E8EFF5", overflowX: "hidden", width: "100%" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: `16px ${px}px`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isScrolled ? "rgba(8,12,18,0.97)" : "transparent", backdropFilter: isScrolled ? "blur(20px)" : "none", borderBottom: isScrolled ? "1px solid rgba(201,168,76,0.15)" : "none", transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 22, background: "#C9A84C", borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FonMusic</span>
        </div>
        {!m && (
          <div style={{ display: "flex", gap: 28, fontSize: 14 }}>
            <a href="#how" style={{ color: "#8BA7BE", textDecoration: "none" }}>{t.nav_how}</a>
            <a href="#demo" style={{ color: "#8BA7BE", textDecoration: "none" }}>{t.nav_demo}</a>
            <a href="/pricing" style={{ color: "#8BA7BE", textDecoration: "none" }}>{t.nav_pricing}</a>
            <a href="/license" style={{ color: "#8BA7BE", textDecoration: "none" }}>{t.nav_license}</a>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangSwitcher />
          <a href="/dashboard" style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#8BA7BE", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            {m ? t.nav_login_short : t.nav_login}
          </a>
          <a href="#trial" style={{ padding: m ? "9px 14px" : "9px 20px", background: "#C9A84C", color: "#0A1628", borderRadius: 8, fontSize: m ? 12 : 13, fontWeight: 700, textDecoration: "none" }}>
            {m ? t.nav_free_short : t.nav_free}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${m ? 100 : 120}px ${px}px ${m ? 60 : 80}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: m ? 300 : 700, height: m ? 300 : 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 100, fontSize: 11, color: "#C9A84C", letterSpacing: "0.08em", marginBottom: 28 }}>
          {t.badge}
        </div>
        <h1 style={{ fontSize: m ? 36 : 64, fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: "#fff", maxWidth: 700 }}>
          {t.hero_h1}<br /><span style={{ color: "#C9A84C" }}>{t.hero_h1_accent}</span>
        </h1>
        <p style={{ fontSize: m ? 15 : 18, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>{t.hero_p}</p>
        <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: 12, width: m ? "100%" : "auto", marginBottom: 48 }}>
          <a href="#trial" style={{ padding: m ? "18px 24px" : "16px 36px", background: "#C9A84C", color: "#0A1628", borderRadius: 12, fontSize: m ? 16 : 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.3)", textAlign: "center" }}>{t.hero_btn1}</a>
          <a href="#demo" style={{ padding: m ? "18px 24px" : "16px 36px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 12, fontSize: m ? 16 : 17, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>{t.hero_btn2}</a>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: m ? 12 : 32 }}>
          {[{ val: "30 000+", label: t.stat1 }, { val: t.stat2, label: t.stat3 }, { val: "100%", label: t.stat4 }, { val: "📄", label: t.stat5 }].map(item => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: m ? 20 : 26, fontWeight: 700, color: "#C9A84C" }}>{item.val}</div>
              <div style={{ fontSize: 12, color: "#8BA7BE", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RISKS */}
      <section style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#EF4444", letterSpacing: "0.15em", marginBottom: 10 }}>{t.risks_label}</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>{t.risks_h}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {t.risks.map(r => (
              <div key={r.title} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px", background: "#0D1B2A", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>{t.how_label}</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>{t.how_h}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {t.steps.map((step, i) => (
              <div key={step.num} style={{ display: "flex", gap: 16, alignItems: "center", padding: "20px", background: "#0D1B2A", border: `1px solid ${i === 0 ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: i === 0 ? "rgba(201,168,76,0.15)" : "rgba(26,107,154,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{step.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: "#C9A84C", marginBottom: 2 }}>{t.step} {step.num}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "#8BA7BE" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>{t.demo_label}</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>{t.demo_h}</h2>
            <p style={{ fontSize: 14, color: "#8BA7BE", marginTop: 10 }}>{t.demo_p}</p>
          </div>
          <DemoPlayer lang={lang} />
        </div>
      </section>

      {/* FOR BUSINESS */}
      <section style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>{t.biz_label}</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>{t.biz_h}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }}>
            {BUSINESS_TYPES.map(b => (
              <a key={b.key} href="#demo" style={{ padding: "20px 12px", background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, textAlign: "center", textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{b.name[lang]}</div>
                <div style={{ fontSize: 11, color: "#8BA7BE" }}>{b.desc[lang]}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>{t.pricing_label}</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{t.pricing_h}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {t.plans.map(plan => (
              <div key={plan.name} style={{ padding: "24px", background: plan.highlight ? "linear-gradient(135deg, rgba(26,107,154,0.3), rgba(13,61,94,0.3))" : "#0D1B2A", border: `2px solid ${plan.highlight ? "#C9A84C" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, position: "relative" }}>
                {plan.highlight && <div style={{ position: "absolute", top: -12, right: 20, background: "#C9A84C", color: "#0A1628", padding: "4px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{t.plan_recommended}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{plan.name}</div>
                    <div style={{ fontSize: 13, color: "#8BA7BE" }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#C9A84C" }}>{plan.price}</div>
                    <div style={{ fontSize: 11, color: "#8BA7BE" }}>{t.per_month}</div>
                  </div>
                </div>
                {plan.popular && <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 12, padding: "4px 10px", background: "rgba(34,197,94,0.1)", borderRadius: 6, display: "inline-block" }}>⭐ {plan.popular}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#C9A84C", fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 13, color: plan.highlight ? "#E8EFF5" : "#8BA7BE" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/pricing" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 10, background: plan.highlight ? "#C9A84C" : "rgba(201,168,76,0.1)", border: plan.highlight ? "none" : "1px solid rgba(201,168,76,0.3)", color: plan.highlight ? "#0A1628" : "#C9A84C", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t.plan_btn}</a>
              </div>
            ))}
          </div>

          {/* BOX */}
          <div style={{ background: "linear-gradient(135deg, #0D1B2A, #162435)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "28px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 8 }}>{t.box_label}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{t.box_h}</h3>
            <p style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 16 }}>{t.box_p}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {t.box_features.map(f => <span key={f} style={{ padding: "5px 12px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 100, fontSize: 12, color: "#C9A84C" }}>{f}</span>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>750 000 сум</div>
                <div style={{ fontSize: 12, color: "#8BA7BE" }}>{t.box_price}</div>
              </div>
              <a href="https://t.me/fonmusic2026" target="_blank" style={{ padding: "13px 24px", background: "#C9A84C", color: "#0A1628", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t.box_btn}</a>
            </div>
          </div>
        </div>
      </section>

      {/* LICENSE */}
      <section style={{ padding: `64px ${px}px` }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h2 style={{ fontSize: m ? 22 : 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.license_h}</h2>
            <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 24, maxWidth: 460, margin: "0 auto 24px" }}>{t.license_p}</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 24 }}>
              {t.license_list.map(f => <span key={f} style={{ fontSize: 13, color: "#22C55E" }}>{f}</span>)}
            </div>
            <a href="/license" style={{ display: "inline-block", padding: "12px 28px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{t.license_btn}</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: `64px ${px}px`, background: "#0A0F18" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 10 }}>{t.faq_label}</div>
            <h2 style={{ fontSize: m ? 26 : 36, fontWeight: 700, color: "#fff" }}>{t.faq_h}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {t.faqs.map((faq, i) => (
              <div key={i} style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "left" }}>{faq.q}</span>
                  <span style={{ color: "#C9A84C", fontSize: 18, flexShrink: 0 }}>{openFaq === i ? "▲" : "▼"}</span>
                </button>
                {openFaq === i && <div style={{ padding: "0 20px 18px", fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIAL */}
      <section id="trial" style={{ padding: `64px ${px}px`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12 }}>{t.trial_label}</div>
          <h2 style={{ fontSize: m ? 32 : 44, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.trial_h} <span style={{ color: "#C9A84C" }}>{t.trial_accent}</span></h2>
          <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.6, marginBottom: 32 }}>{t.trial_p}</p>
          <a href="/signup" style={{ display: "block", padding: "20px", background: "#C9A84C", color: "#0A1628", borderRadius: 14, fontSize: 18, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(201,168,76,0.35)", marginBottom: 16 }}>{t.trial_btn}</a>
          <div style={{ fontSize: 13, color: "#8BA7BE" }}>
            или <a href="tel:+998994100910" style={{ color: "#C9A84C", textDecoration: "none" }}>+998 99 410 09 10</a> · <a href="https://t.me/fonmusic2026" style={{ color: "#C9A84C", textDecoration: "none" }}>Telegram</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: `40px ${px}px`, borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0A0F18" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 18, background: "#C9A84C", borderRadius: 2 }} />
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>FonMusic</span>
              </div>
              <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 12 }}>{t.footer_desc}</div>
              <LangSwitcher />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.footer_nav}</div>
              {t.footer_nav_links.map(l => <div key={l.label} style={{ marginBottom: 8 }}><a href={l.href} style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>{l.label}</a></div>)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{t.footer_legal}</div>
              {t.footer_legal_links.map(l => <div key={l.label} style={{ marginBottom: 8 }}><a href={l.href} style={{ fontSize: 13, color: "#8BA7BE", textDecoration: "none" }}>{l.label}</a></div>)}
              <div style={{ marginTop: 16, fontSize: 13, color: "#8BA7BE" }}>
                <div><a href="tel:+998994100910" style={{ color: "#C9A84C", textDecoration: "none" }}>+998 99 410 09 10</a></div>
                <div><a href="https://t.me/fonmusic2026" style={{ color: "#8BA7BE", textDecoration: "none" }}>Telegram</a></div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>{t.footer_copy}</div>
            <div style={{ fontSize: 12, color: "#4a5a6a" }}>{t.footer_sub}</div>
          </div>
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { max-width: 100vw; overflow-x: hidden; scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}
