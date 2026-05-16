"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeBackButton() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  return (
    <Link
      href="/"
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 2147483000,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 14px",
        background: "rgba(13,27,42,0.92)",
        border: "1px solid rgba(201,168,76,0.35)",
        borderRadius: 999,
        color: "#C9A84C",
        textDecoration: "none",
        fontFamily: "Georgia, serif",
        fontSize: 13,
        fontWeight: 800,
        boxShadow: "0 12px 34px rgba(0,0,0,0.28)",
        backdropFilter: "blur(10px)",
      }}
    >
      ← Вернуться на главную
    </Link>
  );
}
