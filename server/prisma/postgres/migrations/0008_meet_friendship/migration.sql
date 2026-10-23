CREATE TABLE "game"."MeetFriendship" (
 "lowId" INTEGER NOT NULL, "highId" INTEGER NOT NULL, "requestedBy" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, PRIMARY KEY ("lowId", "highId"),
 CHECK ("lowId" < "highId"), CHECK ("requestedBy" IN ("lowId", "highId")),
 CHECK ("status" IN ('pending','accepted','declined','removed','cancelled')),
 FOREIGN KEY ("lowId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 FOREIGN KEY ("highId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 FOREIGN KEY ("requestedBy") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MeetFriendship_lowId_status_idx" ON "game"."MeetFriendship"("lowId", "status");
CREATE INDEX "MeetFriendship_highId_status_idx" ON "game"."MeetFriendship"("highId", "status");
CREATE INDEX "MeetFriendship_requestedBy_createdAt_idx" ON "game"."MeetFriendship"("requestedBy", "createdAt");

-- Withdraw only the car currently being driven; preserve every other parked car.
UPDATE "game"."PlayerProgress" SET "showcaseGarageId" = NULL
WHERE EXISTS (SELECT 1 FROM "game"."RaceSession" r WHERE r."userId" = "game"."PlayerProgress"."userId" AND r."status" = 'active' AND r."garageId" > 0 AND r."garageId" = "game"."PlayerProgress"."showcaseGarageId");
