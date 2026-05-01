import { NextRequest, NextResponse } from "next/server";
import { supabaseServerFetch } from "@/lib/supabaseServer";

function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `+${digits}` : "";
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    const normalizedPhone = normalizePhone(String(phone || ""));
    const normalizedCode = String(code || "");

    if (!normalizedPhone || normalizedCode.length !== 4) {
      return NextResponse.json({ error: "phone and 4-digit code required" }, { status: 400 });
    }

    const rows = await supabaseServerFetch(
      `sms_codes?phone=eq.${encodeURIComponent(normalizedPhone)}&used=eq.false&order=created_at.desc&limit=1&select=*`
    );

    if (!rows?.length) {
      return NextResponse.json({ error: "code not found" }, { status: 400 });
    }

    const smsCode = rows[0];
    if (new Date(smsCode.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "code expired" }, { status: 400 });
    }

    if ((smsCode.attempts || 0) >= 5) {
      return NextResponse.json({ error: "too many attempts" }, { status: 429 });
    }

    if (smsCode.code !== normalizedCode) {
      await supabaseServerFetch(`sms_codes?id=eq.${smsCode.id}`, {
        method: "PATCH",
        body: JSON.stringify({ attempts: (smsCode.attempts || 0) + 1 }),
      });
      return NextResponse.json({ error: "invalid code" }, { status: 400 });
    }

    await supabaseServerFetch(`sms_codes?id=eq.${smsCode.id}`, {
      method: "PATCH",
      body: JSON.stringify({ used: true, verified_at: new Date().toISOString() }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
