-- A person who showed real buying intent, and where they are in the pipeline.
-- Distinct from Message (an inbox item read once); a Lead is worked over time.
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "source" TEXT NOT NULL DEFAULT 'chat',
    "stage" TEXT NOT NULL DEFAULT 'new',
    "score" INTEGER NOT NULL DEFAULT 0,
    "interest" TEXT,
    "breedSlug" TEXT,
    "dogSlug" TEXT,
    "budgetUsd" INTEGER,
    "location" TEXT,
    "notes" TEXT,
    "orderRef" TEXT,
    "touches" INTEGER NOT NULL DEFAULT 0,
    "lastTouchAt" TIMESTAMP(3),
    "nextTouchAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "optOutToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lead_optOutToken_key" ON "Lead"("optOutToken");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");
CREATE INDEX "Lead_nextTouchAt_idx" ON "Lead"("nextTouchAt");
