CREATE TABLE "DriverDevelopment" (
  "userId" INTEGER NOT NULL PRIMARY KEY,
  "earlyPractice" INTEGER NOT NULL DEFAULT 0 CHECK ("earlyPractice" BETWEEN 0 AND 120),
  "referencePractice" INTEGER NOT NULL DEFAULT 0 CHECK ("referencePractice" BETWEEN 0 AND 120),
  "latePractice" INTEGER NOT NULL DEFAULT 0 CHECK ("latePractice" BETWEEN 0 AND 120),
  "techniquePractice" INTEGER NOT NULL DEFAULT 0 CHECK ("techniquePractice" BETWEEN 0 AND 60),
  "lessonRead" BOOLEAN NOT NULL DEFAULT false,
  "lessonPassed" BOOLEAN NOT NULL DEFAULT false,
  "routePractice" TEXT NOT NULL DEFAULT '{}',
  "trainingCourses" TEXT NOT NULL DEFAULT '{}',
  CONSTRAINT "DriverDevelopment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
