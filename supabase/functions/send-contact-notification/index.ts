import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://invertercalculator.lovable.app",
  "https://id-preview--b5919fc5-d180-474e-8112-3cc5bfc9e459.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) : str;
}

interface ContactNotificationRequest {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  message: string;
  contactMethod: string;
  inverterSizing?: Record<string, unknown>;
  pdfContent?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContactNotificationRequest = await req.json();

    // Validate required fields and lengths
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!data.message || typeof data.message !== "string" || data.message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!data.contactMethod || typeof data.contactMethod !== "string") {
      return new Response(
        JSON.stringify({ error: "Contact method is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Truncate to prevent oversized payloads
    const safeName = truncate(data.name.trim(), 200);
    const safeEmail = data.email ? truncate(data.email.trim(), 255) : "N/A";
    const safePhone = data.phone ? truncate(data.phone.trim(), 50) : "N/A";
    const safeLocation = data.location ? truncate(data.location.trim(), 300) : "N/A";
    const safeMessage = truncate(data.message.trim(), 5000);
    const safeMethod = truncate(data.contactMethod.trim(), 50);

    // Log only non-PII metadata
    console.log("Contact request received", {
      contactMethod: safeMethod,
      hasInverterSizing: !!data.inverterSizing,
      timestamp: new Date().toISOString(),
    });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>
      <p><strong>Location:</strong> ${escapeHtml(safeLocation)}</p>
      <p><strong>Contact Method:</strong> ${escapeHtml(safeMethod)}</p>
      <p><strong>Message:</strong> ${escapeHtml(safeMessage)}</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Inverter Calculator <onboarding@resend.dev>",
        to: ["admin@example.com"],
        subject: `New Contact: ${escapeHtml(safeName)}`,
        html: emailBody,
      }),
    });

    if (!res.ok) {
      console.error("Email send failed with status:", res.status);
      return new Response(
        JSON.stringify({ error: "Failed to send notification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error");
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
