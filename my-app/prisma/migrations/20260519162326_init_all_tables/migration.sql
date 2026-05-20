/*
  Warnings:

  - The values [PURCHASE,MESSAGE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stemsIncluded` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `trackoutIncluded` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `unlimitedStreams` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `wavIncluded` on the `License` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[trackId,templateId]` on the table `License` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `templateId` to the `License` table without a default value. This is not possible if the table is not empty.
  - Made the column `genreId` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SoundPackCategory" AS ENUM ('DRUMKITS', 'LOOPS', 'PRESETS');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'DECLINED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LicenseFileType" AS ENUM ('MP3_TAGGED', 'MP3_UNTAGGED', 'MP3_WAV', 'STEMS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('LIKE', 'INQUIRY_RECEIVED', 'INQUIRY_UPDATED', 'FOLLOW', 'PLAYLIST', 'SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_genreId_fkey";

-- AlterTable
ALTER TABLE "License" DROP COLUMN "stemsIncluded",
DROP COLUMN "title",
DROP COLUMN "trackoutIncluded",
DROP COLUMN "unlimitedStreams",
DROP COLUMN "wavIncluded",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "templateId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "genreId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "paymentCustomerId" TEXT,
ADD COLUMN     "paymentSubscriptionId" TEXT,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "vkontakte" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "playlist" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'moods';

-- AlterTable
ALTER TABLE "soundpack" ADD COLUMN     "category" "SoundPackCategory" NOT NULL DEFAULT 'DRUMKITS';

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateTable
CREATE TABLE "mood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "defaultPrice" DOUBLE PRECISION NOT NULL,
    "fileType" "LicenseFileType" NOT NULL DEFAULT 'MP3_TAGGED',
    "isDefaultActive" BOOLEAN NOT NULL DEFAULT true,
    "arbitrationCountry" TEXT NOT NULL DEFAULT 'Russia',
    "governingLawCountry" TEXT NOT NULL DEFAULT 'Russia',
    "termYears" INTEGER,
    "distributionCopies" INTEGER,
    "audioStreams" INTEGER,
    "freeDownloads" INTEGER,
    "musicVideosMonetized" INTEGER,
    "musicVideosNonMonetized" INTEGER,
    "videoStreamsMonetized" INTEGER,
    "videoStreamsNonMonetized" INTEGER,
    "radioBroadcastingRights" BOOLEAN NOT NULL DEFAULT false,
    "radioStations" INTEGER,
    "livePerformancesForProfit" BOOLEAN NOT NULL DEFAULT false,
    "livePerformancesNonProfit" INTEGER,
    "producerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "buyerContact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buyerId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryItem" (
    "id" TEXT NOT NULL,
    "priceAtInquiry" DOUBLE PRECISION NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "licenseId" TEXT,

    CONSTRAINT "InquiryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TrackMoods" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TrackMoods_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlaylistMoods" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlaylistMoods_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "mood_name_key" ON "mood"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mood_slug_key" ON "mood"("slug");

-- CreateIndex
CREATE INDEX "_TrackMoods_B_index" ON "_TrackMoods"("B");

-- CreateIndex
CREATE INDEX "_PlaylistMoods_B_index" ON "_PlaylistMoods"("B");

-- CreateIndex
CREATE UNIQUE INDEX "License_trackId_templateId_key" ON "License"("trackId", "templateId");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseTemplate" ADD CONSTRAINT "LicenseTemplate_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LicenseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryItem" ADD CONSTRAINT "InquiryItem_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryItem" ADD CONSTRAINT "InquiryItem_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryItem" ADD CONSTRAINT "InquiryItem_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrackMoods" ADD CONSTRAINT "_TrackMoods_A_fkey" FOREIGN KEY ("A") REFERENCES "mood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrackMoods" ADD CONSTRAINT "_TrackMoods_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistMoods" ADD CONSTRAINT "_PlaylistMoods_A_fkey" FOREIGN KEY ("A") REFERENCES "mood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistMoods" ADD CONSTRAINT "_PlaylistMoods_B_fkey" FOREIGN KEY ("B") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
