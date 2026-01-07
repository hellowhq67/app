-- Create user_preferences table
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL UNIQUE,
  "email_notifications" boolean NOT NULL DEFAULT true,
  "practice_reminders" boolean NOT NULL DEFAULT true,
  "test_results" boolean NOT NULL DEFAULT true,
  "marketing_emails" boolean NOT NULL DEFAULT false,
  "theme" text NOT NULL DEFAULT 'dark',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create device_sessions table
CREATE TABLE IF NOT EXISTS "device_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "device" text NOT NULL,
  "location" text NOT NULL DEFAULT 'Unknown Location',
  "user_agent" text,
  "ip_address" text,
  "last_active_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "user_preferences_user_id_idx" ON "user_preferences"("user_id");
CREATE INDEX IF NOT EXISTS "device_sessions_user_id_idx" ON "device_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "device_sessions_last_active_at_idx" ON "device_sessions"("last_active_at");

-- Add foreign key constraint for user_preferences
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add foreign key constraint for device_sessions
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
