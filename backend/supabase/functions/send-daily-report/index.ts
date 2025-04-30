// supabase/functions/send-daily-report/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";
import { format } from "https://deno.land/std@0.177.0/datetime/mod.ts";

// Helper function to convert array of objects to CSV format
function arrayToCsv(data: Record<string, any>[], columns: string[]): string {
  const header = columns.join(',') + '\n'; // Use actual newline character
  const rows = data.map(row =>
    columns.map(col => {
      let value = row[col];
      // Handle null/undefined and escape commas/quotes if necessary
      value = value === null || value === undefined ? '' : String(value);
      if (typeof value === 'string' && (value.includes(',') || value.includes('\"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`; // Escape quotes by doubling them
      }
      return value;
    }).join(',')
  ).join('\n'); // Use actual newline character
  return header + rows;
}

serve(async (_req) => {
  try {
    // --- Get Environment Variables ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const emailApiKey = Deno.env.get("EMAIL_API_KEY"); // e.g., Resend API Key
    const emailApiEndpoint = Deno.env.get("EMAIL_API_ENDPOINT"); // e.g., https://api.resend.com/emails
    const recipientEmail = Deno.env.get("RECIPIENT_EMAIL"); // Email address to send the report to
    const recipientEmail2 = Deno.env.get("RECIPIENT_EMAIL_2"); // Optional second recipient

    if (!supabaseUrl || !serviceRoleKey || !emailApiKey || !emailApiEndpoint || !recipientEmail) {
      console.error("Missing required environment variables");
      return new Response("Internal Server Error: Missing configuration", { status: 500 });
    }

    // --- Initialize Supabase Client ---
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // --- Fetch Data ---
    // Adjust columns as needed for your 'sales_form' table
    const columnsToFetch = [
        'id', // Assuming you have an id column
        'created_at', // Assuming you have a timestamp
        'name',
        'phone',
        'email',
        'property_name',
        'location',
        'salesperson',
        'onboarding_note',
        'number_of_units',
        'price_per_unit'
    ];
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Format to ISO strings for Supabase (Postgres) filtering
    const startIso = startOfDay.toISOString();
    const endIso = endOfDay.toISOString();

    const { data, error: fetchError } = await supabase
      .from("sales_form")
      .select(columnsToFetch.join(','))
      .gte('created_at', startIso)
      .lte('created_at', endIso);

    if (fetchError) {
      console.error("Error fetching data:", fetchError);
      return new Response(JSON.stringify({ error: `Database error: ${fetchError.message}` }), { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log("No data found in sales_form table.");
      // Optionally send an email saying no data, or just exit successfully
      return new Response("No data to report", { status: 200 });
    }

    // --- Format Data as CSV ---
    const csvData = arrayToCsv(data, columnsToFetch);
    const today = format(new Date(), "yyyy-MM-dd");
    const fileName = `sales_report_${today}.csv`;

    // --- Send Email (Example using fetch with a generic API) ---
    // IMPORTANT: Replace this with your actual email provider's API call (e.g., Resend, SendGrid)
    const emailPayload = {
      from: 'support@guruotikoshadrack.works', // Replace with your verified sender
      to: [recipientEmail, recipientEmail2],
      subject: `Daily Sales Report - ${today}`,
      text: `Please find attached the daily sales report for ${today}.`,
      attachments: [
        {
          filename: fileName,
          content: btoa(unescape(encodeURIComponent(csvData))), // Base64 encode CSV data
        },
      ],
    };

    const emailResponse = await fetch(emailApiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`, // Common for many APIs like Resend
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      console.error(`Error sending email: ${emailResponse.status} ${emailResponse.statusText}`, errorBody);
      return new Response(JSON.stringify({ error: `Failed to send email: ${errorBody}` }), { status: 500 });
    }

    console.log("Email sent successfully");
    return new Response("Report generated and email sent successfully", { status: 200 });

  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});