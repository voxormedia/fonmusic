import { NextRequest, NextResponse } from "next/server";
import { supabaseServerFetch } from "@/lib/supabaseServer";

const ESKIZ_EMAIL = process.env.ESKIZ_EMAIL || "";
const ESKIZ_PASSWORD = process.env.ESKIZ_PASSWORD || "";
const ESKIZ_FROM = process.env.ESKIZ_FROM || "4546";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function getEskizToken(): Promise<string | null> {
  if (!ESKIZ_EMAIL || !ESKIZ_PASSWORD) return null;
  const res = await fetch("https://notify.eskiz.uz/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ESKIZ_EMAIL, password: ESKIZ_PASSWORD }),
  });
  const data = await res.json();
  return data?.data?.token || null;
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const cleanPhone = normalizePhone(String(phone || ""));
    if (cleanPhone.length < 12) {
      return NextResponse.json({ error: "valid phone required" }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabaseServerFetch("sms_codes", {
      method: "POST",
      body: JSON.stringify({
        phone: `+${cleanPhone}`,
        code,
        expires_at: expiresAt,
        attempts: 0,
        used: false,
      }),
    });

    const token = await getEskizToken();
    if (!token) {
      return NextResponse.json({ error: "Eskiz auth failed" }, { status: 500 });
    }

    const smsRes = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message: `Код подтверждения для регистрации на сайте Fonmusic.uz: ${code}`,
        from: ESKIZ_FROM,
      }),
    });

    const smsData = await smsRes.json();
    if (smsData.status === "waiting" || smsData.id) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "SMS send failed" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
