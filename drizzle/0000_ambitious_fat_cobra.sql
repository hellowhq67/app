CREATE TYPE "public"."difficulty_level" AS ENUM('Easy', 'Medium', 'Hard');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'teacher', 'user', 'student');--> statement-breakpoint
CREATE TYPE "public"."listening_question_type" AS ENUM('summarize_spoken_text', 'multiple_choice_single', 'multiple_choice_multiple', 'fill_in_blanks', 'highlight_correct_summary', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation');--> statement-breakpoint
CREATE TYPE "public"."reading_question_type" AS ENUM('multiple_choice_single', 'multiple_choice_multiple', 'reorder_paragraphs', 'fill_in_blanks', 'reading_writing_fill_blanks');--> statement-breakpoint
CREATE TYPE "public"."speaking_type" AS ENUM('read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'summarize_group_discussion', 'respond_to_a_situation');--> statement-breakpoint
CREATE TYPE "public"."writing_question_type" AS ENUM('summarize_written_text', 'write_essay');--> statement-breakpoint
CREATE TYPE "public"."ai_usage_type" AS ENUM('transcription', 'scoring', 'feedback', 'realtime_voice', 'text_generation', 'other');--> statement-breakpoint
CREATE TYPE "public"."conversation_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."conversation_session_type" AS ENUM('speaking_practice', 'mock_interview', 'pronunciation_coach', 'fluency_training', 'customer_support');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('active', 'completed', 'abandoned', 'error');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"daily_ai_credits" integer DEFAULT 10 NOT NULL,
	"ai_credits_used" integer DEFAULT 0 NOT NULL,
	"last_credit_reset" timestamp DEFAULT now(),
	"daily_practice_limit" integer DEFAULT 3 NOT NULL,
	"practice_questions_used" integer DEFAULT 0 NOT NULL,
	"last_practice_reset" timestamp DEFAULT now(),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"score" integer,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_question_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"url" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_question_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"short_name" text,
	"scoring_type" text,
	"video_link" text,
	"timer_prep_ms" integer DEFAULT 0,
	"timer_record_ms" integer DEFAULT 0,
	"section" text,
	"parent_code" text,
	"first_question_id" integer,
	"question_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_question_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "pte_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid,
	"external_id" text,
	"source" text DEFAULT 'local',
	"question" text NOT NULL,
	"question_type" text NOT NULL,
	"section" text NOT NULL,
	"question_data" jsonb,
	"tags" jsonb,
	"correct_answer" text,
	"points" integer DEFAULT 1,
	"order_index" integer DEFAULT 0,
	"difficulty" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" text NOT NULL,
	"question_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"stats" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "pte_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"test_type" text NOT NULL,
	"section" text,
	"is_premium" text DEFAULT 'false',
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_user_exam_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exam_date" timestamp,
	"target_score" integer,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" text,
	"is_correct" boolean,
	"points_earned" integer DEFAULT 0,
	"ai_feedback" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"test_id" uuid NOT NULL,
	"status" text DEFAULT 'in_progress',
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"total_score" text,
	"speaking_score" text,
	"writing_score" text,
	"reading_score" text,
	"listening_score" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_test_categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"code" text NOT NULL,
	"scoring_type" text,
	"short_name" text,
	"first_question_id" integer,
	"color" text,
	"parent" integer,
	"practice_count" integer DEFAULT 0,
	"question_count" integer DEFAULT 0,
	"video_link" text
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_type" text NOT NULL,
	"status" text DEFAULT 'active',
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"auto_renew" boolean DEFAULT true,
	"payment_method" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_credit_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"usage_type" "ai_usage_type" NOT NULL,
	"provider" text NOT NULL,
	"model" text,
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"audio_seconds" numeric(10, 2),
	"cost" numeric(10, 6),
	"session_id" uuid,
	"attempt_id" uuid,
	"attempt_type" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"type" "speaking_type" NOT NULL,
	"audio_url" text NOT NULL,
	"transcript" text,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"overall_score" integer,
	"pronunciation_score" integer,
	"fluency_score" integer,
	"content_score" integer,
	"duration_ms" integer NOT NULL,
	"words_per_minute" numeric(6, 2),
	"filler_rate" numeric(6, 3),
	"timings" jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "speaking_type" NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text,
	"prompt_media_url" text,
	"reference_audio_url_us" text,
	"reference_audio_url_uk" text,
	"appearance_count" integer DEFAULT 0,
	"external_id" text,
	"metadata" jsonb,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"bookmarked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "speaking_type" NOT NULL,
	"title" text NOT NULL,
	"template_text" text NOT NULL,
	"audio_url" text,
	"score_range" text NOT NULL,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_response" jsonb NOT NULL,
	"scores" jsonb,
	"accuracy" numeric(5, 2),
	"correct_answers" integer,
	"total_answers" integer,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text NOT NULL,
	"options" jsonb,
	"answer_key" jsonb,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"bookmarked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writing_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_response" text NOT NULL,
	"scores" jsonb,
	"overall_score" integer,
	"grammar_score" integer,
	"vocabulary_score" integer,
	"coherence_score" integer,
	"content_score" integer,
	"word_count" integer,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writing_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text NOT NULL,
	"options" jsonb,
	"answer_key" jsonb,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"bookmarked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"user_response" jsonb NOT NULL,
	"scores" jsonb,
	"accuracy" numeric(5, 2),
	"correct_answers" integer,
	"total_answers" integer,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "listening_question_type" NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text,
	"prompt_media_url" text,
	"correct_answers" jsonb NOT NULL,
	"options" jsonb,
	"transcript" text,
	"difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"bookmarked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"target_score" integer,
	"exam_date" timestamp,
	"study_goal" text,
	"phone_number" text,
	"country" text,
	"timezone" text,
	"speaking_practice_count" integer DEFAULT 0,
	"reading_practice_count" integer DEFAULT 0,
	"writing_practice_count" integer DEFAULT 0,
	"listening_practice_count" integer DEFAULT 0,
	"mock_test_count" integer DEFAULT 0,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
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
CREATE TABLE "pte_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"skill_type" text NOT NULL,
	"source_attempt_id" uuid NOT NULL,
	"source_table" text NOT NULL,
	"question_id" uuid NOT NULL,
	"question_type" text NOT NULL,
	"section" text NOT NULL,
	"user_response" jsonb NOT NULL,
	"scores" jsonb NOT NULL,
	"overall_score" integer,
	"accuracy" integer,
	"word_count" integer,
	"duration_ms" integer,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_question_media" ADD CONSTRAINT "pte_question_media_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD CONSTRAINT "pte_questions_test_id_pte_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."pte_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_user_exam_settings" ADD CONSTRAINT "pte_user_exam_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_pte_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."pte_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD CONSTRAINT "ai_credit_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD CONSTRAINT "speaking_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD CONSTRAINT "speaking_attempts_question_id_speaking_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."speaking_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_question_id_reading_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."reading_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD CONSTRAINT "writing_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD CONSTRAINT "writing_attempts_question_id_writing_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."writing_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_question_id_listening_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."listening_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "pte_attempts" ADD CONSTRAINT "pte_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_id" ON "ai_credit_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_type" ON "ai_credit_usage" USING btree ("usage_type");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_provider" ON "ai_credit_usage" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_created_at" ON "ai_credit_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_session_id" ON "ai_credit_usage" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_attempt_id" ON "ai_credit_usage" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_created" ON "ai_credit_usage" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_ai_usage_provider_created" ON "ai_credit_usage" USING btree ("provider","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_question" ON "speaking_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_user_type" ON "speaking_attempts" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_public" ON "speaking_attempts" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_user_created" ON "speaking_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_public_scores" ON "speaking_attempts" USING btree ("is_public","question_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_overall_score" ON "speaking_attempts" USING btree ("overall_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_user_scores" ON "speaking_attempts" USING btree ("user_id","overall_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_type" ON "speaking_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_is_active" ON "speaking_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_tags_gin" ON "speaking_questions" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_external_id" ON "speaking_questions" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_active_type" ON "speaking_questions" USING btree ("type","difficulty") WHERE "speaking_questions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_speaking_templates_type" ON "speaking_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_speaking_templates_recommended" ON "speaking_templates" USING btree ("is_recommended");--> statement-breakpoint
CREATE INDEX "reading_attempts_user_id_idx" ON "reading_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reading_attempts_question_id_idx" ON "reading_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "reading_attempts_created_at_idx" ON "reading_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_reading_attempts_user_created" ON "reading_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_attempts_accuracy" ON "reading_attempts" USING btree ("accuracy" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_questions_type" ON "reading_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_reading_questions_is_active" ON "reading_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_reading_questions_active_type" ON "reading_questions" USING btree ("type","difficulty") WHERE "reading_questions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "writing_attempts_user_id_idx" ON "writing_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "writing_attempts_question_id_idx" ON "writing_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "writing_attempts_created_at_idx" ON "writing_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_writing_attempts_user_created" ON "writing_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_writing_attempts_overall_score" ON "writing_attempts" USING btree ("overall_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_writing_questions_type" ON "writing_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_writing_questions_is_active" ON "writing_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_writing_questions_active_type" ON "writing_questions" USING btree ("type","difficulty") WHERE "writing_questions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "listening_attempts_user_id_idx" ON "listening_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listening_attempts_question_id_idx" ON "listening_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "listening_attempts_created_at_idx" ON "listening_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_listening_attempts_user_created" ON "listening_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_listening_attempts_accuracy" ON "listening_attempts" USING btree ("accuracy" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "listening_questions_type_idx" ON "listening_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "listening_questions_difficulty_idx" ON "listening_questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "listening_questions_created_at_idx" ON "listening_questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_listening_questions_is_active" ON "listening_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_listening_questions_active_type" ON "listening_questions" USING btree ("type","difficulty") WHERE "listening_questions"."is_active" = true;--> statement-breakpoint
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
CREATE INDEX "idx_pte_attempts_user_created" ON "pte_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_skill_type" ON "pte_attempts" USING btree ("skill_type");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_question" ON "pte_attempts" USING btree ("question_id");