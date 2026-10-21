-- SQLite partial index: a player cannot start two active races concurrently.
CREATE UNIQUE INDEX "RaceSession_one_active_per_user" ON "RaceSession"("userId") WHERE "status" = 'active';
