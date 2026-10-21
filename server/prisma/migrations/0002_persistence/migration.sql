-- CreateTable
CREATE TABLE "PlayerProgress" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "learnedMoves" TEXT NOT NULL DEFAULT '[]',
    "equippedMoves" TEXT NOT NULL DEFAULT '["m1","m2","m3"]',
    CONSTRAINT "PlayerProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryPart" (
    "userId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("userId", "partId"),
    CONSTRAINT "InventoryPart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameOperation" (
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "key"),
    CONSTRAINT "GameOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RaceSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "garageId" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "seed" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RaceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "lastLogin" DATETIME,
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
    "class" TEXT
);
INSERT INTO "new_User" ("acro", "avatar", "brake", "brave", "carDrive", "class", "clean", "exp", "id", "lastLogin", "level", "mail", "money", "password", "reflex", "shift", "throttle", "turn", "username") SELECT "acro", "avatar", "brake", "brave", "carDrive", "class", "clean", "exp", "id", "lastLogin", "level", "mail", "money", "password", "reflex", "shift", "throttle", "turn", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE TABLE "new_Garage" (
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
    "engineHealth" REAL NOT NULL DEFAULT 100,
    "tireGrip" REAL NOT NULL DEFAULT 100,
    "serviceKm" INTEGER NOT NULL DEFAULT 0,
    "currentFuel" REAL NOT NULL DEFAULT 20,
    "fuelType" TEXT NOT NULL DEFAULT 'Normale',
    CONSTRAINT "Garage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Garage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Garage" ("acceleration", "brake", "carId", "cv", "engineHealth", "id", "kg", "km", "nm", "revving", "sellPrice", "serviceKm", "speed", "tireGrip", "traction", "transmission", "turnFast", "turnSlow", "userId") SELECT "acceleration", "brake", "carId", "cv", "engineHealth", "id", "kg", "km", "nm", "revving", "sellPrice", "serviceKm", "speed", "tireGrip", "traction", "transmission", "turnFast", "turnSlow", "userId" FROM "Garage";
DROP TABLE "Garage";
ALTER TABLE "new_Garage" RENAME TO "Garage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RaceSession_userId_status_idx" ON "RaceSession"("userId", "status");

-- Preserve legacy euro balances exactly once. Future writes use integer cents.
UPDATE "User" SET "moneyCents" = CAST(ROUND("money" * 100) AS INTEGER);
