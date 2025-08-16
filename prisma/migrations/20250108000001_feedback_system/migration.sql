-- CreateTable for Customer Feedback
CREATE TABLE "customer_feedback" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "user_email" TEXT,
    "user_id" TEXT,
    "tenant_id" TEXT,
    "metadata" JSONB,
    "reproduction_steps" TEXT,
    "expected_behavior" TEXT,
    "actual_behavior" TEXT,
    "browser_info" TEXT,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Survey Responses
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "survey_title" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "time_spent" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Interview Requests
CREATE TABLE "interview_requests" (
    "id" TEXT NOT NULL,
    "interview_type" TEXT NOT NULL,
    "preferred_dates" JSONB NOT NULL,
    "preferred_times" JSONB NOT NULL,
    "timezone" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "company" TEXT,
    "role" TEXT,
    "experience" TEXT,
    "specific_topics" TEXT,
    "availability_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3),
    "meeting_link" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Feature Requests (public board)
CREATE TABLE "feature_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "user_email" TEXT,
    "user_id" TEXT,
    "estimated_effort" TEXT,
    "target_release" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Feature Votes
CREATE TABLE "feature_votes" (
    "id" TEXT NOT NULL,
    "feature_request_id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Survey Templates
CREATE TABLE "survey_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "settings" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for performance
CREATE INDEX "customer_feedback_type_idx" ON "customer_feedback"("type");
CREATE INDEX "customer_feedback_status_idx" ON "customer_feedback"("status");
CREATE INDEX "customer_feedback_created_at_idx" ON "customer_feedback"("created_at");
CREATE INDEX "customer_feedback_user_email_idx" ON "customer_feedback"("user_email");

CREATE INDEX "survey_responses_survey_id_idx" ON "survey_responses"("survey_id");
CREATE INDEX "survey_responses_user_id_idx" ON "survey_responses"("user_id");
CREATE INDEX "survey_responses_created_at_idx" ON "survey_responses"("created_at");

CREATE INDEX "interview_requests_status_idx" ON "interview_requests"("status");
CREATE INDEX "interview_requests_contact_email_idx" ON "interview_requests"("contact_email");
CREATE INDEX "interview_requests_created_at_idx" ON "interview_requests"("created_at");

CREATE INDEX "feature_requests_status_idx" ON "feature_requests"("status");
CREATE INDEX "feature_requests_votes_idx" ON "feature_requests"("votes" DESC);
CREATE INDEX "feature_requests_created_at_idx" ON "feature_requests"("created_at");

CREATE UNIQUE INDEX "feature_votes_unique_vote" ON "feature_votes"("feature_request_id", "user_email");

CREATE INDEX "survey_templates_category_idx" ON "survey_templates"("category");
CREATE INDEX "survey_templates_usage_count_idx" ON "survey_templates"("usage_count" DESC);

-- Add default values for id fields
ALTER TABLE "customer_feedback" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "customer_feedback" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "survey_responses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "interview_requests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "interview_requests" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "feature_requests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "feature_requests" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "feature_votes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "survey_templates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "survey_templates" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;