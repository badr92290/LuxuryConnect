-- AlterTable
ALTER TABLE "PortfolioImage" ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "websiteImportedAt" TIMESTAMP(3),
ADD COLUMN     "websiteRightsConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "ContactLead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "serviceType" "ServiceType",
    "message" TEXT,
    "city" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioImage_professionalId_sourceUrl_key" ON "PortfolioImage"("professionalId", "sourceUrl");

