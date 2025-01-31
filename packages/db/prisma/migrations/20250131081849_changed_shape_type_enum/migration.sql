/*
  Warnings:

  - The values [ELLIPSE,POLYGON] on the enum `ShapeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShapeType_new" AS ENUM ('RECTANGLE', 'CIRCLE', 'LINE', 'ARROW', 'PATH', 'TEXT');
ALTER TABLE "Shape" ALTER COLUMN "type" TYPE "ShapeType_new" USING ("type"::text::"ShapeType_new");
ALTER TYPE "ShapeType" RENAME TO "ShapeType_old";
ALTER TYPE "ShapeType_new" RENAME TO "ShapeType";
DROP TYPE "ShapeType_old";
COMMIT;
