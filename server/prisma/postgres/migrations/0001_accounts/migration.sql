-- The administrator creates and assigns this schema in deploy/accounts-init.sh.
-- The game role deliberately has no CREATE privilege on the database.

-- CreateTable
CREATE TABLE "game"."Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Car" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" INTEGER,
    "year" INTEGER NOT NULL,
    "cv" INTEGER NOT NULL,
    "nm" INTEGER NOT NULL,
    "cc" INTEGER NOT NULL,
    "kg" INTEGER NOT NULL,
    "driveType" TEXT NOT NULL,
    "velMax" INTEGER NOT NULL,
    "zeroToHundred" DOUBLE PRECISION NOT NULL,
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
    "speed" DOUBLE PRECISION NOT NULL,
    "acceleration" DOUBLE PRECISION NOT NULL,
    "revving" DOUBLE PRECISION NOT NULL,
    "transmission" DOUBLE PRECISION NOT NULL,
    "turnSlow" DOUBLE PRECISION NOT NULL,
    "turnFast" DOUBLE PRECISION NOT NULL,
    "brake" DOUBLE PRECISION NOT NULL,
    "traction" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "braveStart" INTEGER NOT NULL,
    "cleanStart" INTEGER NOT NULL,
    "reflexStart" INTEGER NOT NULL,
    "acroStart" INTEGER NOT NULL,
    "turnStart" INTEGER NOT NULL,
    "brakeStart" INTEGER NOT NULL,
    "throttleStart" INTEGER NOT NULL,
    "shiftStart" INTEGER NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."User" (
    "authUserId" UUID,
    "usernameKey" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "money" INTEGER NOT NULL DEFAULT 0,
    "moneyCents" INTEGER NOT NULL DEFAULT 0,
    "brave" INTEGER NOT NULL,
    "clean" INTEGER NOT NULL,
    "reflex" INTEGER NOT NULL,
    "acro" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "brake" INTEGER NOT NULL,
    "throttle" INTEGER NOT NULL,
    "shift" INTEGER NOT NULL,
    "carDrive" INTEGER NOT NULL,
    "class" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Garage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "cv" INTEGER NOT NULL,
    "nm" INTEGER NOT NULL,
    "kg" INTEGER NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "acceleration" DOUBLE PRECISION NOT NULL,
    "revving" DOUBLE PRECISION NOT NULL,
    "transmission" DOUBLE PRECISION NOT NULL,
    "turnSlow" DOUBLE PRECISION NOT NULL,
    "turnFast" DOUBLE PRECISION NOT NULL,
    "brake" DOUBLE PRECISION NOT NULL,
    "traction" DOUBLE PRECISION NOT NULL,
    "km" INTEGER NOT NULL DEFAULT 0,
    "sellPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "engineHealth" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "tireGrip" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "serviceKm" INTEGER NOT NULL DEFAULT 0,
    "currentFuel" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "fuelType" TEXT NOT NULL DEFAULT 'Normale',

    CONSTRAINT "Garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Level" (
    "id" SERIAL NOT NULL,
    "expCap" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Part" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "speedBonus" DOUBLE PRECISION NOT NULL,
    "accelBonus" DOUBLE PRECISION NOT NULL,
    "revvBonus" DOUBLE PRECISION NOT NULL,
    "transBonus" DOUBLE PRECISION NOT NULL,
    "turnSlowBonus" DOUBLE PRECISION NOT NULL,
    "turnFastBonus" DOUBLE PRECISION NOT NULL,
    "brakeBonus" DOUBLE PRECISION NOT NULL,
    "tractBonus" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "cvBonus" DOUBLE PRECISION NOT NULL,
    "nmBonus" DOUBLE PRECISION NOT NULL,
    "kgBonus" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Mod" (
    "id" SERIAL NOT NULL,
    "garageId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "speedValue" DOUBLE PRECISION NOT NULL,
    "accelValue" DOUBLE PRECISION NOT NULL,
    "revvValue" DOUBLE PRECISION NOT NULL,
    "transValue" DOUBLE PRECISION NOT NULL,
    "turnSlowValue" DOUBLE PRECISION NOT NULL,
    "turnFastValue" DOUBLE PRECISION NOT NULL,
    "brakeValue" DOUBLE PRECISION NOT NULL,
    "tractValue" DOUBLE PRECISION NOT NULL,
    "cvValue" DOUBLE PRECISION NOT NULL,
    "nmValue" DOUBLE PRECISION NOT NULL,
    "kgValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Mod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."TrackType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "TrackType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."TrackSurface" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TrackSurface_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."TrackMeteo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stat" TEXT NOT NULL,

    CONSTRAINT "TrackMeteo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Track" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "lenght" INTEGER NOT NULL,
    "elevation" INTEGER NOT NULL,
    "surfaceId" INTEGER NOT NULL,
    "meteoId" INTEGER NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."TrackSection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "carStat" TEXT NOT NULL,
    "carTech" TEXT NOT NULL,
    "driverStat" TEXT NOT NULL,
    "driverTech" TEXT NOT NULL,

    CONSTRAINT "TrackSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."TrackBuild" (
    "id" SERIAL NOT NULL,
    "trackId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,

    CONSTRAINT "TrackBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."Championship" (
    "id" SERIAL NOT NULL,
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
    "rewardXp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."ChampionshipRace" (
    "id" SERIAL NOT NULL,
    "championshipId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    "opponentName" TEXT NOT NULL,
    "opponentCarName" TEXT NOT NULL,
    "opponentDifficulty" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "ChampionshipRace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."ChampionshipEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "championshipId" INTEGER NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "playerPoints" INTEGER NOT NULL DEFAULT 0,
    "opponentPoints" INTEGER NOT NULL DEFAULT 0,
    "gapDifference" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "results" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChampionshipEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."TrainingSession" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."CustomOpponent" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "CustomOpponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."CustomTrack" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CustomTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."CustomTrackSection" (
    "id" SERIAL NOT NULL,
    "customTrackId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,

    CONSTRAINT "CustomTrackSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."PlayerProgress" (
    "userId" INTEGER NOT NULL,
    "learnedMoves" TEXT NOT NULL DEFAULT '[]',
    "equippedMoves" TEXT NOT NULL DEFAULT '["m1","m2","m3"]',

    CONSTRAINT "PlayerProgress_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "game"."InventoryPart" (
    "userId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InventoryPart_pkey" PRIMARY KEY ("userId","partId")
);

-- CreateTable
CREATE TABLE "game"."GameOperation" (
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameOperation_pkey" PRIMARY KEY ("userId","key")
);

-- CreateTable
CREATE TABLE "game"."RaceSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "garageId" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "seed" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."DriverDevelopment" (
    "userId" INTEGER NOT NULL,
    "earlyPractice" INTEGER NOT NULL DEFAULT 0,
    "referencePractice" INTEGER NOT NULL DEFAULT 0,
    "latePractice" INTEGER NOT NULL DEFAULT 0,
    "techniquePractice" INTEGER NOT NULL DEFAULT 0,
    "lessonRead" BOOLEAN NOT NULL DEFAULT false,
    "lessonPassed" BOOLEAN NOT NULL DEFAULT false,
    "routePractice" TEXT NOT NULL DEFAULT '{}',
    "trainingCourses" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "DriverDevelopment_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "game"."User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameKey_key" ON "game"."User"("usernameKey");

-- CreateIndex
CREATE INDEX "RaceSession_userId_status_idx" ON "game"."RaceSession"("userId", "status");

-- AddForeignKey
ALTER TABLE "game"."Car" ADD CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "game"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Garage" ADD CONSTRAINT "Garage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Garage" ADD CONSTRAINT "Garage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "game"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Mod" ADD CONSTRAINT "Mod_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "game"."Garage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Mod" ADD CONSTRAINT "Mod_partId_fkey" FOREIGN KEY ("partId") REFERENCES "game"."Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Track" ADD CONSTRAINT "Track_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "game"."TrackType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Track" ADD CONSTRAINT "Track_surfaceId_fkey" FOREIGN KEY ("surfaceId") REFERENCES "game"."TrackSurface"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."Track" ADD CONSTRAINT "Track_meteoId_fkey" FOREIGN KEY ("meteoId") REFERENCES "game"."TrackMeteo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."TrackBuild" ADD CONSTRAINT "TrackBuild_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "game"."Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."TrackBuild" ADD CONSTRAINT "TrackBuild_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "game"."TrackSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."ChampionshipRace" ADD CONSTRAINT "ChampionshipRace_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "game"."Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."ChampionshipRace" ADD CONSTRAINT "ChampionshipRace_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "game"."Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."ChampionshipEntry" ADD CONSTRAINT "ChampionshipEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."ChampionshipEntry" ADD CONSTRAINT "ChampionshipEntry_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "game"."Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."TrainingSession" ADD CONSTRAINT "TrainingSession_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "game"."Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."CustomOpponent" ADD CONSTRAINT "CustomOpponent_carId_fkey" FOREIGN KEY ("carId") REFERENCES "game"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."CustomTrackSection" ADD CONSTRAINT "CustomTrackSection_customTrackId_fkey" FOREIGN KEY ("customTrackId") REFERENCES "game"."CustomTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."CustomTrackSection" ADD CONSTRAINT "CustomTrackSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "game"."TrackSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."PlayerProgress" ADD CONSTRAINT "PlayerProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."InventoryPart" ADD CONSTRAINT "InventoryPart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."InventoryPart" ADD CONSTRAINT "InventoryPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "game"."Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."GameOperation" ADD CONSTRAINT "GameOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."RaceSession" ADD CONSTRAINT "RaceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game"."DriverDevelopment" ADD CONSTRAINT "DriverDevelopment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "game"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Preserve the persistence invariants previously enforced by SQLite migrations.
CREATE UNIQUE INDEX "RaceSession_one_active_per_user" ON "game"."RaceSession" ("userId") WHERE status = 'active';
ALTER TABLE "game"."DriverDevelopment" ADD CONSTRAINT "practice_bounds" CHECK (
  "earlyPractice" BETWEEN 0 AND 120 AND "referencePractice" BETWEEN 0 AND 120
  AND "latePractice" BETWEEN 0 AND 120 AND "techniquePractice" BETWEEN 0 AND 60
);
ALTER TABLE "game"."InventoryPart" ADD CONSTRAINT "inventory_nonnegative" CHECK (quantity >= 0);
ALTER TABLE "game"."User" ADD CONSTRAINT "wallet_nonnegative" CHECK ("moneyCents" >= 0);
ALTER TABLE "game"."User" ADD CONSTRAINT "User_auth_identity_fkey" FOREIGN KEY ("authUserId") REFERENCES auth.users(id) ON DELETE RESTRICT;
