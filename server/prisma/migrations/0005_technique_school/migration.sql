ALTER TABLE "DriverDevelopment" ADD COLUMN "techniqueProgress" TEXT NOT NULL DEFAULT '{}';
UPDATE "PlayerProgress" SET "equippedMoves" = (SELECT json_group_array(value) FROM json_each("PlayerProgress"."equippedMoves") WHERE value NOT IN ('m1','m2','m3'));
