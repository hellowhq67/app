CREATE TYPE "public"."pte_sectional_test_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
ALTER TYPE "public"."pte_question_type_code" ADD VALUE 'email' BEFORE 'reading_fill_blanks_dropdown';--> statement-breakpoint
CREATE TABLE "pte_benchmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"question_type" text NOT NULL,
	"response_text" text NOT NULL,
	"overall_score" integer NOT NULL,
	"fluency_score" integer,
	"pronunciation_score" integer,
	"content_score" integer,
	"vocabulary_score" integer,
	"grammar_score" integer,
	"features" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"questions" jsonb NOT NULL,
	"price" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"question_type" text NOT NULL,
	"answer" jsonb NOT NULL,
	"ai_score" jsonb,
	"time_spent_ms" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mock_test_id" uuid NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"current_question_index" integer DEFAULT 0,
	"answers_state" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"total_score" integer,
	"communicative_skills" jsonb
);
--> statement-breakpoint
CREATE TABLE "pte_sectional_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sectional_test_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"attempt_id" uuid,
	"sequence" integer NOT NULL,
	"time_spent" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_sectional_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"section" "pte_category" NOT NULL,
	"status" "pte_sectional_test_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"total_score" integer,
	"time_spent" integer,
	"questions_attempted" integer DEFAULT 0 NOT NULL,
	"questions_correct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pte_mock_tests" ADD COLUMN "current_section" text;--> statement-breakpoint
ALTER TABLE "pte_mock_tests" ADD COLUMN "section_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "pte_mock_tests" ADD COLUMN "section_time_left" integer;--> statement-breakpoint
ALTER TABLE "credit_purchases" ADD COLUMN "sslcommerz_tran_id" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "sslcommerz_tran_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "sslcommerz_tran_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "sslcommerz_session_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "sslcommerz_tran_id" text;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_mock_test_id_mock_tests_id_fk" FOREIGN KEY ("mock_test_id") REFERENCES "public"."mock_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_sectional_attempts" ADD CONSTRAINT "pte_sectional_attempts_sectional_test_id_pte_sectional_tests_id_fk" FOREIGN KEY ("sectional_test_id") REFERENCES "public"."pte_sectional_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_sectional_attempts" ADD CONSTRAINT "pte_sectional_attempts_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_sectional_attempts" ADD CONSTRAINT "pte_sectional_attempts_attempt_id_pte_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."pte_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_sectional_tests" ADD CONSTRAINT "pte_sectional_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pte_sectional_attempts_test_id" ON "pte_sectional_attempts" USING btree ("sectional_test_id");--> statement-breakpoint
CREATE INDEX "idx_pte_sectional_attempts_question_id" ON "pte_sectional_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_pte_sectional_tests_user_id" ON "pte_sectional_tests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pte_sectional_tests_section" ON "pte_sectional_tests" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_pte_sectional_tests_status" ON "pte_sectional_tests" USING btree ("status");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_sslcommerz_tran_id_unique" UNIQUE("sslcommerz_tran_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_sslcommerz_tran_id_unique" UNIQUE("sslcommerz_tran_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_sslcommerz_session_id_unique" UNIQUE("sslcommerz_session_id");