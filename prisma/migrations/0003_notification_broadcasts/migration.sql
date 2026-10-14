-- Site-wide broadcast notifications: `userId = NULL` means the row is shown
-- to every visitor (signed in or not) instead of one specific account.
ALTER TABLE "Notification" ALTER COLUMN "userId" DROP NOT NULL;
