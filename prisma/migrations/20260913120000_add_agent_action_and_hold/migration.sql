-- Everything an AI agent did on the kennel's behalf. Agent writes must be
-- distinguishable from a visitor filling in a form, and answerable later.
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL,
    "agent" TEXT NOT NULL DEFAULT 'duke',
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'done',
    "sessionId" TEXT,
    "orderRef" TEXT,
    "dogSlug" TEXT,
    "contact" TEXT,
    "summary" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgentAction_createdAt_idx" ON "AgentAction"("createdAt");
CREATE INDEX "AgentAction_orderRef_idx" ON "AgentAction"("orderRef");
CREATE INDEX "AgentAction_status_idx" ON "AgentAction"("status");

-- A puppy held off the market while a buyer completes payment. Distinct from
-- stock: stock only moves when money confirms, a hold is soft and expires.
CREATE TABLE "Hold" (
    "id" TEXT NOT NULL,
    "dogSlug" TEXT NOT NULL,
    "orderRef" TEXT,
    "source" TEXT NOT NULL DEFAULT 'agent',
    "contact" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hold_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Hold_dogSlug_idx" ON "Hold"("dogSlug");
CREATE INDEX "Hold_expiresAt_idx" ON "Hold"("expiresAt");
