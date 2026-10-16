-- CreateTable: VisitorSession — one row per browser session (guest or signed-in)
CREATE TABLE "VisitorSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "device" TEXT NOT NULL DEFAULT 'Unknown',
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorSession_pkey" PRIMARY KEY ("id")
);

-- AlterTable: tie downloads to the browser session so guest downloads stay attributable
ALTER TABLE "Download" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "VisitorSession_userId_idx" ON "VisitorSession"("userId");
CREATE INDEX "VisitorSession_lastSeenAt_idx" ON "VisitorSession"("lastSeenAt");
CREATE INDEX "VisitorSession_firstSeenAt_idx" ON "VisitorSession"("firstSeenAt");
CREATE INDEX "Download_sessionId_idx" ON "Download"("sessionId");

-- AddForeignKey
ALTER TABLE "VisitorSession" ADD CONSTRAINT "VisitorSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
