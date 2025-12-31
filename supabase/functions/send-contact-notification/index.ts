import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string;
  contactMethod: string;
  inverterSizing: {
    totalWattage: number;
    recommendedInverterSize: number;
    appliances: Array<{
      name: string;
      wattage: number;
      quantity: number;
    }>;
  } | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const data: ContactNotificationRequest = await req.json();
    console.log("Received contact notification request:", data);

    const appliancesList = data.inverterSizing?.appliances
      ?.map(a => `${a.name} (${a.wattage}W x ${a.quantity})`)
      .join("<br>") || "No appliances selected";

    const emailHtml = `
      <h1>New Contact Form Submission</h1>
      <h2>Contact Details</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <p><strong>Location:</strong> ${data.location || "Not provided"}</p>
      <p><strong>Preferred Contact Method:</strong> ${data.contactMethod}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      
      <h2>Inverter Sizing Details</h2>
      ${data.inverterSizing ? `
        <p><strong>Total Wattage:</strong> ${data.inverterSizing.totalWattage}W</p>
        <p><strong>Recommended Inverter Size:</strong> ${data.inverterSizing.recommendedInverterSize} kVA</p>
        <h3>Selected Appliances:</h3>
        <p>${appliancesList}</p>
      ` : "<p>No inverter sizing data available</p>"}
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "InverterSize <onboarding@resend.dev>",
        to: ["samueldavid4star@gmail.com"],
        subject: `New Contact: ${data.name} - InverterSize`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    if (!res.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
