// File: functions/submit_sales_form/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

serve(async req => {
  const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

   // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    // Add corsHeaders here
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const body = await req.json();
  const { name, phone, propertyName, location, salesperson, onboardingNote} = body;

  if (!name || !phone || !propertyName || !location || !salesperson) {
    // Add corsHeaders here (optional but good practice)
    return new Response("Missing required fields", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    // Use the standard Supabase URL env variable
    Deno.env.get("SUPABASE_URL")!,
    // Use the standard Supabase Service Role Key env variable
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase.from("sales_form").insert([
    {
      name,
      phone,
      property_name: propertyName,
      location,
      salesperson,
      onboarding_note: onboardingNote,
      // number_of_units: parseInt(units),
      // price_per_unit: parseFloat(price),
    },
  ]);

  if (error) {
    // Add corsHeaders here
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  // Add corsHeaders here
  return new Response("Success", { status: 200, headers: corsHeaders });
});
