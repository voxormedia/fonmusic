"use client";

import { useEffect, useState } from "react";

function canUseLocalStorage() {
  try {
    const key = "fonmusic_compat_test";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function detectCompatibilityIssue() {
  if (typeof window === "undefined") return "";
  if (!("fetch" in window)) return "Браузер не поддерживает современные сетевые запросы.";
  if (!("Promise" in window)) return "Браузер слишком старый для запуска кабинета FonMusic.";
  if (!("Audio" in window)) return "Браузер не поддерживает HTML5 Audio.";
  if (!canUseLocalStorage()) return "В браузере недоступно локальное хранилище. Включите cookies/storage или откройте обычное окно браузера.";
  return "";
}

export default function BrowserCompatibility() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const issue = detectCompatibilityIssue();
    if (issue) {
      window.setTimeout(() => setMessage(issue), 0);
    }

    const onError = (event: ErrorEvent) => {
      const text = event.message || "";
      if (/script error/i.test(text)) return;
      setMessage("Произошла ошибка запуска сайта в браузере. Обновите страницу или откройте сайт в последней версии Chrome/Edge.");
    };

    const onUnhandledRejection = () => {
      setMessage("Браузер заблокировал часть функций сайта. Обновите страницу или попробуйте открыть сайт в обычном окне Chrome/Edge.");
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  if (!message) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2147483647, background: "rgba(10,22,40,0.96)", color: "#E8EFF5", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Georgia, serif" }}>
      <div style={{ width: "100%", maxWidth: 460, background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 18, padding: 26, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}>
        <div style={{ fontSize: 42, marginBottom: 14 }}>⚠️</div>
        <h1 style={{ fontSize: 22, color: "#fff", marginBottom: 10 }}>FonMusic не запустился в этом браузере</h1>
        <p style={{ fontSize: 14, color: "#8BA7BE", lineHeight: 1.7, marginBottom: 18 }}>{message}</p>
        <div style={{ textAlign: "left", fontSize: 13, color: "#8BA7BE", lineHeight: 1.8, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
          <div>1. Обновите страницу.</div>
          <div>2. Откройте сайт в последней версии Chrome или Edge.</div>
          <div>3. Если ошибка DNS, выполните в Windows: ipconfig /flushdns.</div>
        </div>
        <button onClick={() => window.location.reload()} style={{ width: "100%", padding: 14, background: "#C9A84C", border: "none", borderRadius: 12, color: "#0A1628", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 10 }}>
          Обновить страницу
        </button>
        <a href="https://t.me/fonmusic2026" target="_blank" style={{ display: "block", color: "#8BA7BE", fontSize: 13, textDecoration: "none" }}>
          Написать в поддержку
        </a>
      </div>
    </div>
  );
}
