import { NextRequest, NextResponse } from "next/server";

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
