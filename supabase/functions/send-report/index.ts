
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  messageId: string;
  messageContent: string;
  senderId: string;
  senderName: string;
  reason: string;
  additionalInfo: string;
  reportedBy: string;
  reporterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Report function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const reportData: ReportRequest = await req.json();
    console.log("Report data received:", reportData);

    const emailHtml = `
      <h2>Message Report</h2>
      <p><strong>Report Details:</strong></p>
      <ul>
        <li><strong>Message ID:</strong> ${reportData.messageId}</li>
        <li><strong>Reported Message:</strong> "${reportData.messageContent}"</li>
        <li><strong>Sender:</strong> ${reportData.senderName} (ID: ${reportData.senderId})</li>
        <li><strong>Reason:</strong> ${reportData.reason}</li>
        <li><strong>Additional Information:</strong> ${reportData.additionalInfo || 'None provided'}</li>
        <li><strong>Reported By:</strong> ${reportData.reporterName} (ID: ${reportData.reportedBy})</li>
        <li><strong>Report Time:</strong> ${new Date().toISOString()}</li>
      </ul>
      <p>Please review this report and take appropriate action.</p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Reports <onboarding@resend.dev>",
      to: ["socialnetwork1120@gmail.com"],
      subject: `Message Report: ${reportData.reason}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-report function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
