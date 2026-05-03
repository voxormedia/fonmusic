import { NextRequest, NextResponse } from "next/server";
import { supabaseServerFetch } from "@/lib/supabaseServer";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const PLAN_LABELS: Record<string, string> = {
  basic: "Базовый",
  standard: "Стандарт",
  premium: "Премиум",
};

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Telegram env is not configured");
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });

  if (!res.ok) throw new Error("Telegram request failed");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = String(body.plan || "");
    if (!PLAN_LABELS[plan]) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const clientId = String(body.clientId || "");
    const requestedAt = new Date().toISOString();
    let client: any = null;

    if (clientId) {
      try {
        const clients = await supabaseServerFetch(`clients?id=eq.${encodeURIComponent(clientId)}&select=*`);
        client = clients?.[0] || null;
      } catch {
        client = null;
      }
    }

    const name = String(body.name || client?.name || "-");
    const phone = String(body.phone || client?.phone || "-");
    const locationName = String(body.locationName || client?.name || "-");
    const paymentMethod = String(body.paymentMethod || "bank_transfer");
    const comment = String(body.comment || "").trim();
    const planLabel = PLAN_LABELS[plan];

    const text = [
      "💳 Заявка на тариф FonMusic",
      "",
      `Тариф: ${planLabel}`,
      `Клиент: ${name}`,
      `Телефон: ${phone}`,
      `Заведение: ${locationName}`,
      `Оплата: ${paymentMethod === "three_months_box" ? "3 месяца + FonMusic Box" : "Помесячно / банковский перевод"}`,
      client?.id ? `Client ID: ${client.id}` : clientId ? `Client ID: ${clientId}` : "",
      comment ? `Комментарий: ${comment}` : "",
    ].filter(Boolean).join("\n");

    await sendTelegram(text);

    if (client?.id) {
      const previousNotes = client.notes ? `${client.notes}\n\n` : "";
      const note = [
        `${previousNotes}Заявка на тариф`,
        `Дата: ${new Date(requestedAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })}`,
        `Тариф: ${plan}`,
        `Телефон: ${phone}`,
        `Оплата: ${paymentMethod}`,
        comment ? `Комментарий: ${comment}` : "",
      ].filter(Boolean).join("\n");

      try {
        await supabaseServerFetch(`clients?id=eq.${client.id}`, {
          method: "PATCH",
          body: JSON.stringify({ notes: note }),
        });
      } catch {
        // Telegram-заявка важнее: если заметка не записалась, не ломаем путь клиента.
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "tariff request failed" }, { status: 500 });
  }
}
