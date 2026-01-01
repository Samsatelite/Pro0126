import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Appliance {
  name: string;
  wattage: number;
  quantity: number;
  isHeavyDuty?: boolean;
  soloOnly?: boolean;
}

interface Calculations {
  totalLoad?: number;
  peakSurge?: number;
  requiredKva?: number;
  recommendedInverter?: number;
  warnings?: string[];
  recommendations?: string[];
}

interface InverterSizing {
  appliances?: Appliance[];
  calculations?: Calculations;
  totalWattage?: number;
  recommendedInverterSize?: number;
}

interface ContactNotificationRequest {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string;
  contactMethod: string;
  inverterSizing: InverterSizing | null;
}

function generatePDFReport(sizing: InverterSizing, contactName: string): string {
  const appliances = sizing.appliances ?? [];
  const calcs = sizing.calculations ?? {};
  
  const totalLoad = calcs.totalLoad ?? sizing.totalWattage ?? 0;
  const requiredKva = calcs.requiredKva ?? 0;
  const recommendedInverter = calcs.recommendedInverter ?? sizing.recommendedInverterSize ?? 0;
  const peakSurge = calcs.peakSurge ?? 0;
  const warnings = calcs.warnings ?? [];
  const recommendations = calcs.recommendations ?? [];

  const applianceRows = appliances.map(a => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${a.name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${a.wattage}W</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${a.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${a.wattage * a.quantity}W</td>
    </tr>
  `).join('');

  const warningsHtml = warnings.length > 0 
    ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">⚠️ Warnings</h4>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px;">
          ${warnings.map(w => `<li style="margin-bottom: 4px;">${w}</li>`).join('')}
        </ul>
      </div>
    ` : '';

  const recommendationsHtml = recommendations.length > 0
    ? `
      <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;">💡 Recommendations</h4>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 13px;">
          ${recommendations.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
        </ul>
      </div>
    ` : '';

  return `
    <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 30px;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #ff7900;">
        <h2 style="color: #ff7900; margin: 0; font-size: 24px;">⚡ Inverter Load Report</h2>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Generated for ${contactName}</p>
        <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 12px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <!-- Power Summary -->
      <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 30px;">
        <div style="flex: 1; min-width: 140px; background: linear-gradient(135deg, #ff7900, #ff9500); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${totalLoad}W</div>
          <div style="font-size: 12px; opacity: 0.9;">Total Load</div>
        </div>
        <div style="flex: 1; min-width: 140px; background-color: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #1f2937;">${peakSurge}W</div>
          <div style="font-size: 12px; color: #6b7280;">Peak Surge</div>
        </div>
        <div style="flex: 1; min-width: 140px; background-color: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #1f2937;">${requiredKva}</div>
          <div style="font-size: 12px; color: #6b7280;">Required kVA</div>
        </div>
        <div style="flex: 1; min-width: 140px; background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${recommendedInverter}</div>
          <div style="font-size: 12px; opacity: 0.9;">Recommended kVA</div>
        </div>
      </div>

      <!-- Appliances Table -->
      ${appliances.length > 0 ? `
        <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px;">Selected Appliances</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151;">Appliance</th>
              <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151;">Wattage</th>
              <th style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #374151;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${applianceRows}
            <tr style="background-color: #f9fafb;">
              <td colspan="3" style="padding: 12px; font-weight: 600; color: #1f2937;">Total</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #ff7900; font-size: 16px;">${totalLoad}W</td>
            </tr>
          </tbody>
        </table>
      ` : '<p style="color: #6b7280;">No appliances selected</p>'}

      ${warningsHtml}
      ${recommendationsHtml}

      <!-- Disclaimer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
          This report is for estimation purposes only. Actual requirements may vary based on usage patterns, 
          environmental factors, and equipment specifications. Please consult a qualified electrician for final installation.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <strong style="color: #ff7900;">InverterSize.com</strong> - Your Inverter Planning Tool
        </p>
      </div>
    </div>
  `;
}

const handler = async (req: Request): Promise<Response> => {
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

    const pdfReport = data.inverterSizing 
      ? generatePDFReport(data.inverterSizing, data.name)
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff7900, #ff9500); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Form Submission</h1>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #ff7900; padding-bottom: 10px;">Contact Details</h2>
          
          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Name:</td>
              <td style="padding: 8px 0; font-weight: 600;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Email:</td>
              <td style="padding: 8px 0;">${data.email || '<span style="color: #9ca3af;">Not provided</span>'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
              <td style="padding: 8px 0;">${data.phone || '<span style="color: #9ca3af;">Not provided</span>'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Location:</td>
              <td style="padding: 8px 0;">${data.location || '<span style="color: #9ca3af;">Not provided</span>'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Contact Method:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${data.contactMethod === 'whatsapp' ? '#25D366' : '#3b82f6'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                  ${data.contactMethod === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
                </span>
              </td>
            </tr>
          </table>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">Message:</h3>
            <p style="margin: 0; color: #1f2937; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>

        ${pdfReport ? pdfReport : `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="color: #92400e; margin: 0;">⚠️ No inverter sizing data available for this submission.</p>
          </div>
        `}

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">This email was sent from the InverterSize contact form.</p>
          <p style="margin: 5px 0 0 0;">To print this report as PDF, use your browser or email client's print function.</p>
        </div>
      </body>
      </html>
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
        subject: `New Contact: ${data.name} - ${data.inverterSizing?.calculations?.recommendedInverter ?? 'N/A'} kVA Inquiry`,
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