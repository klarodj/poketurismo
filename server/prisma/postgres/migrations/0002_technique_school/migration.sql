ALTER TABLE game."DriverDevelopment" ADD COLUMN "techniqueProgress" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE game."PlayerProgress" ALTER COLUMN "equippedMoves" SET DEFAULT '[]';
UPDATE game."PlayerProgress" SET "equippedMoves" = COALESCE((SELECT json_agg(value)::text FROM json_array_elements_text("equippedMoves"::json) AS ids(value) WHERE value NOT IN ('m1','m2','m3')), '[]');
