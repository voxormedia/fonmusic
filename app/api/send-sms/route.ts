import { NextRequest, NextResponse } from "next/server";

const ESKIZ_EMAIL = process.env.ESKIZ_EMAIL || "";
const ESKIZ_PASSWORD = process.env.ESKIZ_PASSWORD || "";
const ESKIZ_FROM = process.env.ESKIZ_FROM || "4546";

async function getEskizToken(): Promise<string | null> {
  if (!ESKIZ_EMAIL || !ESKIZ_PASSWORD) return null;
  try {
    const res = await fetch("https://notify.eskiz.uz/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ESKIZ_EMAIL, password: ESKIZ_PASSWORD }),
    });
    const data = await res.json();
    return data?.data?.token || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, password, name } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "phone and password required" }, { status: 400 });
    }

    const token = await getEskizToken();
    if (!token) {
      return NextResponse.json({ error: "Eskiz auth failed" }, { status: 500 });
    }

    // Убираем + из номера для Eskiz
    const cleanPhone = phone.replace("+", "");

    const message = `FonMusic.uz\nDobro pozhalovat, ${name}!\nVash parol: ${password}\nKabinet: fonmusic.uz/login`;

    const smsRes = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message,
        from: ESKIZ_FROM,
      }),
    });

    const smsData = await smsRes.json();

    if (smsData.status === "waiting" || smsData.id) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "SMS send failed", details: smsData }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
