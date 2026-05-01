import { NextRequest, NextResponse } from "next/server";
import { supabaseServerFetch } from "@/lib/supabaseServer";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Telegram env is not configured");
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });

  if (!res.ok) {
    throw new Error("Telegram request failed");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body?.type;

    if (type === "signup") {
      const text = [
        "New FonMusic signup",
        "",
        `Business: ${body.name || "-"}`,
        `Phone: ${body.phone || "-"}`,
        `Type: ${body.businessType || "-"}`,
        "Account created automatically",
      ].join("\n");
      await sendTelegram(text);
      return NextResponse.json({ success: true });
    }

    if (type === "forgot-password") {
      const phone = String(body.phone || "");
      if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
      const clients = await supabaseServerFetch(`clients?phone=eq.${encodeURIComponent(phone)}&select=name,phone`);
      const text = clients?.length
        ? `Password recovery request\n\nBusiness: ${clients[0].name}\nPhone: ${clients[0].phone}`
        : `Password recovery request from unknown phone: ${phone}`;
      await sendTelegram(text);
      return NextResponse.json({ success: true });
    }

    if (type === "demo-lead") {
      const text = [
        "New FonMusic demo lead",
        "",
        `Business: ${body.name || "-"}`,
        `Phone: ${body.phone || "-"}`,
        `Type: ${body.businessType || "-"}`,
      ].join("\n");
      await sendTelegram(text);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "unknown notification type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "telegram notification failed" }, { status: 500 });
  }
}
