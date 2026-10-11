-- Guest commenting: a comment no longer requires a registered user.
ALTER TABLE "Comment" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Comment" ADD COLUMN "guestName" TEXT;

-- Admin ad campaigns are now durable instead of living in process memory
-- (which lost every campaign on each serverless cold start).
CREATE TABLE "SiteAd" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "placement" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '/fallback-poster.png',
    "targetUrl" TEXT NOT NULL,
    "badgeText" TEXT NOT NULL DEFAULT 'Sponsored',
    "ctaText" TEXT NOT NULL DEFAULT 'Learn More',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAd_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SiteAd_placement_idx" ON "SiteAd"("placement");
CREATE INDEX "SiteAd_isActive_idx" ON "SiteAd"("isActive");
