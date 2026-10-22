ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "MeetMessage" (
 "id" TEXT NOT NULL PRIMARY KEY,"senderId" INTEGER NOT NULL,"recipientId" INTEGER NOT NULL,"text" TEXT NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"readAt" DATETIME,
 FOREIGN KEY("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MeetMessage_recipientId_createdAt_idx" ON "MeetMessage"("recipientId","createdAt");
CREATE INDEX "MeetMessage_senderId_recipientId_createdAt_idx" ON "MeetMessage"("senderId","recipientId","createdAt");
CREATE TABLE "MeetBlock" (
 "blockerId" INTEGER NOT NULL,"blockedId" INTEGER NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY("blockerId","blockedId"),
 FOREIGN KEY("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "MeetReport" (
 "id" TEXT NOT NULL PRIMARY KEY,"reporterId" INTEGER NOT NULL,"reportedId" INTEGER NOT NULL,"messageId" TEXT,"reason" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'open',"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("reportedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "MeetReport_status_createdAt_idx" ON "MeetReport"("status","createdAt");
CREATE TABLE "MeetChallenge" (
 "id" TEXT NOT NULL PRIMARY KEY,"senderId" INTEGER NOT NULL,"recipientId" INTEGER NOT NULL,"status" TEXT NOT NULL DEFAULT 'pending',"contract" TEXT NOT NULL,"results" TEXT NOT NULL DEFAULT '{}',"senderRaceId" TEXT,"recipientRaceId" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"expiresAt" DATETIME NOT NULL,
 FOREIGN KEY("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,FOREIGN KEY("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MeetChallenge_senderRaceId_key" ON "MeetChallenge"("senderRaceId");
CREATE UNIQUE INDEX "MeetChallenge_recipientRaceId_key" ON "MeetChallenge"("recipientRaceId");
CREATE INDEX "MeetChallenge_senderId_status_idx" ON "MeetChallenge"("senderId","status");
CREATE INDEX "MeetChallenge_recipientId_status_idx" ON "MeetChallenge"("recipientId","status");
