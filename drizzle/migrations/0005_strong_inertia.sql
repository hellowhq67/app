CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled', 'trial');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('active', 'completed', 'abandoned', 'error');--> statement-breakpoint
CREATE TYPE "public"."pte_category" AS ENUM('speaking', 'writing', 'reading', 'listening');--> statement-breakpoint
CREATE TYPE "public"."pte_question_type_code" AS ENUM('read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'respond_to_situation', 'summarize_group_discussion', 'summarize_written_text', 'essay', 'reading_fill_blanks_dropdown', 'reading_mc_multiple', 'reorder_paragraphs', 'reading_fill_blanks_drag', 'reading_mc_single', 'summarize_spoken_text', 'listening_mc_multiple', 'listening_fill_blanks', 'highlight_correct_summary', 'listening_mc_single', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation');--> statement-breakpoint
CREATE TYPE "public"."pte_attempt_status" AS ENUM('in_progress', 'completed', 'abandoned', 'under_review');--> statement-breakpoint
CREATE TYPE "public"."pte_mock_test_status" AS ENUM('not_started', 'in_progress', 'completed', 'expired');--> statement-breakpoint
ALTER TYPE "public"."question_type" RENAME TO "subscription_tier";--> statement-breakpoint
ALTER TYPE "public"."subscription_plan" RENAME TO "conversation_session_type";--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"overall_score" integer DEFAULT 0,
	"speaking_score" integer DEFAULT 0,
	"writing_score" integer DEFAULT 0,
	"reading_score" integer DEFAULT 0,
	"listening_score" integer DEFAULT 0,
	"tests_completed" integer DEFAULT 0,
	"questions_answered" integer DEFAULT 0,
	"study_streak" integer DEFAULT 0,
	"total_study_time" integer DEFAULT 0,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_scheduled_exam_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exam_date" timestamp NOT NULL,
	"exam_name" text DEFAULT 'PTE Academic' NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"forum_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_attempt_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"attempt_id" uuid NOT NULL,
	"attempt_type" text NOT NULL,
	"link_type" text DEFAULT 'generated_from',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_type" "conversation_session_type" DEFAULT 'speaking_practice' NOT NULL,
	"status" "conversation_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"total_turns" integer DEFAULT 0 NOT NULL,
	"total_duration_ms" integer DEFAULT 0,
	"ai_provider" text DEFAULT 'openai',
	"model_used" text DEFAULT 'gpt-4o-realtime-preview',
	"token_usage" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"turn_index" integer NOT NULL,
	"role" "conversation_role" NOT NULL,
	"audio_url" text,
	"transcript" text,
	"scores" jsonb,
	"duration_ms" integer,
	"silence_duration_ms" integer,
	"words_per_minute" numeric(6, 2),
	"pause_count" integer,
	"filler_word_count" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "pte_category" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "pte_question_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "pte_question_type_code" NOT NULL,
	"name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"description" text,
	"has_ai_scoring" boolean DEFAULT false NOT NULL,
	"max_score" integer NOT NULL,
	"scoring_criteria" jsonb,
	"time_limit" integer,
	"preparation_time" integer,
	"word_count_min" integer,
	"word_count_max" integer,
	"display_order" integer NOT NULL,
	"instructions" text,
	"sample_question_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_question_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "pte_listening_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"audio_file_url" text NOT NULL,
	"audio_duration" integer,
	"transcript" text,
	"question_text" text,
	"options" jsonb,
	"correct_answer_positions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_listening_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_type_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"audio_url" text,
	"image_url" text,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"tags" jsonb,
	"correct_answer" jsonb,
	"sample_answer" text,
	"scoring_rubric" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"average_score" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_reading_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"passage_text" text NOT NULL,
	"question_text" text,
	"options" jsonb,
	"correct_answer_positions" jsonb,
	"explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_reading_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_speaking_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"audio_prompt_url" text,
	"expected_duration" integer,
	"sample_transcript" text,
	"key_points" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_speaking_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_writing_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"prompt_text" text NOT NULL,
	"passage_text" text,
	"word_count_min" integer NOT NULL,
	"word_count_max" integer NOT NULL,
	"essay_type" text,
	"key_themes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_writing_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"status" "pte_attempt_status" DEFAULT 'in_progress' NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"response_text" text,
	"response_audio_url" text,
	"response_data" jsonb,
	"time_taken" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"ai_score" integer,
	"ai_scores" jsonb,
	"ai_feedback" text,
	"ai_scored_at" timestamp,
	"manual_score" integer,
	"manual_feedback" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"final_score" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_mock_test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mock_test_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"attempt_id" uuid,
	"question_order" integer NOT NULL,
	"section_name" text,
	"score" integer,
	"max_score" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_mock_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"test_name" text NOT NULL,
	"status" "pte_mock_test_status" DEFAULT 'not_started' NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"total_duration" integer,
	"overall_score" integer,
	"speaking_score" integer,
	"writing_score" integer,
	"reading_score" integer,
	"listening_score" integer,
	"scores" jsonb,
	"total_questions" integer NOT NULL,
	"completed_questions" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_audio_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"question_id" text NOT NULL,
	"user_id" text NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"question_type" text NOT NULL,
	"answer" jsonb,
	"time_spent" integer,
	"ai_score" integer,
	"ai_feedback" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"overall_score" integer,
	"speaking_score" integer,
	"writing_score" integer,
	"reading_score" integer,
	"listening_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"current_section" text DEFAULT 'speaking_writing',
	"current_question" integer DEFAULT 0,
	"responses" jsonb,
	"time_remaining" jsonb,
	"is_completed" boolean DEFAULT false,
	"system_check" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "test_answers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "test_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "attempts" CASCADE;--> statement-breakpoint
DROP TABLE "questions" CASCADE;--> statement-breakpoint
DROP TABLE "test_answers" CASCADE;--> statement-breakpoint
DROP TABLE "test_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "tests" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_tier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_tier" SET DEFAULT 'free'::text;--> statement-breakpoint
DROP TYPE "public"."subscription_tier";--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'basic', 'premium', 'unlimited');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_tier" SET DEFAULT 'free'::"public"."subscription_tier";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_tier" SET DATA TYPE "public"."subscription_tier" USING "subscription_tier"::"public"."subscription_tier";--> statement-breakpoint
ALTER TABLE "conversation_sessions" ALTER COLUMN "session_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "conversation_sessions" ALTER COLUMN "session_type" SET DEFAULT 'speaking_practice'::text;--> statement-breakpoint
DROP TYPE "public"."conversation_session_type";--> statement-breakpoint
CREATE TYPE "public"."conversation_session_type" AS ENUM('speaking_practice', 'mock_interview', 'pronunciation_coach', 'fluency_training', 'customer_support');--> statement-breakpoint
ALTER TABLE "conversation_sessions" ALTER COLUMN "session_type" SET DEFAULT 'speaking_practice'::"public"."conversation_session_type";--> statement-breakpoint
ALTER TABLE "conversation_sessions" ALTER COLUMN "session_type" SET DATA TYPE "public"."conversation_session_type" USING "session_type"::"public"."conversation_session_type";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "input_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "output_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "total_tokens" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "audio_seconds" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "cost" numeric(10, 6);--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "attempt_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "attempt_type" text;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "pte_attempt_id" uuid;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "speaking_practice_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "reading_practice_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "writing_practice_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "listening_practice_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "mock_test_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "exam_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "monthly_practice_limit" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "practice_questions_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_monthly_reset" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "daily_practice_limit" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "practice_questions_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_practice_reset" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scheduled_exam_dates" ADD CONSTRAINT "user_scheduled_exam_dates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_forum_id_forums_id_fk" FOREIGN KEY ("forum_id") REFERENCES "public"."forums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_attempt_links" ADD CONSTRAINT "conversation_attempt_links_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_turns" ADD CONSTRAINT "conversation_turns_session_id_conversation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."conversation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD CONSTRAINT "pte_question_types_category_id_pte_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."pte_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_listening_questions" ADD CONSTRAINT "pte_listening_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD CONSTRAINT "pte_questions_question_type_id_pte_question_types_id_fk" FOREIGN KEY ("question_type_id") REFERENCES "public"."pte_question_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_reading_questions" ADD CONSTRAINT "pte_reading_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_speaking_questions" ADD CONSTRAINT "pte_speaking_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_writing_questions" ADD CONSTRAINT "pte_writing_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD CONSTRAINT "pte_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD CONSTRAINT "pte_attempts_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" ADD CONSTRAINT "pte_mock_test_questions_mock_test_id_pte_mock_tests_id_fk" FOREIGN KEY ("mock_test_id") REFERENCES "public"."pte_mock_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" ADD CONSTRAINT "pte_mock_test_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" ADD CONSTRAINT "pte_mock_test_questions_attempt_id_pte_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."pte_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_tests" ADD CONSTRAINT "pte_mock_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_audio_files" ADD CONSTRAINT "pte_audio_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_responses" ADD CONSTRAINT "pte_responses_session_id_pte_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pte_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_scores" ADD CONSTRAINT "pte_scores_session_id_pte_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pte_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_sessions" ADD CONSTRAINT "pte_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_scheduled_exam_dates_user_id" ON "user_scheduled_exam_dates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_scheduled_exam_dates_exam_date" ON "user_scheduled_exam_dates" USING btree ("exam_date");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_user_created" ON "activity_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_logs_action" ON "activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_conversation_links_session_id" ON "conversation_attempt_links" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_links_attempt_id" ON "conversation_attempt_links" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_links_attempt_type" ON "conversation_attempt_links" USING btree ("attempt_type");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_user_id" ON "conversation_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_status" ON "conversation_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_type" ON "conversation_sessions" USING btree ("session_type");--> statement-breakpoint
CREATE INDEX "idx_conversation_sessions_created_at" ON "conversation_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_session_id" ON "conversation_turns" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_turn_index" ON "conversation_turns" USING btree ("turn_index");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_role" ON "conversation_turns" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_conversation_turns_created_at" ON "conversation_turns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_pte_question_types_category_id" ON "pte_question_types" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_pte_question_types_code" ON "pte_question_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_pte_question_types_is_active" ON "pte_question_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_question_type_id" ON "pte_questions" USING btree ("question_type_id");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_difficulty" ON "pte_questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_is_active" ON "pte_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_is_premium" ON "pte_questions" USING btree ("is_premium");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_user_id" ON "pte_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_question_id" ON "pte_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_status" ON "pte_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_created_at" ON "pte_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_user_question" ON "pte_attempts" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_test_questions_mock_test_id" ON "pte_mock_test_questions" USING btree ("mock_test_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_test_questions_question_id" ON "pte_mock_test_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_test_questions_attempt_id" ON "pte_mock_test_questions" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_user_id" ON "pte_mock_tests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_status" ON "pte_mock_tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_scheduled_at" ON "pte_mock_tests" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_created_at" ON "pte_mock_tests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_id" ON "ai_credit_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_type" ON "ai_credit_usage" USING btree ("usage_type");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_provider" ON "ai_credit_usage" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_created_at" ON "ai_credit_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_session_id" ON "ai_credit_usage" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_attempt_id" ON "ai_credit_usage" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_pte_attempt_id" ON "ai_credit_usage" USING btree ("pte_attempt_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_created" ON "ai_credit_usage" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_ai_usage_provider_created" ON "ai_credit_usage" USING btree ("provider","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "ai_credit_usage" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "plan";--> statement-breakpoint
DROP TYPE "public"."user_role";