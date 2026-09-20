-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Review_published_createdAt_idx" ON "Review"("published", "createdAt");

