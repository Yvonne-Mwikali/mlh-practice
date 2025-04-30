-- supabase/migrations/<timestamp>_schedule_daily_report.sql

-- Ensure pg_net is enabled (might already be done via UI)
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage permission for pg_net to the postgres role
GRANT USAGE ON SCHEMA net TO postgres;

-- Allow the postgres role to make outbound connections (adjust '*' if needed for security)
-- This allows connections to any host. Restrict if possible.
-- SELECT net.http_set_curlopt('CURLOPT_SSL_VERIFYPEER', '0'); -- Commented out as it causes errors and might not be needed
-- ALTER ROLE postgres SET http.allowed_hosts = '*'; -- Commented out due to permission errors


-- Schedule the function to run daily at 6 PM UTC (adjust timezone as needed)
-- Cron format: 'minute hour day month day-of-week'
-- '0 18 * * *' means 0 minutes past the 18nth hour (6 PM) every day.
-- IMPORTANT: pg_cron uses UTC time by default. Adjust '0 18 * * *' if your 6 PM is in a different timezone.
-- Example: For 9 PM EST (which is 1 AM UTC during standard time, 2 AM UTC during daylight saving), you might use '0 1 * * *' or '0 2 * * *'. Check current UTC offset.

SELECT cron.schedule(
    'daily-sales-report', -- Name of the cron job
    '0 18 * * *', -- Cron schedule (6 PM UTC) - ADJUST TIMEZONE IF NEEDED
    $$
    SELECT net.http_post(
        url:='https://ohsdrukqwxwbovvkvnfr.supabase.co/send-daily-report', -- Replace with your actual function URL
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc2RydWtxd3h3Ym92dmt2bmZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxODM3NiwiZXhwIjoyMDYxMDk0Mzc2fQ.sxQLLRGa8CbLBSDWBhEpHYfKMieh_mCzKcXMGfuTcpo"}'::jsonb,
        body:='{}'::jsonb -- Body can be empty unless your function expects something
    );
    $$
);

-- To unschedule (if needed later):
-- SELECT cron.unschedule('daily-sales-report');