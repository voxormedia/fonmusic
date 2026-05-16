"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("FonMusic client error", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", background: "#0A1628", color: "#E8EFF5", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Georgia, serif" }}>
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center", background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.28)", borderRadius: 18, padding: 28 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
        <h1 style={{ fontSize: 24, color: "#fff", marginBottom: 10 }}>Не удалось открыть FonMusic</h1>
        <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 22 }}>
          Обновите страницу. Если вы на Windows, откройте сайт в последней версии Chrome или Edge.
        </p>
        <button onClick={reset} style={{ width: "100%", padding: 15, background: "#C9A84C", border: "none", borderRadius: 12, color: "#0A1628", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 12 }}>
          Попробовать снова
        </button>
        <a href="https://t.me/fonmusic2026" target="_blank" style={{ color: "#8BA7BE", fontSize: 13, textDecoration: "none" }}>
          Написать в поддержку
        </a>
      </div>
    </main>
  );
}
