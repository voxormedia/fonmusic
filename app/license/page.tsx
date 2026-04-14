"use client";

export default function LicensePage() {
  return (
    <main style={{ fontFamily: "Georgia, serif", background: "#080C12", color: "#E8EFF5", minHeight: "100vh" }}>
      <nav style={{ padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 20, background: "#C9A84C", borderRadius: 2 }} />
          <a href="/" style={{ fontSize: 18, fontWeight: 700, color: "#fff", textDecoration: "none" }}>FonMusic</a>
        </div>
        <a href="/signup" style={{ fontSize: 13, color: "#080C12", background: "#C9A84C", textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700 }}>
          Попробовать бесплатно
        </a>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 28px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 12 }}>ЛИЦЕНЗИЯ НА МУЗЫКУ</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Лицензионное соглашение</h1>
          <p style={{ fontSize: 13, color: "#4a5a6a" }}>Редакция от 1 апреля 2026 года · FonMusic.uz</p>
        </div>

        {/* KEY BLOCK */}
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 16, padding: "24px 28px", marginBottom: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", marginBottom: 10 }}>✓ Музыка FonMusic легальна для вашего бизнеса</div>
          <div style={{ fontSize: 13, color: "#8BA7BE", lineHeight: 1.7 }}>
            Весь музыкальный контент в сервисе FonMusic лицензирован для коммерческого воспроизведения в публичных местах. Вы получаете официальный сертификат после оплаты подписки.
          </div>
        </div>

        {[
          {
            title: "1. О лицензии Jamendo",
            content: `FonMusic использует музыкальный каталог платформы Jamendo на основании коммерческой лицензии (Jamendo Licensing — Business License).

Jamendo — это одна из крупнейших в мире платформ лицензированной музыки для бизнеса. Лицензия охватывает более 600 000 треков от независимых исполнителей со всего мира.

Коммерческая лицензия Jamendo разрешает:
— Воспроизведение музыки в публичных местах
— Использование в коммерческих заведениях
— Непрерывное фоновое воспроизведение 24/7`
          },
          {
            title: "2. Что разрешает лицензия",
            content: `Лицензия FonMusic разрешает использование музыки в следующих типах заведений:

✓ Кафе и кофейни
✓ Рестораны и столовые
✓ Магазины и бутики
✓ Супермаркеты и торговые центры
✓ Фитнес-клубы и спортзалы
✓ Салоны красоты и парикмахерские
✓ SPA-салоны и wellness-центры
✓ Отели и хостелы
✓ Бары и лаунж-зоны
✓ Офисы и коворкинги

Музыка может воспроизводиться непрерывно через веб-плеер или устройство FonMusic Box.`
          },
          {
            title: "3. Чем FonMusic отличается от Spotify и YouTube",
            content: `Многие владельцы бизнеса используют Spotify, YouTube или обычное радио в своих заведениях. Это является нарушением авторских прав.

Spotify — лицензия только для личного прослушивания. Использование в коммерческих целях запрещено пользовательским соглашением Spotify.

YouTube — аналогично. Публичное воспроизведение в заведении является нарушением.

Обычное радио — трансляция радиосигнала в коммерческом заведении также требует отдельной лицензии.

FonMusic — специально лицензированный сервис для бизнеса. Использование полностью легально.`
          },
          {
            title: "4. Сертификат лицензии",
            content: `После оплаты подписки каждый клиент FonMusic получает официальный электронный сертификат.

Сертификат содержит:
— Название заведения
— Период действия лицензии
— Тип лицензии (Jamendo Commercial License)
— QR-код для проверки

Сертификат предъявляется при проверках контролирующими органами как подтверждение легальности используемой музыки.`
          },
          {
            title: "5. Ограничения лицензии",
            content: `Лицензия FonMusic не разрешает:

✗ Воспроизведение музыки за пределами заведения Клиента
✗ Перепродажу или передачу лицензии третьим лицам
✗ Использование музыки в рекламных материалах, видео, подкастах
✗ Скачивание и распространение треков
✗ Синхронизацию музыки с видеоконтентом для публичного показа

Для использования музыки в иных целях необходимо получить отдельную лицензию.`
          },
          {
            title: "6. Срок действия лицензии",
            content: `Лицензия действует в течение оплаченного периода подписки.

При продлении подписки лицензия автоматически продлевается.

При истечении или отмене подписки право на воспроизведение музыки прекращается. Сервис автоматически останавливает воспроизведение.`
          },
          {
            title: "7. Проверки и ответственность",
            content: `При проверке контролирующими органами Клиент обязан предъявить сертификат лицензии FonMusic.

FonMusic не несёт ответственности за нарушения, допущенные Клиентом до момента оформления подписки, а также за использование музыки с нарушением условий настоящего соглашения.

Использование сервиса в соответствии с условиями подписки полностью освобождает Клиента от претензий, связанных с авторскими правами на воспроизводимую музыку.`
          },
          {
            title: "8. Контакты",
            content: `По вопросам лицензирования и получения сертификата:

ООО «Voxor Media Group»
Телефон: +998 99 410 09 10
Telegram: @fonmusic2026
Сайт: fonmusic.uz`
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
              {section.title}
            </h2>
            <div style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {section.content}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{ marginTop: 60, padding: "32px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Получите сертификат лицензии</div>
          <div style={{ fontSize: 13, color: "#8BA7BE", marginBottom: 20 }}>Зарегистрируйтесь и попробуйте FonMusic 10 дней бесплатно</div>
          <a href="/signup" style={{ display: "inline-block", padding: "14px 32px", background: "#C9A84C", color: "#080C12", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Начать бесплатно →
          </a>
        </div>
      </div>

      <footer style={{ padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: "#4a5a6a" }}>© 2026 FonMusic.uz · Voxor Media Group</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="/offer" style={{ fontSize: 12, color: "#4a5a6a", textDecoration: "none" }}>Оферта</a>
          <a href="/privacy" style={{ fontSize: 12, color: "#4a5a6a", textDecoration: "none" }}>Конфиденциальность</a>
          <a href="/license" style={{ fontSize: 12, color: "#C9A84C", textDecoration: "none" }}>Лицензия</a>
        </div>
      </footer>
    </main>
  );
}
