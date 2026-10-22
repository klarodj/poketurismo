CREATE TABLE "game"."MeetMessage" (
 "id" TEXT NOT NULL PRIMARY KEY,"senderId" INTEGER NOT NULL,"recipientId" INTEGER NOT NULL,"text" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"readAt" TIMESTAMP(3),
 FOREIGN KEY("senderId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("recipientId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MeetMessage_recipientId_createdAt_idx" ON "game"."MeetMessage"("recipientId","createdAt");
CREATE INDEX "MeetMessage_senderId_recipientId_createdAt_idx" ON "game"."MeetMessage"("senderId","recipientId","createdAt");
CREATE TABLE "game"."MeetBlock" (
 "blockerId" INTEGER NOT NULL,"blockedId" INTEGER NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY("blockerId","blockedId"),
 FOREIGN KEY("blockerId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("blockedId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "game"."MeetReport" (
 "id" TEXT NOT NULL PRIMARY KEY,"reporterId" INTEGER NOT NULL,"reportedId" INTEGER NOT NULL,"messageId" TEXT,"reason" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'open',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY("reporterId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("reportedId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MeetReport_status_createdAt_idx" ON "game"."MeetReport"("status","createdAt");
CREATE TABLE "game"."MeetChallenge" (
 "id" TEXT NOT NULL PRIMARY KEY,"senderId" INTEGER NOT NULL,"recipientId" INTEGER NOT NULL,"status" TEXT NOT NULL DEFAULT 'pending',"contract" TEXT NOT NULL,"results" TEXT NOT NULL DEFAULT '{}',"senderRaceId" TEXT,"recipientRaceId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"expiresAt" TIMESTAMP(3) NOT NULL,
 FOREIGN KEY("senderId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("recipientId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MeetChallenge_senderRaceId_key" ON "game"."MeetChallenge"("senderRaceId");
CREATE UNIQUE INDEX "MeetChallenge_recipientRaceId_key" ON "game"."MeetChallenge"("recipientRaceId");
CREATE INDEX "MeetChallenge_senderId_status_idx" ON "game"."MeetChallenge"("senderId","status");
CREATE INDEX "MeetChallenge_recipientId_status_idx" ON "game"."MeetChallenge"("recipientId","status");
