#!/usr/bin/env sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
\getenv auth_password AUTH_DB_PASSWORD
\getenv game_password GAME_DB_PASSWORD
CREATE ROLE supabase_auth_admin LOGIN PASSWORD :'auth_password';
CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
ALTER ROLE supabase_auth_admin SET search_path = auth, public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE ROLE poketurismo_game LOGIN PASSWORD :'game_password';
CREATE SCHEMA game AUTHORIZATION poketurismo_game;
ALTER ROLE poketurismo_game SET search_path = game, public;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL
