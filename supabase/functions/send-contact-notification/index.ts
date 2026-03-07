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

    // Log only non-PII metadata
    console.log("Contact request received", {
      contactMethod: data.contactMethod,
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
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email || "N/A"}</p>
      <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
      <p><strong>Location:</strong> ${data.location || "N/A"}</p>
      <p><strong>Contact Method:</strong> ${data.contactMethod}</p>
      <p><strong>Message:</strong> ${data.message}</p>
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
        subject: `New Contact: ${data.name}`,
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
