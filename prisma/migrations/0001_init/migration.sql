-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'FAN');

-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('DRAFT', 'PROCESSING', 'READY', 'PUBLISHED', 'ARCHIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "ContentRightsStatus" AS ENUM ('UNKNOWN', 'LICENSED', 'PUBLIC_DOMAIN', 'UNAUTHORIZED');

-- CreateEnum
CREATE TYPE "MediaTier" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "StorageProviderType" AS ENUM ('TELEGRAM', 'GOOGLE_DRIVE', 'MEDIAFIRE', 'BACKBLAZE_B2', 'CLOUDFLARE_R2', 'AMAZON_S3', 'S3_COMPATIBLE');

-- CreateEnum
CREATE TYPE "StoragePurpose" AS ENUM ('STREAMING', 'DOWNLOAD', 'BACKUP');

-- CreateEnum
CREATE TYPE "StorageObjectStatus" AS ENUM ('PENDING', 'ACTIVE', 'MISSING', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "MediaJobType" AS ENUM ('TRANSCODE', 'GENERATE_HLS', 'UPLOAD', 'REPLICATE', 'VERIFY');

-- CreateEnum
CREATE TYPE "MediaJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'TRANSCODING', 'UPLOADING', 'VERIFYING', 'READY', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobLogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateEnum
CREATE TYPE "ProviderHealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "description" TEXT,
    "synopsis" TEXT,
    "releaseYear" INTEGER,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "ageRating" TEXT,
    "status" "MovieStatus" NOT NULL DEFAULT 'DRAFT',
    "tier" "MediaTier" NOT NULL DEFAULT 'COLD',
    "poster" TEXT,
    "backdrop" TEXT,
    "trailer" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "contentRightsStatus" "ContentRightsStatus" NOT NULL DEFAULT 'UNKNOWN',
    "licenseStart" TIMESTAMP(3),
    "licenseEnd" TIMESTAMP(3),
    "rightsOwner" TEXT,
    "distributionTerritories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "narrator" TEXT NOT NULL DEFAULT '',
    "genre" TEXT NOT NULL DEFAULT '',
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "resolutions" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieGenre" (
    "movieId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "MovieGenre_pkey" PRIMARY KEY ("movieId","genreId")
);

-- CreateTable
CREATE TABLE "Interpreter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "image" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moviesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interpreter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieInterpreter" (
    "movieId" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "MovieInterpreter_pkey" PRIMARY KEY ("movieId","interpreterId")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieLanguage" (
    "movieId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MovieLanguage_pkey" PRIMARY KEY ("movieId","languageId")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAsset" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "label" TEXT,
    "fingerprint" TEXT,
    "status" "MovieStatus" NOT NULL DEFAULT 'PROCESSING',
    "sourceUrl" TEXT,
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "bitrate" INTEGER,
    "codec" TEXT,
    "sizeBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoQuality" (
    "id" TEXT NOT NULL,
    "videoAssetId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER,
    "bitrate" INTEGER,
    "codec" TEXT NOT NULL DEFAULT 'h264',
    "isHls" BOOLEAN NOT NULL DEFAULT false,
    "sizeBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSubtitle" (
    "id" TEXT NOT NULL,
    "videoAssetId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoSubtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAudioTrack" (
    "id" TEXT NOT NULL,
    "videoAssetId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "codec" TEXT NOT NULL DEFAULT 'aac',
    "channels" INTEGER NOT NULL DEFAULT 2,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VideoAudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamingManifest" (
    "id" TEXT NOT NULL,
    "videoAssetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HLS',
    "url" TEXT NOT NULL,
    "storageObjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamingManifest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoviePoster" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoviePoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieBackdrop" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieBackdrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trailer" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "userId" TEXT,
    "quality" TEXT,
    "providerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'STARTED',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewEvent" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "quality" TEXT,
    "provider" TEXT,
    "country" TEXT,
    "device" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startupTimeMs" INTEGER,
    "bufferEvents" INTEGER,

    CONSTRAINT "ViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageProvider" (
    "id" TEXT NOT NULL,
    "type" "StorageProviderType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "tiers" "MediaTier"[] DEFAULT ARRAY['COLD']::"MediaTier"[],
    "purposes" "StoragePurpose"[] DEFAULT ARRAY['BACKUP']::"StoragePurpose"[],
    "capabilities" JSONB NOT NULL,
    "config" JSONB,
    "healthStatus" "ProviderHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "latencyMs" INTEGER,
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderHealthCheck" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "ProviderHealthStatus" NOT NULL,
    "latencyMs" INTEGER,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderHealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageObject" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "videoAssetId" TEXT,
    "qualityId" TEXT,
    "externalObjectId" TEXT,
    "externalMessageId" TEXT,
    "path" TEXT,
    "filename" TEXT,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "checksum" TEXT,
    "status" "StorageObjectStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" "StoragePurpose" NOT NULL DEFAULT 'BACKUP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaJob" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "sourceAssetId" TEXT,
    "providerId" TEXT,
    "jobType" "MediaJobType" NOT NULL,
    "status" "MediaJobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "fingerprint" TEXT,
    "options" JSONB,
    "result" JSONB,
    "errorMessage" TEXT,
    "actorId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaJobLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" "JobLogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanClip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FanClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieRequest" (
    "id" TEXT NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "votesCount" INTEGER NOT NULL DEFAULT 1,
    "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "movieId" TEXT,

    CONSTRAINT "MovieRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "followingType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");

-- CreateIndex
CREATE INDEX "Movie_slug_idx" ON "Movie"("slug");

-- CreateIndex
CREATE INDEX "Movie_status_idx" ON "Movie"("status");

-- CreateIndex
CREATE INDEX "Movie_releaseYear_idx" ON "Movie"("releaseYear");

-- CreateIndex
CREATE INDEX "Movie_createdAt_idx" ON "Movie"("createdAt");

-- CreateIndex
CREATE INDEX "Movie_publishedAt_idx" ON "Movie"("publishedAt");

-- CreateIndex
CREATE INDEX "Movie_viewCount_idx" ON "Movie"("viewCount");

-- CreateIndex
CREATE INDEX "Movie_tier_idx" ON "Movie"("tier");

-- CreateIndex
CREATE INDEX "Movie_isFeatured_idx" ON "Movie"("isFeatured");

-- CreateIndex
CREATE INDEX "Movie_isActive_idx" ON "Movie"("isActive");

-- CreateIndex
CREATE INDEX "Movie_status_publishedAt_idx" ON "Movie"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE INDEX "Genre_name_idx" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "MovieGenre_genreId_idx" ON "MovieGenre"("genreId");

-- CreateIndex
CREATE UNIQUE INDEX "Interpreter_name_key" ON "Interpreter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Interpreter_slug_key" ON "Interpreter"("slug");

-- CreateIndex
CREATE INDEX "Interpreter_name_idx" ON "Interpreter"("name");

-- CreateIndex
CREATE INDEX "MovieInterpreter_interpreterId_idx" ON "MovieInterpreter"("interpreterId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "Language_name_idx" ON "Language"("name");

-- CreateIndex
CREATE INDEX "MovieLanguage_languageId_idx" ON "MovieLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VideoAsset_fingerprint_key" ON "VideoAsset"("fingerprint");

-- CreateIndex
CREATE INDEX "VideoAsset_movieId_idx" ON "VideoAsset"("movieId");

-- CreateIndex
CREATE INDEX "VideoAsset_fingerprint_idx" ON "VideoAsset"("fingerprint");

-- CreateIndex
CREATE INDEX "VideoAsset_status_idx" ON "VideoAsset"("status");

-- CreateIndex
CREATE INDEX "VideoQuality_videoAssetId_idx" ON "VideoQuality"("videoAssetId");

-- CreateIndex
CREATE INDEX "VideoQuality_height_idx" ON "VideoQuality"("height");

-- CreateIndex
CREATE UNIQUE INDEX "VideoQuality_videoAssetId_label_key" ON "VideoQuality"("videoAssetId", "label");

-- CreateIndex
CREATE INDEX "VideoSubtitle_videoAssetId_idx" ON "VideoSubtitle"("videoAssetId");

-- CreateIndex
CREATE INDEX "VideoAudioTrack_videoAssetId_idx" ON "VideoAudioTrack"("videoAssetId");

-- CreateIndex
CREATE INDEX "StreamingManifest_videoAssetId_idx" ON "StreamingManifest"("videoAssetId");

-- CreateIndex
CREATE INDEX "MoviePoster_movieId_idx" ON "MoviePoster"("movieId");

-- CreateIndex
CREATE INDEX "MovieBackdrop_movieId_idx" ON "MovieBackdrop"("movieId");

-- CreateIndex
CREATE INDEX "Trailer_movieId_idx" ON "Trailer"("movieId");

-- CreateIndex
CREATE INDEX "Review_movieId_idx" ON "Review"("movieId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Rating_movieId_idx" ON "Rating"("movieId");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_movieId_userId_key" ON "Rating"("movieId", "userId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_movieId_idx" ON "Favorite"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_movieId_userId_key" ON "Favorite"("movieId", "userId");

-- CreateIndex
CREATE INDEX "WatchHistory_userId_idx" ON "WatchHistory"("userId");

-- CreateIndex
CREATE INDEX "WatchHistory_movieId_idx" ON "WatchHistory"("movieId");

-- CreateIndex
CREATE INDEX "WatchHistory_lastWatchedAt_idx" ON "WatchHistory"("lastWatchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_movieId_userId_key" ON "WatchHistory"("movieId", "userId");

-- CreateIndex
CREATE INDEX "Download_movieId_idx" ON "Download"("movieId");

-- CreateIndex
CREATE INDEX "Download_userId_idx" ON "Download"("userId");

-- CreateIndex
CREATE INDEX "Download_createdAt_idx" ON "Download"("createdAt");

-- CreateIndex
CREATE INDEX "ViewEvent_movieId_idx" ON "ViewEvent"("movieId");

-- CreateIndex
CREATE INDEX "ViewEvent_userId_idx" ON "ViewEvent"("userId");

-- CreateIndex
CREATE INDEX "ViewEvent_startedAt_idx" ON "ViewEvent"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StorageProvider_name_key" ON "StorageProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StorageProvider_slug_key" ON "StorageProvider"("slug");

-- CreateIndex
CREATE INDEX "StorageProvider_enabled_idx" ON "StorageProvider"("enabled");

-- CreateIndex
CREATE INDEX "StorageProvider_priority_idx" ON "StorageProvider"("priority");

-- CreateIndex
CREATE INDEX "StorageProvider_type_idx" ON "StorageProvider"("type");

-- CreateIndex
CREATE INDEX "ProviderHealthCheck_providerId_idx" ON "ProviderHealthCheck"("providerId");

-- CreateIndex
CREATE INDEX "ProviderHealthCheck_checkedAt_idx" ON "ProviderHealthCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "StorageObject_providerId_idx" ON "StorageObject"("providerId");

-- CreateIndex
CREATE INDEX "StorageObject_videoAssetId_idx" ON "StorageObject"("videoAssetId");

-- CreateIndex
CREATE INDEX "StorageObject_qualityId_idx" ON "StorageObject"("qualityId");

-- CreateIndex
CREATE INDEX "StorageObject_status_idx" ON "StorageObject"("status");

-- CreateIndex
CREATE INDEX "StorageObject_purpose_idx" ON "StorageObject"("purpose");

-- CreateIndex
CREATE INDEX "StorageObject_providerId_purpose_status_idx" ON "StorageObject"("providerId", "purpose", "status");

-- CreateIndex
CREATE INDEX "MediaJob_movieId_idx" ON "MediaJob"("movieId");

-- CreateIndex
CREATE INDEX "MediaJob_status_idx" ON "MediaJob"("status");

-- CreateIndex
CREATE INDEX "MediaJob_jobType_idx" ON "MediaJob"("jobType");

-- CreateIndex
CREATE INDEX "MediaJob_createdAt_idx" ON "MediaJob"("createdAt");

-- CreateIndex
CREATE INDEX "MediaJob_status_createdAt_idx" ON "MediaJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MediaJobLog_jobId_idx" ON "MediaJobLog"("jobId");

-- CreateIndex
CREATE INDEX "MediaJobLog_createdAt_idx" ON "MediaJobLog"("createdAt");

-- CreateIndex
CREATE INDEX "FanClip_userId_idx" ON "FanClip"("userId");

-- CreateIndex
CREATE INDEX "FanClip_isApproved_idx" ON "FanClip"("isApproved");

-- CreateIndex
CREATE INDEX "MovieRequest_userId_idx" ON "MovieRequest"("userId");

-- CreateIndex
CREATE INDEX "MovieRequest_isFulfilled_idx" ON "MovieRequest"("isFulfilled");

-- CreateIndex
CREATE INDEX "MovieRequest_votesCount_idx" ON "MovieRequest"("votesCount");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_targetId_targetType_key" ON "Like"("userId", "targetId", "targetType");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_followingType_key" ON "Follow"("followerId", "followingId", "followingType");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_targetId_targetType_idx" ON "Comment"("targetId", "targetType");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieGenre" ADD CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieInterpreter" ADD CONSTRAINT "MovieInterpreter_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieInterpreter" ADD CONSTRAINT "MovieInterpreter_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "Interpreter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieLanguage" ADD CONSTRAINT "MovieLanguage_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieLanguage" ADD CONSTRAINT "MovieLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAsset" ADD CONSTRAINT "VideoAsset_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoQuality" ADD CONSTRAINT "VideoQuality_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "VideoAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "VideoAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAudioTrack" ADD CONSTRAINT "VideoAudioTrack_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "VideoAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamingManifest" ADD CONSTRAINT "StreamingManifest_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "VideoAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoviePoster" ADD CONSTRAINT "MoviePoster_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieBackdrop" ADD CONSTRAINT "MovieBackdrop_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trailer" ADD CONSTRAINT "Trailer_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewEvent" ADD CONSTRAINT "ViewEvent_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewEvent" ADD CONSTRAINT "ViewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderHealthCheck" ADD CONSTRAINT "ProviderHealthCheck_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "StorageProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "StorageProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "VideoAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "VideoQuality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaJob" ADD CONSTRAINT "MediaJob_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaJob" ADD CONSTRAINT "MediaJob_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "StorageProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaJob" ADD CONSTRAINT "MediaJob_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaJobLog" ADD CONSTRAINT "MediaJobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "MediaJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanClip" ADD CONSTRAINT "FanClip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieRequest" ADD CONSTRAINT "MovieRequest_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieRequest" ADD CONSTRAINT "MovieRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

