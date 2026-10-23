CREATE TABLE "MeetFriendship" (
 "lowId" INTEGER NOT NULL, "highId" INTEGER NOT NULL, "requestedBy" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'pending', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" DATETIME NOT NULL, PRIMARY KEY ("lowId", "highId"),
 CHECK ("lowId" < "highId"), CHECK ("requestedBy" IN ("lowId", "highId")),
 CHECK ("status" IN ('pending','accepted','declined','removed','cancelled')),
 FOREIGN KEY ("lowId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 FOREIGN KEY ("highId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MeetFriendship_lowId_status_idx" ON "MeetFriendship"("lowId", "status");
CREATE INDEX "MeetFriendship_highId_status_idx" ON "MeetFriendship"("highId", "status");
CREATE INDEX "MeetFriendship_requestedBy_createdAt_idx" ON "MeetFriendship"("requestedBy", "createdAt");

-- Withdraw only the car currently being driven; preserve every other parked car.
UPDATE "PlayerProgress" SET "showcaseGarageId" = NULL
WHERE EXISTS (SELECT 1 FROM "RaceSession" r WHERE r."userId" = "PlayerProgress"."userId" AND r."status" = 'active' AND r."garageId" > 0 AND r."garageId" = "PlayerProgress"."showcaseGarageId");
