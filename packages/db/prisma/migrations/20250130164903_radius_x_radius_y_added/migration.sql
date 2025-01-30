/*
  Warnings:

  - You are about to drop the column `radius` on the `Shape` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shape" DROP COLUMN "radius",
ADD COLUMN     "radiusX" DOUBLE PRECISION,
ADD COLUMN     "radiusY" DOUBLE PRECISION;
