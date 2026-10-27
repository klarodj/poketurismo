BEGIN;
ALTER TABLE "game"."Garage" ADD COLUMN "paintColour" TEXT CHECK ("paintColour" IS NULL OR "paintColour" IN ('rosso','blu','verde','nero','bianco','argento','giallo'));
UPDATE "game"."Garage" SET "paintColour" = CASE (("id" % 7 + 7) % 7) WHEN 0 THEN 'rosso' WHEN 1 THEN 'blu' WHEN 2 THEN 'verde' WHEN 3 THEN 'nero' WHEN 4 THEN 'bianco' WHEN 5 THEN 'argento' ELSE 'giallo' END WHERE "paintColour" IS NULL AND "userId" = -1;
COMMIT;
