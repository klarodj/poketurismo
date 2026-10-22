#!/usr/bin/env python3
"""Create local secrets once. Never overwrite an existing configuration or database."""
import argparse
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import time


def jwt(secret, role):
    def encode(value):
        return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).decode().rstrip('=')
    now = int(time.time())
    content = encode({'alg': 'HS256', 'typ': 'JWT'}) + '.' + encode({'role': role, 'iss': 'supabase', 'aud': 'authenticated', 'iat': now, 'exp': now + 10 * 365 * 86400})
    signature = base64.urlsafe_b64encode(hmac.new(secret.encode(), content.encode(), hashlib.sha256).digest()).decode().rstrip('=')
    return content + '.' + signature


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, default=Path('/home/klaro/poketurismo-data/accounts'))
    args = parser.parse_args()
    directory = args.data_dir.resolve()
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    config = directory / 'accounts.env'
    if config.exists():
        raise SystemExit('Configurazione già presente: non rigenerare i segreti di un database esistente.')
    password, auth_password, game_password, secret = (secrets.token_hex(32) for _ in range(4))
    values = {
        'POKETURISMO_ACCOUNTS_DATA_DIR': str(directory), 'POSTGRES_PASSWORD': password,
        'AUTH_DB_PASSWORD': auth_password, 'GAME_DB_PASSWORD': game_password, 'JWT_SECRET': secret,
        'DATABASE_URL': f'postgresql://poketurismo_game:{game_password}@127.0.0.1:5434/poketurismo?schema=game',
        'ADMIN_DATABASE_URL': f'postgresql://postgres:{password}@127.0.0.1:5434/poketurismo',
        'PUBLIC_URL': 'https://server-klaro.tail6c534c.ts.net',
        'AUTH_REDIRECT_URLS': 'https://server-klaro.tail6c534c.ts.net/**,https://server-klaro.tail6c534c.ts.net:8443/**',
        'SUPABASE_ANON_KEY': jwt(secret, 'anon'), 'SUPABASE_SERVICE_KEY': jwt(secret, 'service_role'),
        'AUTH_INTERNAL_URL': 'http://127.0.0.1:9999', 'AUTH_EMAIL_ENABLED': 'false', 'AUTH_GOOGLE_ENABLED': 'false',
        'GOOGLE_CLIENT_ID': '', 'GOOGLE_CLIENT_SECRET': '', 'SMTP_HOST': '', 'SMTP_PORT': '587',
        'SMTP_USER': '', 'SMTP_PASS': '', 'SMTP_FROM': '', 'LEGACY_OWNER_EMAIL': '', 'ADMIN_EMAILS': '',
    }
    descriptor = os.open(config, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w') as target:
        target.write(''.join(f'{key}={value}\n' for key, value in values.items()))
    print('Configurazione privata creata:', config)
    print('Google ed email sono disabilitati finché le credenziali non vengono configurate.')


if __name__ == '__main__':
    main()
