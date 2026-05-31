import { NextResponse } from "next/server";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "Anonymous").slice(0, 120);
  const email = String(form.get("email") ?? "").slice(0, 160);
  const subject = String(form.get("subject") ?? "Velmère message").slice(0, 180);
  const message = String(form.get("message") ?? "").slice(0, 6000);
  const attachment = form.get("attachment");

  if (!subject.trim() || !message.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const fileInfo = attachment instanceof File && attachment.size > 0
    ? { name: attachment.name, type: attachment.type, size: attachment.size }
    : null;

  if (fileInfo && fileInfo.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  const to = process.env.CONTACT_TO_EMAIL || "velmere141@gmail.com";
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Velmère <onboarding@resend.dev>",
        to,
        subject: `[VELMÈRE] ${subject}`,
        text: `Name: ${name}\nEmail: ${email || "not provided"}\nAttachment: ${fileInfo ? `${fileInfo.name} (${fileInfo.size} bytes)` : "none"}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "mail_provider_failed" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, delivered: Boolean(resendKey), to, file: fileInfo });
}
