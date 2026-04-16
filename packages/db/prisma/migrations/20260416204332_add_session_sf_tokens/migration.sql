/*
  Warnings:

  - Added the required column `sfAccessToken` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sfInstanceUrl` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- Clear stale dev sessions before adding required columns
DELETE FROM "Session";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "sfAccessToken" TEXT NOT NULL,
ADD COLUMN     "sfInstanceUrl" TEXT NOT NULL;
