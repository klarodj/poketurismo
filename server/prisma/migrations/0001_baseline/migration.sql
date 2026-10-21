-- Generated from server/prisma/schema.prisma. Refresh when the schema changes.
CREATE TABLE "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logo" TEXT
);
CREATE TABLE "Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brandId" INTEGER,
    "year" INTEGER NOT NULL,
    "cv" INTEGER NOT NULL,
    "nm" INTEGER NOT NULL,
    "cc" INTEGER NOT NULL,
    "kg" INTEGER NOT NULL,
    "driveType" TEXT NOT NULL,
    "velMax" INTEGER NOT NULL,
    "zeroToHundred" REAL NOT NULL,
    "engineType" TEXT NOT NULL,
    "wheelBase" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "brakeFront" INTEGER NOT NULL,
    "brakeRear" INTEGER NOT NULL,
    "wheelSize" INTEGER NOT NULL,
    "tyreFront" INTEGER NOT NULL,
    "tyreRear" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "speed" REAL NOT NULL,
    "acceleration" REAL NOT NULL,
    "revving" REAL NOT NULL,
    "transmission" REAL NOT NULL,
    "turnSlow" REAL NOT NULL,
    "turnFast" REAL NOT NULL,
    "brake" REAL NOT NULL,
    "traction" REAL NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE "Championship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'track.png',
    "minCv" INTEGER NOT NULL DEFAULT 0,
    "maxCv" INTEGER NOT NULL DEFAULT 9999,
    "minPerfIndex" INTEGER NOT NULL DEFAULT 0,
    "allowedDrive" TEXT NOT NULL DEFAULT 'any',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "minBrave" INTEGER NOT NULL DEFAULT 0,
    "minClean" INTEGER NOT NULL DEFAULT 0,
    "minReflex" INTEGER NOT NULL DEFAULT 0,
    "minShift" INTEGER NOT NULL DEFAULT 0,
    "entryFee" INTEGER NOT NULL DEFAULT 0,
    "rewardMoney" INTEGER NOT NULL DEFAULT 0,
    "rewardXp" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE "ChampionshipEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "championshipId" INTEGER NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "playerPoints" INTEGER NOT NULL DEFAULT 0,
    "opponentPoints" INTEGER NOT NULL DEFAULT 0,
    "gapDifference" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "results" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChampionshipEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChampionshipEntry_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "ChampionshipRace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "championshipId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    "opponentName" TEXT NOT NULL,
    "opponentCarName" TEXT NOT NULL,
    "opponentDifficulty" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "ChampionshipRace_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChampionshipRace_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "braveStart" INTEGER NOT NULL,
    "cleanStart" INTEGER NOT NULL,
    "reflexStart" INTEGER NOT NULL,
    "acroStart" INTEGER NOT NULL,
    "turnStart" INTEGER NOT NULL,
    "brakeStart" INTEGER NOT NULL,
    "throttleStart" INTEGER NOT NULL,
    "shiftStart" INTEGER NOT NULL
);
CREATE TABLE "CustomOpponent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "shift" INTEGER NOT NULL,
    "reflex" INTEGER NOT NULL,
    "brave" INTEGER NOT NULL,
    "clean" INTEGER NOT NULL,
    "acro" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "brake" INTEGER NOT NULL,
    "throttle" INTEGER NOT NULL,
    CONSTRAINT "CustomOpponent_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "CustomTrack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
CREATE TABLE "CustomTrackSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customTrackId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    CONSTRAINT "CustomTrackSection_customTrackId_fkey" FOREIGN KEY ("customTrackId") REFERENCES "CustomTrack" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomTrackSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TrackSection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "Garage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "cv" INTEGER NOT NULL,
    "nm" INTEGER NOT NULL,
    "kg" INTEGER NOT NULL,
    "speed" REAL NOT NULL,
    "acceleration" REAL NOT NULL,
    "revving" REAL NOT NULL,
    "transmission" REAL NOT NULL,
    "turnSlow" REAL NOT NULL,
    "turnFast" REAL NOT NULL,
    "brake" REAL NOT NULL,
    "traction" REAL NOT NULL,
    "km" INTEGER NOT NULL DEFAULT 0,
    "sellPrice" REAL NOT NULL DEFAULT 0.0,
    "engineHealth" INTEGER NOT NULL DEFAULT 100,
    "tireGrip" INTEGER NOT NULL DEFAULT 100,
    "serviceKm" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Garage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Garage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "Level" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "expCap" INTEGER NOT NULL
);
CREATE TABLE "Mod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "garageId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "speedValue" REAL NOT NULL,
    "accelValue" REAL NOT NULL,
    "revvValue" REAL NOT NULL,
    "transValue" REAL NOT NULL,
    "turnSlowValue" REAL NOT NULL,
    "turnFastValue" REAL NOT NULL,
    "brakeValue" REAL NOT NULL,
    "tractValue" REAL NOT NULL,
    "cvValue" REAL NOT NULL,
    "nmValue" REAL NOT NULL,
    "kgValue" REAL NOT NULL,
    CONSTRAINT "Mod_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mod_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "Part" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "speedBonus" REAL NOT NULL,
    "accelBonus" REAL NOT NULL,
    "revvBonus" REAL NOT NULL,
    "transBonus" REAL NOT NULL,
    "turnSlowBonus" REAL NOT NULL,
    "turnFastBonus" REAL NOT NULL,
    "brakeBonus" REAL NOT NULL,
    "tractBonus" REAL NOT NULL,
    "image" TEXT NOT NULL,
    "cvBonus" REAL NOT NULL,
    "nmBonus" REAL NOT NULL,
    "kgBonus" REAL NOT NULL
);
CREATE TABLE "Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "lenght" INTEGER NOT NULL,
    "elevation" INTEGER NOT NULL,
    "surfaceId" INTEGER NOT NULL,
    "meteoId" INTEGER NOT NULL,
    CONSTRAINT "Track_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TrackType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Track_surfaceId_fkey" FOREIGN KEY ("surfaceId") REFERENCES "TrackSurface" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Track_meteoId_fkey" FOREIGN KEY ("meteoId") REFERENCES "TrackMeteo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "TrackBuild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    CONSTRAINT "TrackBuild_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrackBuild_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TrackSection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "TrackMeteo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stat" TEXT NOT NULL
);
CREATE TABLE "TrackSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "carStat" TEXT NOT NULL,
    "carTech" TEXT NOT NULL,
    "driverStat" TEXT NOT NULL,
    "driverTech" TEXT NOT NULL
);
CREATE TABLE "TrackSurface" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
CREATE TABLE "TrackType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL
);
CREATE TABLE "TrainingSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetStat" TEXT NOT NULL DEFAULT '',
    "targetMove" TEXT NOT NULL DEFAULT '',
    "statGain" INTEGER NOT NULL DEFAULT 1,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "cost" INTEGER NOT NULL DEFAULT 500,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "trackId" INTEGER NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'track.png',
    CONSTRAINT "TrainingSession_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "lastLogin" DATETIME,
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "money" INTEGER NOT NULL DEFAULT 0,
    "brave" INTEGER NOT NULL,
    "clean" INTEGER NOT NULL,
    "reflex" INTEGER NOT NULL,
    "acro" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "brake" INTEGER NOT NULL,
    "throttle" INTEGER NOT NULL,
    "shift" INTEGER NOT NULL,
    "carDrive" INTEGER NOT NULL,
    "class" TEXT
);
