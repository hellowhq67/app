CREATE TYPE "public"."question_type" AS ENUM('read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'summarize_written_text', 'write_essay', 'multiple_choice_single', 'multiple_choice_multiple', 'reorder_paragraphs', 'fill_in_blanks', 'reading_writing_fill_blanks', 'summarize_spoken_text', 'select_missing_word', 'highlight_correct_summary', 'highlight_incorrect_words', 'write_from_dictation');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'pro', 'premium');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" RENAME TO "user_role";--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'mock',
	"is_premium" boolean DEFAULT false,
	"structure" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "activity_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversation_attempt_links" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversation_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversation_turns" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_question_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_listening_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_reading_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_speaking_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_writing_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_mock_tests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "credit_purchases" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment_methods" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "posts" CASCADE;--> statement-breakpoint
DROP TABLE "activity_logs" CASCADE;--> statement-breakpoint
DROP TABLE "conversation_attempt_links" CASCADE;--> statement-breakpoint
DROP TABLE "conversation_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "conversation_turns" CASCADE;--> statement-breakpoint
DROP TABLE "pte_categories" CASCADE;--> statement-breakpoint
DROP TABLE "pte_question_types" CASCADE;--> statement-breakpoint
DROP TABLE "pte_listening_questions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_questions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_reading_questions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_speaking_questions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_writing_questions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "pte_mock_test_questions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_mock_tests" CASCADE;--> statement-breakpoint
DROP TABLE "credit_purchases" CASCADE;--> statement-breakpoint
DROP TABLE "invoices" CASCADE;--> statement-breakpoint
DROP TABLE "payment_methods" CASCADE;--> statement-breakpoint
DROP TABLE "subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE "transactions" CASCADE;--> statement-breakpoint
ALTER TABLE "user_progress" RENAME TO "attempts";--> statement-breakpoint
ALTER TABLE "user_scheduled_exam_dates" RENAME TO "questions";--> statement-breakpoint
ALTER TABLE "comments" RENAME TO "test_answers";--> statement-breakpoint
ALTER TABLE "forums" RENAME TO "test_attempts";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "subscription_tier" TO "plan";--> statement-breakpoint
ALTER TABLE "attempts" RENAME COLUMN "overall_score" TO "is_correct";--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "user_id" TO "content_data";--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "exam_date" TO "transcript";--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "exam_name" TO "correct_answer";--> statement-breakpoint
ALTER TABLE "questions" RENAME COLUMN "is_primary" TO "difficulty";--> statement-breakpoint
ALTER TABLE "attempts" DROP CONSTRAINT "user_progress_user_id_unique";--> statement-breakpoint
ALTER TABLE "attempts" DROP CONSTRAINT "user_progress_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "user_scheduled_exam_dates_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "test_answers" DROP CONSTRAINT "comments_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "test_answers" DROP CONSTRAINT "comments_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'teacher', 'user', 'student');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
DROP INDEX "idx_user_scheduled_exam_dates_user_id";--> statement-breakpoint
DROP INDEX "idx_user_scheduled_exam_dates_exam_date";--> statement-breakpoint
DROP INDEX "idx_ai_usage_user_id";--> statement-breakpoint
DROP INDEX "idx_ai_usage_type";--> statement-breakpoint
DROP INDEX "idx_ai_usage_provider";--> statement-breakpoint
DROP INDEX "idx_ai_usage_created_at";--> statement-breakpoint
DROP INDEX "idx_ai_usage_session_id";--> statement-breakpoint
DROP INDEX "idx_ai_usage_attempt_id";--> statement-breakpoint
DROP INDEX "idx_ai_usage_pte_attempt_id";--> statement-breakpoint
DROP INDEX "idx_ai_usage_user_created";--> statement-breakpoint
DROP INDEX "idx_ai_usage_provider_created";--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "question_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "response" jsonb;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "ai_feedback" jsonb;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "type" "question_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "test_answers" ADD COLUMN "test_attempt_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "test_answers" ADD COLUMN "question_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "test_answers" ADD COLUMN "answer" jsonb;--> statement-breakpoint
ALTER TABLE "test_answers" ADD COLUMN "score" integer;--> statement-breakpoint
ALTER TABLE "test_answers" ADD COLUMN "feedback" jsonb;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "test_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "status" text DEFAULT 'in_progress';--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "started_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "scores" jsonb;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "amount" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_test_attempt_id_test_attempts_id_fk" FOREIGN KEY ("test_attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_attempts_user" ON "attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_question" ON "attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_questions_type" ON "questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_questions_difficulty" ON "questions" USING btree ("difficulty");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "subscription_expires_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "exam_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "monthly_practice_limit";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "practice_questions_this_month";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_monthly_reset";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "daily_practice_limit";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "practice_questions_used";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_practice_reset";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "speaking_practice_count";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "reading_practice_count";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "writing_practice_count";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "listening_practice_count";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "mock_test_count";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "speaking_score";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "writing_score";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "reading_score";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "listening_score";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "tests_completed";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "questions_answered";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "study_streak";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "total_study_time";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "last_active_at";--> statement-breakpoint
ALTER TABLE "attempts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "test_answers" DROP COLUMN "post_id";--> statement-breakpoint
ALTER TABLE "test_answers" DROP COLUMN "author_id";--> statement-breakpoint
ALTER TABLE "test_answers" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "test_answers" DROP COLUMN "like_count";--> statement-breakpoint
ALTER TABLE "test_answers" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "test_attempts" DROP COLUMN "order_index";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "model";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "input_tokens";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "output_tokens";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "total_tokens";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "audio_seconds";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "cost";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "session_id";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "attempt_id";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "attempt_type";--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "pte_attempt_id";--> statement-breakpoint
DROP TYPE "public"."subscription_tier";--> statement-breakpoint
DROP TYPE "public"."conversation_session_type";--> statement-breakpoint
DROP TYPE "public"."conversation_status";--> statement-breakpoint
DROP TYPE "public"."pte_category";--> statement-breakpoint
DROP TYPE "public"."pte_question_type_code";--> statement-breakpoint
DROP TYPE "public"."pte_attempt_status";--> statement-breakpoint
DROP TYPE "public"."pte_mock_test_status";--> statement-breakpoint
DROP TYPE "public"."billing_subscription_status";--> statement-breakpoint
DROP TYPE "public"."invoice_status";--> statement-breakpoint
DROP TYPE "public"."transaction_status";--> statement-breakpoint
DROP TYPE "public"."transaction_type";