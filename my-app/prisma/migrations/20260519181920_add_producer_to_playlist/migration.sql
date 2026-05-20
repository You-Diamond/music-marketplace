-- AlterTable
ALTER TABLE "playlist" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "producerId" TEXT;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
