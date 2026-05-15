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
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = String(body.plan || "standard");
    if (!PLAN_LABELS[plan]) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const payload = {
      client_id: body.clientId || null,
      plan,
      company_name: String(body.companyName || "").trim(),
      tin: String(body.tin || "").trim(),
      legal_address: String(body.legalAddress || "").trim(),
      contact_name: String(body.contactName || "").trim(),
      phone: String(body.phone || "").trim(),
      messenger: String(body.messenger || "").trim(),
      email: String(body.email || "").trim(),
      locations_count: Math.max(1, Number(body.locationsCount || 1)),
      needs_box: Boolean(body.needsBox),
      comment: String(body.comment || "").trim(),
      status: "new",
    };

    if (!payload.company_name || !payload.phone || !payload.contact_name) {
      return NextResponse.json({ error: "required fields missing" }, { status: 400 });
    }

    const inserted = await supabaseServerFetch("invoice_requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await sendTelegram([
      "📄 Заявка на счёт / договор FonMusic",
      "",
      `Тариф: ${PLAN_LABELS[plan]}`,
      `Организация: ${payload.company_name}`,
      `ИНН: ${payload.tin || "-"}`,
      `Адрес: ${payload.legal_address || "-"}`,
      `Контакт: ${payload.contact_name}`,
      `Телефон: ${payload.phone}`,
      `Мессенджер: ${payload.messenger || "-"}`,
      `Email: ${payload.email || "-"}`,
      `Точек: ${payload.locations_count}`,
      `FonMusic Box: ${payload.needs_box ? "да" : "нет"}`,
      payload.client_id ? `Client ID: ${payload.client_id}` : "",
      inserted?.[0]?.id ? `Request ID: ${inserted[0].id}` : "",
      payload.comment ? `Комментарий: ${payload.comment}` : "",
    ].filter(Boolean).join("\n"));

    return NextResponse.json({ success: true, request: inserted?.[0] || null });
  } catch {
    return NextResponse.json({ error: "invoice request failed" }, { status: 500 });
  }
}
